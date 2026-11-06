import { NextRequest, NextResponse } from "next/server";
import {
  createHash,
  createPrivateKey,
  createSign,
  KeyObject,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { sendServerSms } from "@/lib/sms";

export const dynamic = "force-dynamic";

const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const loginCollection = "phone_login_codes";
const recentRequests = new Map<string, number>();

const HASH_SALT = "gabvia_secure_salt_2026_wbt_phone_auth";
const AUTH_DOMAIN_SUFFIX = "@phone.gabvia.app";

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

function normalizePhone(rawPhone: string): string {
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]+/g, "");
  if (cleaned.startsWith("+")) cleaned = cleaned.substring(1);
  return cleaned.replace(/\D/g, "");
}

function hashOtp(phone: string, code: string): string {
  return createHash("sha256").update(`${phone}:${code}:${HASH_SALT}`).digest("hex");
}

function matchesOtpHash(phone: string, code: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashOtp(phone, code), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function getShadowEmail(cleanPhone: string): string {
  return `p_${cleanPhone}${AUTH_DOMAIN_SUFFIX}`;
}

function getDeterministicPassword(cleanPhone: string): string {
  const hash = createHash("sha256").update(`${HASH_SALT}:${cleanPhone}`).digest("hex");
  return `GbV!_${hash.slice(0, 20)}#26`;
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

async function getGoogleAccessToken(): Promise<string> {
  const { clientEmail, privateKey } = getAdminCredentials();
  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = `${encodeBase64Url(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  )}.${encodeBase64Url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  )}`;

  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  const signature = encodeBase64Url(signer.sign(privateKey));
  const assertion = `${unsignedToken}.${signature}`;

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

async function findOrCreateShadowUser(projectId: string, accessToken: string, cleanPhone: string) {
  const email = getShadowEmail(cleanPhone);
  const password = getDeterministicPassword(cleanPhone);

  // 1. Check if user already exists in Firebase Auth
  const queryRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        expression: [{ email: { op: "EQUAL", value: email } }],
        limit: 1,
      }),
      cache: "no-store",
    }
  );

  if (queryRes.ok) {
    const data = (await queryRes.json()) as { userInfo?: Array<{ localId?: string }> };
    const existingUid = data.userInfo?.[0]?.localId;
    if (existingUid) {
      return { id: existingUid, email, isNew: false };
    }
  }

  // 2. User does not exist, create in Firebase Auth
  const createRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        displayName: `user_${cleanPhone.slice(-4)}`,
        emailVerified: true,
      }),
      cache: "no-store",
    }
  );

  if (createRes.ok) {
    const createData = (await createRes.json()) as { localId?: string };
    if (createData.localId) {
      return { id: createData.localId, email, isNew: true };
    }
  }

  // Fallback: If creation collided or returned error, query again
  const fallbackRes = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:lookup`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email: [email] }),
      cache: "no-store",
    }
  );
  if (fallbackRes.ok) {
    const fallbackData = (await fallbackRes.json()) as { users?: Array<{ localId?: string }> };
    const fbUid = fallbackData.users?.[0]?.localId;
    if (fbUid) {
      return { id: fbUid, email, isNew: false };
    }
  }

  throw new Error("Unable to create or resolve shadow authentication user.");
}

async function checkProfileExists(projectId: string, accessToken: string, userId: string): Promise<boolean> {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/profiles/${userId}`;
    const res = await fetch(url, {
      method: "GET",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

function otpDocumentUrl(projectId: string, documentId: string) {
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${loginCollection}/${documentId}`;
}

async function getOtpRecord(projectId: string, accessToken: string, documentId: string) {
  const response = await fetch(otpDocumentUrl(projectId, documentId), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { fields?: Record<string, Record<string, unknown>> };
  const fields = decodeFirestoreFields(payload.fields);
  return {
    phone: String(fields.phone ?? ""),
    codeHash: String(fields.code_hash ?? ""),
    attempts: Number(fields.attempts ?? 0),
    expiresAt: Number(fields.expires_at ?? 0),
  };
}

async function patchOtpRecord(
  projectId: string,
  accessToken: string,
  documentId: string,
  fields: Record<string, unknown>
) {
  const mask = Object.keys(fields)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");
  await fetch(`${otpDocumentUrl(projectId, documentId)}?${mask}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
    cache: "no-store",
  });
}

async function deleteOtpRecord(projectId: string, accessToken: string, documentId: string) {
  await fetch(otpDocumentUrl(projectId, documentId), {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  }).catch(() => {});
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      action?: "send" | "verify";
      phone?: string;
      code?: string;
    };

    const action = body.action;
    const rawPhone = (body.phone || "").trim();

    if (!action || !["send", "verify"].includes(action)) {
      return NextResponse.json({ ok: false, error: "Valid action ('send' or 'verify') is required." }, { status: 400 });
    }

    const cleanPhone = normalizePhone(rawPhone);
    if (!cleanPhone || cleanPhone.length < 7) {
      return NextResponse.json({ ok: false, error: "Please enter a valid phone number." }, { status: 400 });
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      return NextResponse.json({ ok: false, error: "Firebase Project ID not configured." }, { status: 500 });
    }

    const accessToken = await getGoogleAccessToken();
    const documentId = createHash("sha256").update(cleanPhone).digest("hex");

    // ==========================================
    // ACTION: SEND PHONE OTP
    // ==========================================
    if (action === "send") {
      const requestKey = `${request.headers.get("x-forwarded-for") ?? "unknown"}:${cleanPhone}`;
      const lastRequest = recentRequests.get(requestKey) ?? 0;
      if (Date.now() - lastRequest < 45_000) {
        return NextResponse.json({
          ok: true,
          phone: cleanPhone,
          message: "A verification code was recently sent. Please check your SMS or wait a few moments to request another.",
        });
      }
      recentRequests.set(requestKey, Date.now());

      const code = String(randomInt(100000, 1000000));
      const now = new Date().toISOString();

      await deleteOtpRecord(projectId, accessToken, documentId);
      await patchOtpRecord(projectId, accessToken, documentId, {
        phone: firestoreString(cleanPhone),
        code_hash: firestoreString(hashOtp(cleanPhone, code)),
        attempts: firestoreInteger(0),
        expires_at: firestoreInteger(Date.now() + CODE_TTL_MS),
        created_at: firestoreTimestamp(now),
      });

      // Dispatch SMS
      const smsMessage = `Your Gabvia verification code is: ${code}. Valid for 10 minutes. Do not share this code.`;
      const smsResult = await sendServerSms({
        to: cleanPhone,
        message: smsMessage,
      });

      if (!smsResult.ok) {
        console.warn(`[PhoneOTP] SMS dispatch notice: ${smsResult.error}. Code was: ${code}`);
      }

      return NextResponse.json({
        ok: true,
        phone: cleanPhone,
        message: "Verification code sent via SMS.",
      });
    }

    // ==========================================
    // ACTION: VERIFY PHONE OTP
    // ==========================================
    if (action === "verify") {
      const code = (body.code ?? "").trim().replace(/\D/g, "");
      if (!/^\d{6}$/.test(code)) {
        return NextResponse.json({ ok: false, error: "Please enter the 6-digit verification code." }, { status: 400 });
      }

      const record = await getOtpRecord(projectId, accessToken, documentId);
      if (!record || !record.codeHash) {
        return NextResponse.json(
          { ok: false, error: "No pending verification code found. Please request a new code." },
          { status: 400 }
        );
      }

      if (Date.now() > record.expiresAt) {
        await deleteOtpRecord(projectId, accessToken, documentId);
        return NextResponse.json(
          { ok: false, error: "Your verification code has expired. Please request a new one." },
          { status: 400 }
        );
      }

      if (record.attempts >= MAX_ATTEMPTS) {
        await deleteOtpRecord(projectId, accessToken, documentId);
        return NextResponse.json(
          { ok: false, error: "Too many incorrect attempts. Please request a new verification code." },
          { status: 429 }
        );
      }

      if (!matchesOtpHash(cleanPhone, code, record.codeHash)) {
        await patchOtpRecord(projectId, accessToken, documentId, {
          attempts: firestoreInteger(record.attempts + 1),
        });
        const remaining = Math.max(0, MAX_ATTEMPTS - (record.attempts + 1));
        return NextResponse.json(
          { ok: false, error: `Invalid code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` },
          { status: 400 }
        );
      }

      // Validated! Clean up single-use record
      await deleteOtpRecord(projectId, accessToken, documentId);

      // Find or create shadow auth user
      const user = await findOrCreateShadowUser(projectId, accessToken, cleanPhone);
      const isProfileExisting = await checkProfileExists(projectId, accessToken, user.id);
      const customToken = createFirebaseCustomToken(user.id);

      return NextResponse.json({
        ok: true,
        custom_token: customToken,
        user_id: user.id,
        phone: cleanPhone,
        shadow_email: user.email,
        shadow_password: getDeterministicPassword(cleanPhone),
        is_new_user: !isProfileExisting,
        message: "Phone verification successful.",
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("[PhoneOTP] Handler error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "An unexpected error occurred during phone verification." },
      { status: 500 }
    );
  }
}

