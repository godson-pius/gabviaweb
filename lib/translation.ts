export type TranslationOptions = {
  sourceLanguage?: string;
  conversationType?: "direct" | "group";
  targetSpeaker?: string;
  replyTo?: {
    speaker: string;
    content: string;
  };
};

export const isSameLanguageOrIdentical = (
  text1?: string | null,
  text2?: string | null
): boolean => {
  if (!text1 || !text2) return false;
  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"“”]/g, "")
      .replace(/\s+/g, " ");
  return normalize(text1) === normalize(text2);
};

export const cleanTranslationOutput = (rawText: string): string => {
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
};

export async function translateText(
  text: string,
  targetLanguage: string,
  options: TranslationOptions = {}
): Promise<string | null> {
  if (!text || !text.trim() || !targetLanguage) return null;

  // 1. Try our Next.js backend API route first
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        targetLanguage,
        sourceLanguage: options.sourceLanguage,
        conversationType: options.conversationType,
        targetSpeaker: options.targetSpeaker,
        replyTo: options.replyTo,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.ok && data?.translatedText) {
        return data.translatedText;
      }
    }
  } catch (err) {
    console.warn("[Translation Client] /api/translate route unavailable, trying direct Gemini...", err);
  }

  // 2. Direct client-side fallback if NEXT_PUBLIC_GEMINI_API_KEY is available
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const model = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey) {
    return null;
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const systemInstruction = `You are Gabvia's expert conversational translator. Translate ONLY the TARGET MESSAGE into ${targetLanguage}. Return ONLY the raw translated text.`;

    const parts: any[] = [{ text: `TARGET MESSAGE:\n${text}` }];
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
      }),
    });

    if (!res.ok) return null;
    const json = await res.json();
    const raw = json?.candidates?.[0]?.content?.parts?.[0]?.text;
    return raw ? cleanTranslationOutput(raw) : null;
  } catch (err) {
    console.warn("[Translation Client] Direct Gemini call failed:", err);
    return null;
  }
}

export async function summarizeMessages(
  messages: { sender: string; content: string }[]
): Promise<string | null> {
  if (!messages || messages.length === 0) return null;

  try {
    const res = await fetch("/api/summarize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.summary) {
        return data.summary;
      }
    }
  } catch (err) {
    console.warn("[Summarize] API call failed:", err);
  }

  return null;
}

export async function transcribeAudio(
  audioData: Blob | string,
  options: {
    mimeType?: string;
    language?: string;
  } = {}
): Promise<string | null> {
  try {
    let res: Response;

    if (audioData instanceof Blob) {
      const formData = new FormData();
      formData.append("audio", audioData, "audio.webm");
      if (options.language) {
        formData.append("language", options.language);
      }
      res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
    } else {
      res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Audio: audioData,
          mimeType: options.mimeType || "audio/webm",
          language: options.language,
        }),
      });
    }

    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.text) {
        return data.text;
      }
    }
  } catch (err) {
    console.warn("[Transcribe] Audio transcription failed:", err);
  }

  return null;
}


