import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const recentSubmissions = new Map<string, number>();
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function firestoreString(value: string) {
  return { stringValue: value };
}

function firestoreTimestamp() {
  return { timestampValue: new Date().toISOString() };
}

function generateTicketId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let random = "";
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  return `GAB-${dateStr}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      subject?: string;
      query?: string;
      message?: string;
      feedback?: string;
      email?: string;
      name?: string;
      userId?: string;
      username?: string;
      category?: string;
      website?: string; // honeypot
    } | null;

    if (!body) {
      return NextResponse.json({ ok: false, error: "Invalid request payload." }, { status: 400 });
    }

    // 1. Spambot honeypot trap
    if (body.website) {
      return NextResponse.json({
        ok: true,
        ticketId: "GAB-SEC-001",
        message: "Your query has been submitted.",
      });
    }

    const subject = (body.subject || "").trim().slice(0, 200);
    const feedback = (body.query || body.message || body.feedback || "").trim().slice(0, 5000);
    const email = (body.email || "").trim().toLowerCase().slice(0, 160);
    const name = (body.name || body.username || "").trim().slice(0, 100);
    const userId = (body.userId || "").trim().slice(0, 128);
    const category = (body.category || "General").trim().slice(0, 50);

    // 2. Validation
    if (!subject || subject.length < 3) {
      return NextResponse.json(
        { ok: false, error: "Please enter a subject (at least 3 characters)." },
        { status: 400 }
      );
    }

    if (!feedback || feedback.length < 10) {
      return NextResponse.json(
        { ok: false, error: "Please provide a query or feedback description (at least 10 characters)." },
        { status: 400 }
      );
    }

    if (email && !EMAIL_PATTERN.test(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email address so we can reply." },
        { status: 400 }
      );
    }

    // 3. Simple in-memory rate-limiting (max 1 ticket per IP every 15 seconds)
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const rateLimitKey = `${ip}:${email || "anonymous"}`;
    const lastTime = recentSubmissions.get(rateLimitKey) || 0;
    const now = Date.now();

    if (now - lastTime < 15_000) {
      return NextResponse.json(
        { ok: false, error: "You are submitting too fast. Please wait a moment before sending another query." },
        { status: 429 }
      );
    }
    recentSubmissions.set(rateLimitKey, now);

    // 4. Generate unique readable Ticket ID
    const ticketId = generateTicketId();

    // 5. Store in Firestore via REST API if configured
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

    if (projectId && apiKey) {
      try {
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/support_queries?documentId=${ticketId}&key=${apiKey}`;
        await fetch(firestoreUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          body: JSON.stringify({
            fields: {
              ticket_id: firestoreString(ticketId),
              subject: firestoreString(subject),
              query: firestoreString(feedback),
              email: firestoreString(email || "unspecified"),
              name: firestoreString(name || "unspecified"),
              user_id: firestoreString(userId || "guest"),
              category: firestoreString(category),
              status: firestoreString("new"),
              created_at: firestoreTimestamp(),
            },
          }),
        });
      } catch (err) {
        console.warn("[Support API] Could not write to Firestore REST API:", err);
      }
    }

    // 6. Optional email notification via Resend if configured
    const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEND;
    if (resendApiKey) {
      try {
        const fromEmail = process.env.RESEND_FROM_EMAIL || "support@gabvia.app";
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `Gabvia Support <${fromEmail}>`,
            to: ["officialgabvia@gmail.com"],
            subject: `[Support Query: ${ticketId}] ${subject}`,
            text: `Ticket: ${ticketId}\nFrom: ${name || "User"} (${email || "No email"})\nCategory: ${category}\n\nSubject: ${subject}\n\nMessage:\n${feedback}`,
          }),
          cache: "no-store",
        });
      } catch (err) {
        console.warn("[Support API] Could not send notification email:", err);
      }
    }

    return NextResponse.json({
      ok: true,
      ticketId,
      message: "Thank you! Your query has been received. Our team will review it shortly.",
    });
  } catch (error: any) {
    console.error("[Support API] Error handling request:", error);
    return NextResponse.json(
      { ok: false, error: "Something went wrong while submitting your query. Please try again." },
      { status: 500 }
    );
  }
}
