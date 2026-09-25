import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || process.env.NEXT_PUBLIC_OPENROUTER_MODEL || "google/gemini-2.0-flash-001";
const TIMEOUT_MS = 25000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Messages array is required for summarization." },
        { status: 400 }
      );
    }

    const chatHistory = messages
      .map((m: { sender?: string; content?: string }) => `${m.sender || "User"}: ${m.content || ""}`)
      .join("\n");

    const promptText = `Summarize the following chat conversation history into a clear, informative summary.
Focus on the main topics discussed, decisions made, and important details.
Keep it structured, concise, and easy to read.

Conversation:
${chatHistory}`;

    // 1. Try Gemini API first
    if (GEMINI_API_KEY) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: {
              parts: [{ text: "You are Gabvia's AI Conversation Assistant. Provide clear, professional, and well-structured summaries of chat conversations." }],
            },
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1024,
            },
          }),
          signal: controller.signal,
        });

        clearTimeout(timer);

        if (res.ok) {
          const data = await res.json();
          const summary = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (summary) {
            return NextResponse.json({ ok: true, summary: summary.trim() });
          }
        }
      } catch (geminiErr) {
        console.warn("[API Summarize] Gemini attempt failed, trying fallback:", geminiErr);
      }
    }

    // 2. Try OpenRouter fallback
    if (OPENROUTER_API_KEY) {
      try {
        const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": "https://gabvia.app",
            "X-Title": "Gabvia Web",
          },
          body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [
              {
                role: "system",
                content: "You are Gabvia's AI Conversation Assistant. Provide clear, professional, and well-structured summaries of chat conversations.",
              },
              { role: "user", content: promptText },
            ],
            temperature: 0.3,
            max_tokens: 1024,
          }),
        });

        if (openRouterRes.ok) {
          const data = await openRouterRes.json();
          const summary = data?.choices?.[0]?.message?.content;
          if (summary) {
            return NextResponse.json({ ok: true, summary: summary.trim() });
          }
        }
      } catch (orErr) {
        console.warn("[API Summarize] OpenRouter attempt failed:", orErr);
      }
    }

    return NextResponse.json(
      { ok: false, error: "Could not generate summary with available AI providers." },
      { status: 502 }
    );
  } catch (error: any) {
    console.error("[API Summarize] Error:", error);
    return NextResponse.json(
      { ok: false, error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
