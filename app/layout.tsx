import type { Metadata } from "next";
import { Hanken_Grotesk } from 'next/font/google';
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gabvia — Conversations without borders",
  description:
    "Gabvia is the multilingual communication infrastructure for conversations that cross borders, languages, and everything in between.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabvia.app"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "Gabvia — Conversations without borders",
    description: "Chat naturally across languages with translation that keeps your meaning and your voice.",
    url: "/",
    siteName: "Gabvia",
    type: "website",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Gabvia" }],
  },
  twitter: {
    card: "summary",
    title: "Gabvia — Conversations without borders",
    description: "Chat naturally across languages with translation that keeps your meaning and your voice.",
    images: ["/logo.png"],
  },
  icons: { icon: "/logo.png" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className={hankenGrotesk.className}>{children}</body>
    </html>
  );
}
