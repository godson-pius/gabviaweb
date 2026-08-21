import { NextRequest, NextResponse } from "next/server";
import { createSign, randomUUID } from "node:crypto";

export const dynamic = "force-dynamic";

type EmailTarget = "users" | "waitlist" | "all";
type AuthUser = { email?: string; disabled?: boolean };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 5000;
const RESEND_BATCH_SIZE = 100;

function encodeBase64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function decodeFirestoreValue(value: Record<string, unknown> | undefined): unknown {
  if (!value) return null;
  if ("stringValue" in value) return value.stringValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  return null;
}

function decodeFirestoreFields(fields: Record<string, Record<string, unknown>> | undefined) {
  return Object.fromEntries(Object.entries(fields ?? {}).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

async function authorizeAdmin(request: NextRequest) {
  const apiKey = process.env.FIREBASE_API_KEY;
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!apiKey || !token) throw new Error("Sign in is required.");

  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken: token }),
    cache: "no-store",
  });
  const payload = await response.json() as { users?: Array<{ email?: string }> };
  const email = payload.users?.[0]?.email?.toLowerCase();
  const allowedEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  if (!response.ok || !email) throw new Error("Your session is invalid or expired.");
  if (!allowedEmails.length || !allowedEmails.includes(email)) throw new Error("This account is not on the Gabvia admin allowlist.");

  const roleEntries = (process.env.ADMIN_ROLES ?? "").split(",").map((entry) => entry.trim()).filter(Boolean);
  const roleEntry = roleEntries.find((entry) => entry.toLowerCase().startsWith(`${email}=`) || entry.toLowerCase().startsWith(`${email}:`));
  const role = roleEntry?.split(/[=:]/)[1]?.trim().toLowerCase() || "owner";
  if (!["owner", "admin"].includes(role)) throw new Error("Only owner or admin roles can send bulk emails.");
  return { email, role };
}

async function getGoogleAccessToken() {
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!clientEmail || !privateKey) throw new Error("Bulk email requires FIREBASE_ADMIN_CLIENT_EMAIL and FIREBASE_ADMIN_PRIVATE_KEY to read Firebase Auth users.");

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
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description ?? "Could not authenticate the Firebase service account.");
  return payload.access_token;
}

async function getAuthEmails(projectId: string, accessToken: string) {
  const emails: string[] = [];
  let nextPageToken = "";
  let pageCount = 0;

  do {
    const params = new URLSearchParams({ maxResults: "1000" });
    if (nextPageToken) params.set("nextPageToken", nextPageToken);
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/accounts:batchGet?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    const payload = await response.json() as { users?: AuthUser[]; nextPageToken?: string; error?: { message?: string } };
    if (!response.ok) throw new Error(payload.error?.message ?? "Could not retrieve registered user emails from Firebase Auth.");
    for (const user of payload.users ?? []) {
      const email = user.email?.trim().toLowerCase() ?? "";
      if (!user.disabled && EMAIL_PATTERN.test(email)) emails.push(email);
    }
    nextPageToken = payload.nextPageToken ?? "";
    pageCount += 1;
  } while (nextPageToken && pageCount < 100);

  return emails;
}

async function getWaitlistEmails(projectId: string, apiKey: string) {
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents:runQuery?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "waitlist" }] } }),
    cache: "no-store",
  });
  const payload = await response.json() as Array<{ document?: { fields?: Record<string, Record<string, unknown>> }; error?: { message?: string } }>;
  if (!response.ok) throw new Error(payload?.[0]?.error?.message ?? "Could not retrieve waitlist emails.");

  return payload.flatMap((row) => {
    const email = String(decodeFirestoreFields(row.document?.fields).email ?? "").trim().toLowerCase();
    return EMAIL_PATTERN.test(email) ? [email] : [];
  });
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function makeEmailHtml(subject: string, message: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://gabvia.app").replace(/\/+$/, "");
  const logoUrl = `${siteUrl}/logo.png`;
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\r?\n/g, "<br />");
  const year = new Date().getUTCFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#eef3f8;color:#17243a;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${safeSubject}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef3f8">
      <tr>
        <td align="center" style="padding:34px 16px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #e1e8f0;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(30,55,85,.08)">
            <tr>
              <td style="padding:28px 34px;background:#16243b">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td valign="middle">
                      <img src="${logoUrl}" width="48" height="48" alt="Gabvia" style="display:inline-block;width:48px;height:48px;border:0;border-radius:14px;vertical-align:middle;background:#ffffff" />
                      <span style="display:inline-block;margin-left:12px;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-.5px;vertical-align:middle">gabvia</span>
                    </td>
                    <td align="right" valign="middle" style="color:#a9bad1;font-size:12px;letter-spacing:1.2px;text-transform:uppercase">Community note</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:42px 44px 36px">
                <p style="margin:0 0 12px;color:#287dff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">From Gabvia</p>
                <h1 style="margin:0 0 24px;color:#17243a;font-size:30px;line-height:1.2;letter-spacing:-.8px;font-weight:700">${safeSubject}</h1>
                <div style="padding:24px 26px;border:1px solid #e3eaf2;border-radius:14px;background:#f8fbfe;color:#35445a;font-size:16px;line-height:1.75">${safeMessage}</div>
                <p style="margin:28px 0 0;color:#68788d;font-size:14px;line-height:1.7">Thank you for being part of the Gabvia community.</p>
                <p style="margin:20px 0 0"><a href="${siteUrl}" style="display:inline-block;color:#287dff;font-size:14px;font-weight:700;text-decoration:none">Visit gabvia.app →</a></p>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 34px;border-top:1px solid #edf1f5;background:#fbfcfe;color:#8491a3;font-size:12px;line-height:1.6">
                <strong style="color:#526177">gabvia</strong><br />
                Meaningful conversations, wherever you are.<br />
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

async function sendBatch(apiKey: string, from: string, subject: string, message: string, recipients: string[], batchNumber: number) {
  const response = await fetch("https://api.resend.com/emails/batch", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `gabvia-admin-email-${batchNumber}-${randomUUID()}`,
    },
    body: JSON.stringify(recipients.map((recipient) => ({
      from,
      to: [recipient],
      subject,
      text: message,
      html: makeEmailHtml(subject, message),
    }))),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as { message?: string; error?: { message?: string } } | null;
  if (!response.ok) throw new Error(payload?.message ?? payload?.error?.message ?? `Resend returned HTTP ${response.status}.`);
}

async function writeAuditLog(projectId: string, accessToken: string, entry: { adminEmail: string; target: EmailTarget; sent: number }) {
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/admin_audit_logs?documentId=${randomUUID()}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        admin_email: { stringValue: entry.adminEmail },
        action: { stringValue: "bulk_email" },
        user_id: { stringValue: `${entry.target}:${entry.sent} recipients` },
        created_at: { timestampValue: new Date().toISOString() },
      }
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Could not write bulk email audit log.");
}

export async function POST(request: NextRequest) {
  let sent = 0;
  try {
    const { email: adminEmail } = await authorizeAdmin(request);
    const body = await request.json() as { target?: EmailTarget; subject?: string; message?: string };
    const target = body.target;
    const subject = body.subject?.trim() ?? "";
    const message = body.message?.trim() ?? "";
    if (!target || !["users", "waitlist", "all"].includes(target)) return NextResponse.json({ ok: false, error: "Choose a valid recipient group." }, { status: 400 });
    if (!subject || subject.length > 160) return NextResponse.json({ ok: false, error: "Add a subject between 1 and 160 characters." }, { status: 400 });
    if (!message || message.length > 20_000) return NextResponse.json({ ok: false, error: "Add a message between 1 and 20,000 characters." }, { status: 400 });

    const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEND;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const firebaseApiKey = process.env.FIREBASE_API_KEY;
    const from = process.env.RESEND_FROM_EMAIL || "Gabvia <noreply@gabvia.app>";
    if (!resendApiKey) throw new Error("Resend is not configured. Add RESEND_API_KEY (or RESEND) to the web environment.");
    if (!projectId || !firebaseApiKey) throw new Error("Firebase web configuration is missing.");
    if (!from || !EMAIL_PATTERN.test(from.match(/<([^>]+)>/)?.[1] ?? from)) throw new Error("Add a verified RESEND_FROM_EMAIL address to the web environment.");

    const accessToken = target === "waitlist" ? "" : await getGoogleAccessToken();
    const [userEmails, waitlistEmails] = await Promise.all([
      target === "waitlist" ? Promise.resolve([]) : getAuthEmails(projectId, accessToken),
      target === "users" ? Promise.resolve([]) : getWaitlistEmails(projectId, firebaseApiKey),
    ]);
    const recipients = Array.from(new Set([...userEmails, ...waitlistEmails]));
    if (!recipients.length) return NextResponse.json({ ok: false, error: "No valid email recipients were found for that group." }, { status: 404 });
    if (recipients.length > MAX_RECIPIENTS) return NextResponse.json({ ok: false, error: `This campaign has ${recipients.length.toLocaleString()} recipients. Limit a campaign to ${MAX_RECIPIENTS.toLocaleString()} recipients.` }, { status: 400 });

    for (let index = 0; index < recipients.length; index += RESEND_BATCH_SIZE) {
      const batch = recipients.slice(index, index + RESEND_BATCH_SIZE);
      await sendBatch(resendApiKey, from, subject, message, batch, Math.floor(index / RESEND_BATCH_SIZE));
      sent += batch.length;
    }
    if (accessToken) {
      try { await writeAuditLog(projectId, accessToken, { adminEmail, target, sent }); } catch { /* Email delivery remains successful if audit logging is unavailable. */ }
    }
    return NextResponse.json({ ok: true, target, sent, batches: Math.ceil(sent / RESEND_BATCH_SIZE) });
  } catch (error) {
    return NextResponse.json({ ok: false, sent, error: error instanceof Error ? error.message : "Could not send the email campaign." }, { status: 500 });
  }
}
