import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";

export const dynamic = "force-dynamic";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function makeOnboardingEmailHtml(fullName: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://gabvia.app").replace(/\/+$/, "");
  const logoUrl = `${siteUrl}/logo.png`;
  const safeName = escapeHtml(fullName);
  const year = new Date().getUTCFullYear();
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#eef3f8;color:#17243a;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">Different languages. One conversation. Your Gabvia journey starts here.</div>
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
                <p style="margin:0 0 12px;color:#287dff;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase">Different languages. One conversation.</p>
                <h1 style="margin:0 0 24px;color:#17243a;font-size:30px;line-height:1.2;letter-spacing:-.8px;font-weight:700">Welcome to Gabvia, ${safeName}.</h1>
                <p style="margin:0;color:#35445a;font-size:16px;line-height:1.75">Your account is ready. Gabvia is built to make communication across different languages feel natural, no more copying messages into translators or struggling to understand someone because you speak different languages.</p>
                <p style="margin:20px 0 0;color:#35445a;font-size:16px;line-height:1.75">Start a conversation, choose the language that feels natural to you, and bring your people in. Aiko, our husky mascot, will be cheering you on along the way.</p>
                <p style="margin:28px 0 0"><a href="${siteUrl}" style="display:inline-block;color:#287dff;font-size:14px;font-weight:700;text-decoration:none">Open Gabvia →</a></p>
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

async function sendOnboardingEmail(email: string, fullName: string, userId: string) {
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
      "Idempotency-Key": `gabvia-onboarding-${createHash("sha256").update(userId).digest("hex").slice(0, 40)}`,
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Welcome to Gabvia — your conversation starts here",
      text: `Hi ${fullName},\n\nDifferent languages. One conversation.\n\nYour Gabvia account is ready. Gabvia is built to make communication across different languages feel natural—no more copying messages into translators or struggling to understand someone because you speak different languages.\n\nStart a conversation, choose the language that feels natural to you, and bring your people in. Aiko, our husky mascot, will be cheering you on along the way.\n\nOpen Gabvia: ${process.env.NEXT_PUBLIC_SITE_URL || "https://gabvia.app"}\n\n— The Gabvia team`,
      html: makeOnboardingEmailHtml(fullName),
    }),
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null) as { message?: string; error?: { message?: string } } | null;
  if (!response.ok) throw new Error(payload?.message ?? payload?.error?.message ?? `Resend returned HTTP ${response.status}.`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as { full_name?: string; email?: string; user_id?: string };
    const email = body.email?.trim().toLowerCase() ?? "";
    const userId = body.user_id?.trim() ?? "";
    if (!EMAIL_PATTERN.test(email)) return NextResponse.json({ ok: false, error: "A valid email address is required." }, { status: 400 });
    if (!userId) return NextResponse.json({ ok: false, error: "The registered user ID is required." }, { status: 400 });
    const fullName = body.full_name?.trim().slice(0, 120) || "there";
    await sendOnboardingEmail(email, fullName, userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not send the onboarding email." }, { status: 500 });
  }
}
