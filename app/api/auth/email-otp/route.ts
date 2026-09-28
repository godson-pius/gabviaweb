import { after, NextRequest, NextResponse } from "next/server";
import {
  createHash,
  createPrivateKey,
  createSign,
  KeyObject,
  randomInt,
  timingSafeEqual,
} from "node:crypto";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const loginCollection = "email_login_codes";
const recentRequests = new Map<string, number>();

type FirestoreField = Record<string, string | number | null>;

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
  return Object.fromEntries(
    Object.entries(fields ?? {}).map(([key, value]) => [key, decodeFirestoreValue(value)])
  );
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase().slice(0, 160) : "";
}

function hashValue(value: string) {
  const secret =
    process.env.PASSWORD_RESET_SECRET ||
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
    "gabvia-auth-otp-secret";
  return createHash("sha256").update(`${secret}:${value}`).digest("hex");
}

function matchesHash(value: string, expectedHash: string) {
  const actual = Buffer.from(hashValue(value), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function getAdminCredentials(): { clientEmail: string; privateKey: KeyObject } {
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
  if (!clientEmail || !rawPrivateKey) {
    throw new Error("Authentication requires Firebase admin credentials.");
  }
  const privateKey = createPrivateKey(normalizePrivateKey(rawPrivateKey));
  return { clientEmail, privateKey };
}

async function getGoogleAccessToken() {
  const { clientEmail, privateKey } = getAdminCredentials();
  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = `${encodeBase64Url(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  )}.${encodeBase64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  )}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  const assertion = `${unsignedToken}.${encodeBase64Url(signer.sign(privateKey))}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    cache: "no-store",
  });

  const payload = (await response.json()) as { access_token?: string; error_description?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(payload.error_description ?? "Could not authenticate the Firebase admin service account.");
  }
  return payload.access_token;
}

function createFirebaseCustomToken(userId: string): string {
  const { clientEmail, privateKey } = getAdminCredentials();
  const now = Math.floor(Date.now() / 1000);
  const header = encodeBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      iss: clientEmail,
      sub: clientEmail,
      aud: "https://identitytoolkit.googleapis.com/google.identity.identitytoolkit.v1.IdentityToolkit",
      iat: now,
      exp: now + 3600,
      uid: userId,
    })
  );

  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${payload}`);
  return `${header}.${payload}.${encodeBase64Url(signer.sign(privateKey))}`;
}

async function findUserByEmail(projectId: string, accessToken: string, email: string) {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ returnUserInfo: true, limit: "1", expression: [{ email }] }),
      cache: "no-store",
    }
  );

  const payload = (await response.json()) as {
    userInfo?: Array<{ localId?: string; email?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    if (payload.error?.message === "USER_NOT_FOUND") return null;
    throw new Error(payload.error?.message ?? "Could not look up the account.");
  }

  const user = payload.userInfo?.[0];
  return user?.localId && user.email ? { id: user.localId, email: user.email.toLowerCase() } : null;
}

async function findUserInFirestore(projectId: string, accessToken: string, email: string) {
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "profiles" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "email" },
                op: "EQUAL",
                value: { stringValue: email },
              },
            },
            limit: 1,
          },
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) return null;
    const results = (await res.json()) as Array<{
      document?: {
        name?: string;
        fields?: Record<string, { stringValue?: string }>;
      };
    }>;

    for (const item of results) {
      if (item.document?.name) {
        const parts = item.document.name.split("/");
        const id = parts[parts.length - 1];
        const docEmail = item.document.fields?.email?.stringValue?.toLowerCase() || email;
        if (id) return { id, email: docEmail };
      }
    }
  } catch (err) {
    console.warn("Firestore lookup by email failed:", err);
  }
  return null;
}

async function findEmailByUsername(projectId: string, accessToken: string, username: string) {
  const clean = username.toLowerCase().replace(/^@+/, "").trim();
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "profiles" }],
            where: {
              fieldFilter: {
                field: { fieldPath: "username_lower" },
                op: "EQUAL",
                value: { stringValue: clean },
              },
            },
            limit: 1,
          },
        }),
        cache: "no-store",
      }
    );

    if (!res.ok) return null;
    const results = (await res.json()) as Array<{
      document?: {
        name?: string;
        fields?: Record<string, { stringValue?: string }>;
      };
    }>;

    for (const item of results) {
      if (item.document?.name && item.document.fields?.email?.stringValue) {
        const parts = item.document.name.split("/");
        const id = parts[parts.length - 1];
        return { id, email: item.document.fields.email.stringValue.toLowerCase() };
      }
    }
  } catch (err) {
    console.warn("Firestore lookup by username failed:", err);
  }
  return null;
}

function otpDocumentUrl(projectId: string, documentId: string) {
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(
    projectId
  )}/databases/(default)/documents/${loginCollection}/${encodeURIComponent(documentId)}`;
}

async function patchOtpRecord(
  projectId: string,
  accessToken: string,
  documentId: string,
  fields: Record<string, FirestoreField>
) {
  const response = await fetch(otpDocumentUrl(projectId, documentId), {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Could not save the login OTP request.");
  }
}

async function getOtpRecord(projectId: string, accessToken: string, documentId: string) {
  const response = await fetch(otpDocumentUrl(projectId, documentId), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  const payload = (await response.json()) as {
    fields?: Record<string, Record<string, unknown>>;
    error?: { message?: string };
  };
  if (!response.ok) throw new Error(payload.error?.message ?? "Could not read the login request.");
  const fields = decodeFirestoreFields(payload.fields) as Record<string, unknown>;
  return {
    email: String(fields.email ?? ""),
    userId: String(fields.user_id ?? ""),
    codeHash: String(fields.code_hash ?? ""),
    attempts: Number(fields.attempts ?? 0),
    expiresAt: Number(fields.expires_at ?? 0),
  };
}

async function deleteOtpRecord(projectId: string, accessToken: string, documentId: string) {
  await fetch(otpDocumentUrl(projectId, documentId), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  }).catch(() => {});
}

function makeLoginEmailHtml(code: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.gabvia.app").replace(/\/+$/, "");
  const logoUrl = `${siteUrl}/logo.png`;
  const year = new Date().getUTCFullYear();

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f3f7fb;color:#17243a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-text-size-adjust:100%">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f3f7fb">
      <tr>
        <td align="center" style="padding:40px 16px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;box-shadow:0 12px 36px rgba(15,23,42,0.06)">
            <tr>
              <td style="padding:28px 36px;background:#0f172a">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td>
                      <img src="${logoUrl}" width="42" height="42" alt="Gabvia" style="display:block;width:42px;height:42px;border:0;border-radius:12px;background:#ffffff" />
                    </td>
                    <td style="padding-left:14px">
                      <span style="color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px">Gabvia</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 36px 32px">
                <p style="margin:0 0 10px;color:#0284c7;font-size:12px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase">Instant Login</p>
                <h1 style="margin:0 0 16px;color:#0f172a;font-size:26px;line-height:1.25;letter-spacing:-0.6px;font-weight:800">Your Login Code</h1>
                <p style="margin:0;color:#475569;font-size:15px;line-height:1.6">Enter this 6-digit code in Gabvia to securely log into your account:</p>
                <div style="margin:26px 0;padding:22px;text-align:center;border:1.5px solid #bae6fd;border-radius:16px;background:#f0f9ff;color:#0369a1;font-size:36px;font-weight:800;letter-spacing:10px">${code}</div>
                <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">This verification code expires in <strong>10 minutes</strong> and can only be used once. If you did not request this login code, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 36px;border-top:1px solid #f1f5f9;background:#f8fafc;color:#94a3b8;font-size:12px;line-height:1.6">
                <strong style="color:#475569">Gabvia</strong> — Different languages. One conversation.<br />
                © ${year} Gabvia · <a href="${siteUrl}" style="color:#0284c7;text-decoration:none">gabvia.app</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function sendLoginEmail(email: string, code: string) {
  const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEND;
  if (!resendApiKey) throw new Error("Email service is not configured.");
  const from = process.env.RESEND_FROM_EMAIL || "Gabvia <noreply@gabvia.app>";
  const fromAddress = from.match(/<([^>]+)>/)?.[1] ?? from;
  if (!EMAIL_PATTERN.test(fromAddress)) throw new Error("RESEND_FROM_EMAIL is not a valid email address.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [email],
      subject: `Your Gabvia login code is ${code}`,
      text: `Your Gabvia login code is ${code}.\n\nEnter this code in the app to sign in. This code expires in 10 minutes.\n\nIf you did not request this code, you can safely ignore this email.\n\n— The Gabvia team`,
      html: makeLoginEmailHtml(code),
    }),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as {
    message?: string;
    error?: { message?: string };
  } | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? payload?.error?.message ?? `Resend returned HTTP ${response.status}.`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      action?: "send" | "verify";
      identifier?: string;
      email?: string;
      code?: string;
    };

    const action = body.action;
    const rawIdentifier = (body.identifier || body.email || "").trim();

    if (!action || !["send", "verify"].includes(action)) {
      return NextResponse.json({ ok: false, error: "Valid action ('send' or 'verify') is required." }, { status: 400 });
    }

    if (!rawIdentifier) {
      return NextResponse.json({ ok: false, error: "Please enter your email or username." }, { status: 400 });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) throw new Error("Firebase server configuration is missing.");
    const accessToken = await getGoogleAccessToken();

    // 1. Resolve email
    let resolvedEmail = rawIdentifier.toLowerCase();
    let resolvedUserId: string | null = null;

    if (EMAIL_PATTERN.test(rawIdentifier)) {
      resolvedEmail = normalizeEmail(rawIdentifier);
      const user = (await findUserByEmail(projectId, accessToken, resolvedEmail)) ||
                   (await findUserInFirestore(projectId, accessToken, resolvedEmail));
      if (!user) {
        return NextResponse.json(
          { ok: false, error: "No account found with this email. Please check your spelling or sign up." },
          { status: 404 }
        );
      }
      resolvedUserId = user.id;
    } else {
      // Input is a username
      const user = await findEmailByUsername(projectId, accessToken, rawIdentifier);
      if (!user || !user.email) {
        return NextResponse.json(
          { ok: false, error: `No account was found with the username "${rawIdentifier}". Please check the spelling or enter your email.` },
          { status: 404 }
        );
      }
      resolvedEmail = user.email;
      resolvedUserId = user.id;
    }

    const documentId = createHash("sha256").update(resolvedEmail).digest("hex");

    // Action 1: SEND CODE
    if (action === "send") {
      const requestKey = `${request.headers.get("x-forwarded-for") ?? "unknown"}:${resolvedEmail}`;
      const lastRequest = recentRequests.get(requestKey) ?? 0;
      if (Date.now() - lastRequest < 45_000) {
        return NextResponse.json({
          ok: true,
          email: resolvedEmail,
          message: "A login code was recently sent. Please check your inbox or wait a moment to request another.",
        });
      }
      recentRequests.set(requestKey, Date.now());

      const code = String(randomInt(100000, 1000000));
      const now = new Date().toISOString();

      await deleteOtpRecord(projectId, accessToken, documentId);
      await patchOtpRecord(projectId, accessToken, documentId, {
        email: firestoreString(resolvedEmail),
        user_id: firestoreString(resolvedUserId),
        code_hash: firestoreString(hashValue(code)),
        attempts: firestoreInteger(0),
        expires_at: firestoreInteger(Date.now() + CODE_TTL_MS),
        created_at: firestoreTimestamp(now),
      });

      after(async () => {
        try {
          await sendLoginEmail(resolvedEmail, code);
        } catch (mailError) {
          console.error("[EmailOTP] Failed to send login email:", mailError);
        }
      });

      return NextResponse.json({
        ok: true,
        email: resolvedEmail,
        message: "Login code sent to your email.",
      });
    }

    // Action 2: VERIFY CODE
    if (action === "verify") {
      const code = (body.code ?? "").trim();
      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json({ ok: false, error: "Please enter the 6-digit verification code." }, { status: 400 });
      }

      const record = await getOtpRecord(projectId, accessToken, documentId);
      if (!record || !record.codeHash) {
        return NextResponse.json(
          { ok: false, error: "No pending login code found. Please request a new one." },
          { status: 400 }
        );
      }

      if (Date.now() > record.expiresAt) {
        await deleteOtpRecord(projectId, accessToken, documentId);
        return NextResponse.json(
          { ok: false, error: "Your login code has expired. Please request a new one." },
          { status: 400 }
        );
      }

      if (record.attempts >= MAX_ATTEMPTS) {
        await deleteOtpRecord(projectId, accessToken, documentId);
        return NextResponse.json(
          { ok: false, error: "Too many incorrect attempts. Please request a new code." },
          { status: 429 }
        );
      }

      if (!matchesHash(code, record.codeHash)) {
        await patchOtpRecord(projectId, accessToken, documentId, {
          attempts: firestoreInteger(record.attempts + 1),
        });
        const remaining = Math.max(0, MAX_ATTEMPTS - (record.attempts + 1));
        return NextResponse.json(
          { ok: false, error: `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` },
          { status: 400 }
        );
      }

      // Validated! Delete the single-use record
      await deleteOtpRecord(projectId, accessToken, documentId);

      // Generate a Firebase custom token for this user
      const customToken = createFirebaseCustomToken(record.userId);

      return NextResponse.json({
        ok: true,
        custom_token: customToken,
        user_id: record.userId,
        email: resolvedEmail,
        message: "Authentication successful.",
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("[EmailOTP] Handler error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "An unexpected error occurred during email sign in." },
      { status: 500 }
    );
  }
}
