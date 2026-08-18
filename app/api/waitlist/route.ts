import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const recentRequests = new Map<string, number>();

function firestoreString(value: string) {
  return { stringValue: value };
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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    if (!country || !language || !useCase) return NextResponse.json({ ok: false, error: "Please complete all required fields." }, { status: 400 });

    const requestKey = `${request.headers.get("x-forwarded-for") ?? "unknown"}:${email}`;
    const lastRequest = recentRequests.get(requestKey) ?? 0;
    if (Date.now() - lastRequest < 30_000) return NextResponse.json({ ok: false, error: "Please wait a moment before trying again." }, { status: 429 });
    recentRequests.set(requestKey, Date.now());

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const apiKey = process.env.FIREBASE_API_KEY;
    if (!projectId || !apiKey) throw new Error("Firebase server configuration is missing.");
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
    return NextResponse.json({ ok: true, message: "You are on the Gabvia waitlist." });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not join the waitlist." }, { status: 500 });
  }
}
