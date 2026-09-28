import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Support & Feedback — Get Help or Send Inquiries | Gabvia",
  description:
    "Need help, found a bug, or have feedback about Gabvia? Send us your query or feedback and our support team will assist you.",
  keywords: [
    "gabvia support",
    "contact gabvia",
    "customer support",
    "feedback",
    "help desk",
    "submit query",
    "support ticket",
  ],
  alternates: {
    canonical: "/support",
  },
  openGraph: {
    title: "Support & Feedback — Gabvia",
    description:
      "Send queries, report issues, or provide feedback directly to the Gabvia support team.",
    url: "/support",
    siteName: "Gabvia",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Gabvia Support" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Support & Feedback — Gabvia",
    description: "Send queries, report issues, or provide feedback directly to the Gabvia support team.",
    images: ["/logo.png"],
  },
};

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
