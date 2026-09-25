import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_TIMEOUT_MS = 20000;

function cleanTranslationOutput(rawText: string): string {
  let text = rawText.trim();
  text = text.replace(/^(?:Translation|Translated|Traducción|Traduction|Übersetzung)\s*:\s*/i, "");
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
    const body = await request.json().catch(() => ({}));
    const {
      text,
      targetLanguage,
      sourceLanguage,
      conversationType,
      targetSpeaker,
      replyTo,
    } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { ok: false, error: "Text is required for translation." },
        { status: 400 }
      );
    }

    if (!targetLanguage || typeof targetLanguage !== "string") {
      return NextResponse.json(
        { ok: false, error: "targetLanguage is required." },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "GEMINI_API_KEY not configured on server." },
        { status: 500 }
      );
    }

    const systemInstruction = `You are Gabvia's expert conversational translator. Your task is to translate ONLY the TARGET MESSAGE into ${targetLanguage}.
Maintain the original tone, slang, emotion, capitalization, punctuation, and colloquial nuances naturally in ${targetLanguage}.
Do NOT summarize, expand, explain, or add conversational filler.
Do NOT output "Translation:" or markdown quotes.
Return ONLY the raw translated target text in ${targetLanguage}.`;

    const parts: any[] = [];
    if (sourceLanguage) {
      parts.push({ text: `Source language: ${sourceLanguage}` });
    }
    if (conversationType) {
      parts.push({ text: `Chat context: ${conversationType}` });
    }
    if (targetSpeaker) {
      parts.push({ text: `Speaker: ${targetSpeaker}` });
    }
    if (replyTo?.content) {
      parts.push({
        text: `Replying to ${replyTo.speaker || "user"}: "${replyTo.content}"`,
      });
    }
    parts.push({ text: `TARGET MESSAGE:\n${text}` });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1024,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        // Fallback retry without thinkingConfig if Gemini model rejects it
        const fallbackResponse = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1024,
            },
          }),
        });

        if (!fallbackResponse.ok) {
          const errText = await fallbackResponse.text();
          console.error("[API Translate] Gemini error:", errText);
          return NextResponse.json(
            { ok: false, error: "Translation service failed." },
            { status: fallbackResponse.status }
          );
        }

        const data = await fallbackResponse.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          return NextResponse.json(
            { ok: false, error: "No translation output." },
            { status: 502 }
          );
        }
        return NextResponse.json({ ok: true, translatedText: cleanTranslationOutput(rawText) });
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return NextResponse.json(
          { ok: false, error: "No translation output." },
          { status: 502 }
        );
      }

      return NextResponse.json({ ok: true, translatedText: cleanTranslationOutput(rawText) });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error: any) {
    console.error("[API Translate] Exception:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error." },
      { status: 500 }
    );
  }
}
