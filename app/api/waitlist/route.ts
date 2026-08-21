import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const recentRequests = new Map<string, number>();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function firestoreString(value: string) {
  return { stringValue: value };
}

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function makeWelcomeEmailHtml(fullName: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://gabvia.app").replace(/\/+$/, "");
  const logoUrl = `${siteUrl}/logo.png`;
  const safeName = escapeHtml(fullName);
  const year = new Date().getUTCFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#eef3f8;color:#17243a;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">Welcome to the Gabvia waitlist.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#eef3f8">
      <tr>
        <td align="center" style="padding:34px 16px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:640px;background:#ffffff;border:1px solid #e1e8f0;border-radius:20px;overflow:hidden;box-shadow:0 12px 34px rgba(30,55,85,.08)">
            <tr>
              <td style="padding:28px 34px;background:#16243b">
                <img src="${logoUrl}" width="48" height="48" alt="Gabvia" style="display:inline-block;width:48px;height:48px;border:0;border-radius:14px;vertical-align:middle;background:#ffffff" />
                <span style="display:inline-block;margin-left:12px;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-.5px;vertical-align:middle">Gabvia</span>
              </td>
            </tr>
            <tr>
              <td style="padding:42px 44px 36px">
                <h1 style="margin:0 0 24px;color:#17243a;font-size:30px;line-height:1.2;letter-spacing:-.8px;font-weight:700">You’re on the waitlist, ${safeName}.</h1>
                <p style="margin:0;color:#35445a;font-size:16px;line-height:1.75">Thank you for joining Gabvia. We’re building Gabvia to make communication across different languages feel natural, no more copying messages into translators or struggling to understand someone because you speak different languages.</p>
                <p style="margin:20px 0 0;color:#35445a;font-size:16px;line-height:1.75">In the meantime, keep an eye on your inbox. We’ll be sharing updates, early access news, and a few surprises along the way. Thanks for being part of the journey. Aiko, our mascot, is excited to have you with us as we bring more people into the same conversation.</p>
                <p style="margin:28px 0 0"><a href="${siteUrl}" style="display:inline-block;color:#287dff;font-size:14px;font-weight:700;text-decoration:none">visit gabvia.app →</a></p>
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

async function sendWelcomeEmail(email: string, fullName: string, idempotencyKey: string) {
  const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEND;
  if (!resendApiKey) throw new Error("Resend is not configured.");

  const from = process.env.RESEND_FROM_EMAIL || "Gabvia <noreply@gabvia.app>";
  const fromAddress = from.match(/<([^>]+)>/)?.[1] ?? from;
  if (!EMAIL_PATTERN.test(fromAddress)) throw new Error("RESEND_FROM_EMAIL is not a valid email address.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `gabvia-waitlist-welcome-${idempotencyKey}`,
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Welcome to Gabvia — Different languages. One conversation.",
      text: `Hi ${fullName},\n\nDifferent languages. One conversation.\n\nThanks for joining Gabvia. We’re building Gabvia to make communication across different languages feel natural—no more copying messages into translators or struggling to understand someone because you speak different languages.\n\nWe’ll keep you posted about early access. Aiko, our husky mascot, is excited to have you with us as we bring more people into the same conversation.\n\nVisit gabvia.app\n\n— The Gabvia team`,
      html: makeWelcomeEmailHtml(fullName),
    }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as { message?: string; error?: { message?: string } } | null;
  if (!response.ok) throw new Error(payload?.message ?? payload?.error?.message ?? `Resend returned HTTP ${response.status}.`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      full_name?: string;
      email?: string;
      country?: string;
      native_language?: string;
      use_case?: string;
      source?: string;
      website?: string;
    };
    if (body.website) return NextResponse.json({ ok: true, message: "Thanks for joining the waitlist." });

    const fullName = body.full_name?.trim().slice(0, 120) ?? "";
    const email = body.email?.trim().toLowerCase().slice(0, 160) ?? "";
    const country = body.country?.trim().slice(0, 80) ?? "";
    const language = body.native_language?.trim().slice(0, 80) ?? "";
    const useCase = body.use_case?.trim().slice(0, 80) ?? "";
    const source = body.source?.trim().slice(0, 40) || "promotional-site";
    if (fullName.length < 2) return NextResponse.json({ ok: false, error: "Please enter your full name." }, { status: 400 });
    if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    if (!country || !language || !useCase) return NextResponse.json({ ok: false, error: "Please complete all required fields." }, { status: 400 });

    const requestKey = `${request.headers.get("x-forwarded-for") ?? "unknown"}:${email}`;
    const lastRequest = recentRequests.get(requestKey) ?? 0;
    if (Date.now() - lastRequest < 30_000) return NextResponse.json({ ok: false, error: "Please wait a moment before trying again." }, { status: 429 });
    recentRequests.set(requestKey, Date.now());

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!projectId || !apiKey) throw new Error("Firebase server configuration is missing.");
    // const documentId = "12wd31";
    const documentId = createHash("sha256").update(email).digest("hex").slice(0, 40);
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/waitlist?documentId=${documentId}&key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        fields: {
          full_name: firestoreString(fullName),
          email: firestoreString(email),
          country: firestoreString(country),
          native_language: firestoreString(language),
          use_case: firestoreString(useCase),
          source: firestoreString(source),
          status: firestoreString("waitlisted"),
          created_at: { timestampValue: new Date().toISOString() },
        },
      }),
    });
    if (response.status === 409) return NextResponse.json({ ok: true, alreadyRegistered: true, message: "You are already on the Gabvia waitlist." });
    if (!response.ok) {
      const error = await response.json().catch(() => null) as { error?: { message?: string } } | null;
      throw new Error(error?.error?.message ?? "Could not save your waitlist entry.");
    }
    let emailSent = false;
    try {
      await sendWelcomeEmail(email, fullName, documentId);
      emailSent = true;
    } catch (error) {
      console.error("Waitlist welcome email failed", { email, error });
    }
    return NextResponse.json({
      ok: true,
      emailSent,
      message: emailSent
        ? "You are on the Gabvia waitlist. Check your inbox for a welcome email."
        : "You are on the Gabvia waitlist.",
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not join the waitlist." }, { status: 500 });
  }
}
