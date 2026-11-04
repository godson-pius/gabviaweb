import type { Metadata } from "next";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabvia.app").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Gabvia Blog — Multilingual Communication, AI Features & Insights",
  description:
    "Explore the latest news, product features, customer pains and gains, and real-time translation innovations from the Gabvia engineering and product team.",
  keywords: [
    "gabvia blog",
    "gabvia news",
    "multilingual communication platform",
    "real-time translation features",
    "customer pains and gains translation",
    "language barrier pain relief",
    "kinyarwanda ai translator",
    "swahili translation chat",
    "voice note translation",
    "encrypted chat translation",
  ],
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
  openGraph: {
    title: "Gabvia Blog — Multilingual Communication, AI Features & Insights",
    description:
      "Stay updated on Gabvia Web releases, customer stories, AI translation features, and language barrier solutions.",
    url: `${SITE_URL}/blog`,
    siteName: "Gabvia",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Gabvia Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gabvia Blog — Multilingual Communication, AI Features & Insights",
    description:
      "Stay updated on Gabvia Web releases, customer stories, AI translation features, and language barrier solutions.",
    images: ["/logo.png"],
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

