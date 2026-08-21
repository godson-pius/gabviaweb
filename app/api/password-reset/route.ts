import { NextRequest, NextResponse } from "next/server";
import { createHash, createPrivateKey, createSign, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_TTL_MS = 10 * 60 * 1000;
const TOKEN_TTL_MS = 10 * 60 * 1000;
const MAX_CODE_ATTEMPTS = 5;
const resetCollection = "password_reset_codes";
const recentRequests = new Map<string, number>();

type FirestoreField = Record<string, string | number | null>;
type ResetRecord = {
  email: string;
  userId: string;
  codeHash: string;
  attempts: number;
  expiresAt: number;
  resetTokenHash?: string;
  resetTokenExpiresAt?: number;
  consumedAt?: string;
};

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function normalizePrivateKey(value: string) {
  let key = value.trim();
  if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
    try {
      const parsed = JSON.parse(key);
      key = typeof parsed === "string" ? parsed : key.slice(1, -1);
    } catch {
      key = key.slice(1, -1);
    }
  }
  return key.replace(/\\+n/g, "\n").replace(/\r\n/g, "\n").trim();
}

function firestoreString(value: string) {
  return { stringValue: value };
}

function firestoreInteger(value: number) {
  return { integerValue: String(value) };
}

function firestoreTimestamp(value: string) {
  return { timestampValue: value };
}

function decodeFirestoreValue(value: Record<string, unknown> | undefined) {
  if (!value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("integerValue" in value) return Number(value.integerValue);
  return null;
}

function decodeFirestoreFields(fields: Record<string, Record<string, unknown>> | undefined) {
  return Object.fromEntries(Object.entries(fields ?? {}).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 160) : "";
}

function timestampMilliseconds(value: unknown) {
  if (typeof value === "number") return value;
  const normalized = String(value ?? "").trim();
  const numeric = Number(normalized);
  if (Number.isFinite(numeric) && numeric > 0) return numeric < 1_000_000_000_000 ? numeric * 1000 : numeric;
  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function hashValue(value: string) {
  const secret = process.env.PASSWORD_RESET_SECRET || process.env.FIREBASE_ADMIN_PRIVATE_KEY || "gabvia-password-reset";
  return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}

function matchesHash(value: string, expectedHash: string) {
  const actual = Buffer.from(hashValue(value), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

async function getGoogleAccessToken() {
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!clientEmail || !rawPrivateKey) throw new Error("Password reset requires Firebase admin credentials.");
  let privateKey;
  try {
    privateKey = createPrivateKey(normalizePrivateKey(rawPrivateKey));
  } catch {
    throw new Error("FIREBASE_ADMIN_PRIVATE_KEY is not a valid PEM private key. Paste the complete service-account key, keeping its BEGIN/END lines and newline escapes.");
  }

  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = `${encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${encodeBase64Url(JSON.stringify({ iss: clientEmail, scope: "https://www.googleapis.com/auth/cloud-platform", aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600 }))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  const assertion = `${unsignedToken}.${encodeBase64Url(signer.sign(privateKey))}`;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
  });
  const payload = await response.json() as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description ?? "Could not authenticate the Firebase admin service account.");
  return payload.access_token;
}

async function findUserByEmail(projectId: string, accessToken: string, email: string) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ returnUserInfo: true, limit: "1", expression: [{ email }] }),
    cache: "no-store",
  });
  const payload = await response.json() as { userInfo?: Array<{ localId?: string; email?: string }>; error?: { message?: string } };
  if (!response.ok) {
    if (payload.error?.message === "USER_NOT_FOUND") return null;
    throw new Error(payload.error?.message ?? "Could not look up the account.");
  }
  const user = payload.userInfo?.[0];
  return user?.localId && user.email ? { id: user.localId, email: user.email.toLowerCase() } : null;
}

function resetDocumentUrl(projectId: string, documentId: string) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${resetCollection}/${encodeURIComponent(documentId)}`;
}

async function patchResetRecord(projectId: string, accessToken: string, documentId: string, fields: Record<string, FirestoreField>) {
  const response = await fetch(resetDocumentUrl(projectId, documentId), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    throw new Error(payload?.error?.message ?? "Could not save the password reset request.");
  }
}

async function getResetRecord(projectId: string, accessToken: string, documentId: string) {
  const response = await fetch(resetDocumentUrl(projectId, documentId), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  const payload = await response.json() as { fields?: Record<string, Record<string, unknown>>; error?: { message?: string } };
  if (!response.ok) throw new Error(payload.error?.message ?? "Could not read the password reset request.");
  const fields = decodeFirestoreFields(payload.fields) as Record<string, unknown>;
  const createdAt = timestampMilliseconds(fields.created_at);
  const storedExpiresAt = timestampMilliseconds(fields.expires_at);
  return {
    email: String(fields.email ?? ""),
    userId: String(fields.user_id ?? ""),
    codeHash: String(fields.code_hash ?? ""),
    attempts: Number(fields.attempts ?? 0),
    expiresAt: Number.isFinite(storedExpiresAt) ? storedExpiresAt : Number.isFinite(createdAt) ? createdAt + CODE_TTL_MS : Number.NaN,
    resetTokenHash: fields.reset_token_hash ? String(fields.reset_token_hash) : undefined,
    resetTokenExpiresAt: fields.reset_token_expires_at ? timestampMilliseconds(fields.reset_token_expires_at) : undefined,
    consumedAt: fields.consumed_at ? String(fields.consumed_at) : undefined,
  } satisfies ResetRecord;
}

async function deleteResetRecord(projectId: string, accessToken: string, documentId: string) {
  const response = await fetch(resetDocumentUrl(projectId, documentId), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok && response.status !== 404) throw new Error("Could not replace the password reset request.");
}

function makeResetEmailHtml(code: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://gabvia.app").replace(/\/+$/, "");
  const logoUrl = `${siteUrl}/logo.png`;
  const year = new Date().getUTCFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#eef3f8;color:#17243a;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">Your Gabvia password reset code is ${code}.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef3f8">
      <tr>
        <td align="center" style="padding:34px 16px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #e1e8f0;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(30,55,85,.08)">
            <tr>
              <td style="padding:28px 34px;background:#16243b">
                <img src="${logoUrl}" width="48" height="48" alt="Gabvia" style="display:inline-block;width:48px;height:48px;border:0;border-radius:14px;vertical-align:middle;background:#ffffff" />
                <span style="display:inline-block;margin-left:12px;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-.5px;vertical-align:middle">gabvia</span>
              </td>
            </tr>
            <tr>
              <td style="padding:42px 44px 36px">
                <p style="margin:0 0 12px;color:#287dff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Password reset</p>
                <h1 style="margin:0 0 24px;color:#17243a;font-size:30px;line-height:1.2;letter-spacing:-.8px;font-weight:700">Your reset code</h1>
                <p style="margin:0;color:#35445a;font-size:16px;line-height:1.75">Enter this code in the Gabvia app to choose a new password:</p>
                <div style="margin:24px 0;padding:20px;text-align:center;border:1px solid #dce7f2;border-radius:14px;background:#f8fbfe;color:#17243a;font-size:34px;font-weight:700;letter-spacing:8px">${code}</div>
                <p style="margin:0;color:#68788d;font-size:14px;line-height:1.7">This code expires in 10 minutes and can be used only once. If you didn’t request a password reset, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 34px;border-top:1px solid #edf1f5;background:#fbfcfe;color:#8491a3;font-size:12px;line-height:1.6">
                <strong style="color:#526177">gabvia</strong><br />
                Different languages. One conversation.<br />
                © ${year} Gabvia · <a href="${siteUrl}" style="color:#287dff;text-decoration:none">gabvia.app</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendResetCodeEmail(email: string, code: string) {
  const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEND;
  if (!resendApiKey) throw new Error("Resend is not configured.");
  const from = process.env.RESEND_FROM_EMAIL || "Gabvia <noreply@gabvia.app>";
  const fromAddress = from.match(/<([^>]+)>/)?.[1] ?? from;
  if (!EMAIL_PATTERN.test(fromAddress)) throw new Error("RESEND_FROM_EMAIL is not a valid email address.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Your Gabvia password reset code",
      text: `Your Gabvia password reset code is ${code}.\n\nEnter it in the Gabvia app to choose a new password. This code expires in 10 minutes and can be used only once. If you did not request a password reset, you can safely ignore this email.\n\n— The Gabvia team`,
      html: makeResetEmailHtml(code),
    }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as { message?: string; error?: { message?: string } } | null;
  if (!response.ok) throw new Error(payload?.message ?? payload?.error?.message ?? `Resend returned HTTP ${response.status}.`);
}

async function updateAuthPassword(projectId: string, accessToken: string, userId: string, password: string) {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:update`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ localId: userId, password, returnSecureToken: false }),
    cache: "no-store",
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: { message?: string } } | null;
    if (payload?.error?.message === "USER_NOT_FOUND") throw new Error("This account is not present in the Firebase project used by the deployed backend. Check that FIREBASE_PROJECT_ID matches the mobile app.");
    throw new Error(payload?.error?.message ?? "Could not update the password.");
  }
}

function genericResponse() {
  return NextResponse.json({ ok: true, message: "If an account exists for that email, we sent a password reset code." });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { action?: "request" | "verify" | "complete"; email?: string; code?: string; reset_token?: string; new_password?: string };
    const action = body.action;
    const email = normalizeEmail(body.email);
    if (!action || !["request", "verify", "complete"].includes(action)) return NextResponse.json({ ok: false, error: "A valid password reset action is required." }, { status: 400 });
    if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });

    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error("Firebase server configuration is missing.");
    const documentId = createHash("sha256").update(email).digest("hex");
    const accessToken = await getGoogleAccessToken();

    if (action === "request") {
      const requestKey = `${request.headers.get("x-forwarded-for") ?? "unknown"}:${email}`;
      const lastRequest = recentRequests.get(requestKey) ?? 0;
      if (Date.now() - lastRequest < 60_000) return genericResponse();
      recentRequests.set(requestKey, Date.now());

      const user = await findUserByEmail(projectId, accessToken, email);
      if (!user) return genericResponse();

      const code = String(randomInt(100000, 1000000));
      const now = new Date().toISOString();
      await deleteResetRecord(projectId, accessToken, documentId);
      await patchResetRecord(projectId, accessToken, documentId, {
        email: firestoreString(user.email),
        user_id: firestoreString(user.id),
        code_hash: firestoreString(hashValue(code)),
        attempts: firestoreInteger(0),
        expires_at: firestoreInteger(Date.now() + CODE_TTL_MS),
        created_at: firestoreTimestamp(now),
      });
      try {
        await sendResetCodeEmail(user.email, code);
      } catch (error) {
        await deleteResetRecord(projectId, accessToken, documentId);
        throw error;
      }
      return genericResponse();
    }

    const record = await getResetRecord(projectId, accessToken, documentId);
    if (!record || record.consumedAt) return NextResponse.json({ ok: false, error: "This reset request is invalid. Request a new code." }, { status: 400 });
    if (record.expiresAt <= Date.now()) return NextResponse.json({ ok: false, error: "This reset code has expired. Request a new one." }, { status: 400 });

    if (action === "verify") {
      if (!/^\d{6}$/.test(body.code ?? "")) return NextResponse.json({ ok: false, error: "Enter the six-digit reset code." }, { status: 400 });
      if (record.resetTokenHash || record.attempts >= MAX_CODE_ATTEMPTS) return NextResponse.json({ ok: false, error: "This reset code is no longer valid. Request a new one." }, { status: 400 });
      if (!matchesHash(body.code ?? "", record.codeHash)) {
        await patchResetRecord(projectId, accessToken, documentId, { attempts: firestoreInteger(record.attempts + 1) });
        return NextResponse.json({ ok: false, error: "That reset code is incorrect." }, { status: 400 });
      }

      const resetToken = randomBytes(32).toString("hex");
      await patchResetRecord(projectId, accessToken, documentId, {
        code_hash: firestoreString(""),
        reset_token_hash: firestoreString(hashValue(resetToken)),
        reset_token_expires_at: firestoreInteger(Date.now() + TOKEN_TTL_MS),
      });
      return NextResponse.json({ ok: true, reset_token: resetToken });
    }

    const password = body.new_password ?? "";
    if (password.length < 6) return NextResponse.json({ ok: false, error: "Your new password must be at least 6 characters." }, { status: 400 });
    if (!body.reset_token || !record.resetTokenHash || !record.resetTokenExpiresAt || !Number.isFinite(record.resetTokenExpiresAt) || record.resetTokenExpiresAt <= Date.now() || !matchesHash(body.reset_token, record.resetTokenHash)) return NextResponse.json({ ok: false, error: "Your reset session is invalid or expired. Start again." }, { status: 400 });

    await patchResetRecord(projectId, accessToken, documentId, { consumed_at: firestoreTimestamp(new Date().toISOString()) });
    await updateAuthPassword(projectId, accessToken, record.userId, password);
    await deleteResetRecord(projectId, accessToken, documentId);
    return NextResponse.json({ ok: true, message: "Your password has been updated. You can now sign in." });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not complete the password reset." }, { status: 500 });
  }
}
