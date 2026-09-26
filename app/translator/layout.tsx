import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online Language Translator — Real-Time Text & Voice in 40+ Languages | Gabvia",
  description:
    "Free real-time multilingual translator powered by Gabvia AI. Translate text and audio instantly across 40+ languages including Kinyarwanda, Swahili, French, Spanish, Arabic, German, and English with audio speech output.",
  keywords: [
    "free online translator",
    "real time language translator",
    "kinyarwanda translator",
    "swahili translator online",
    "translate english to kinyarwanda",
    "translate english to swahili",
    "african language translator",
    "voice translator online",
    "speech to text translation",
    "multilingual text translator",
    "ai translator free",
    "translate audio voice notes",
    "instant chat translation",
  ],
  alternates: {
    canonical: "/translator",
  },
  openGraph: {
    title: "Free Online Language Translator — Real-Time AI Translation in 40+ Languages",
    description:
      "Translate text and voice instantly across 40+ languages including Kinyarwanda, Swahili, French, and English. Natural AI translation with voice pronunciation.",
    url: "/translator",
    siteName: "Gabvia",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Gabvia Translator" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Online Language Translator — Real-Time AI Translation | Gabvia",
    description: "Translate text and voice instantly across 40+ languages. Natural AI translation with audio speech playback.",
    images: ["/logo.png"],
  },
};

export default function TranslatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
