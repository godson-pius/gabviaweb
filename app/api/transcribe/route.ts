import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_TIMEOUT_MS = 25000;

function cleanOutput(rawText: string): string {
  let text = rawText.trim();
  text = text.replace(/^(?:Transcription|Transcribed|Text)\s*:\s*/i, "");
  if (
    (text.startsWith('"') && text.endsWith('"')) ||
    (text.startsWith("“") && text.endsWith("”")) ||
    (text.startsWith("'") && text.endsWith("'"))
  ) {
    text = text.slice(1, -1).trim();
  }
  return text;
}

export async function POST(request: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "GEMINI_API_KEY not configured on server." },
        { status: 500 }
      );
    }

    let base64Audio = "";
    let mimeType = "audio/webm";
    let spokenLanguage = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("audio") as Blob | null;
      spokenLanguage = (formData.get("language") as string) || "";

      if (!file) {
        return NextResponse.json(
          { ok: false, error: "No audio file provided." },
          { status: 400 }
        );
      }

      mimeType = file.type || "audio/webm";
      const arrayBuffer = await file.arrayBuffer();
      base64Audio = Buffer.from(arrayBuffer).toString("base64");
    } else {
      const body = await request.json().catch(() => ({}));
      base64Audio = body.base64Audio || "";
      mimeType = body.mimeType || "audio/webm";
      spokenLanguage = body.spokenLanguage || body.language || "";
    }

    if (!base64Audio || base64Audio.length < 20) {
      return NextResponse.json(
        { ok: false, error: "Audio data is empty or too short." },
        { status: 400 }
      );
    }

    // Resolve canonical MIME type for Gemini Multimodal
    let canonicalMimeType = "audio/webm";
    const lower = mimeType.toLowerCase();
    if (lower.includes("webm")) {
      canonicalMimeType = "audio/webm";
    } else if (lower.includes("mp4") || lower.includes("m4a")) {
      canonicalMimeType = "audio/mp4";
    } else if (lower.includes("wav")) {
      canonicalMimeType = "audio/wav";
    } else if (lower.includes("aac")) {
      canonicalMimeType = "audio/aac";
    } else if (lower.includes("mp3") || lower.includes("mpeg")) {
      canonicalMimeType = "audio/mp3";
    }

    const promptText = spokenLanguage
      ? `The speaker is speaking in ${spokenLanguage}. Transcribe the following audio verbatim in ${spokenLanguage}. Do NOT translate it to any other language. Return only the exact transcribed speech, with no commentary, no markdown, and no quotes.`
      : "Transcribe the following audio verbatim in its original spoken language. Do NOT translate it to any other language. Return only the exact transcribed speech, with no commentary, no markdown, and no quotes.";

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    const parts = [
      { text: promptText },
      {
        inlineData: {
          mimeType: canonicalMimeType,
          data: base64Audio,
        },
      },
    ];

    try {
      let response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 1024,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok && response.status === 400) {
        // Fallback retry without thinkingConfig
        response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0,
              maxOutputTokens: 1024,
            },
          }),
        });
      }

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[API Transcribe] Gemini error:", errorText);
        return NextResponse.json(
          { ok: false, error: "Speech recognition service error." },
          { status: response.status }
        );
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return NextResponse.json(
          { ok: false, error: "No speech detected in audio." },
          { status: 422 }
        );
      }

      return NextResponse.json({
        ok: true,
        text: cleanOutput(rawText),
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error("[API Transcribe] Fetch error:", err);
      return NextResponse.json(
        { ok: false, error: err?.message || "Transcription request failed." },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("[API Transcribe] Unhandled error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
