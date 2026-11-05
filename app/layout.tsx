import { AuthProvider } from "@/context/AuthContext";
import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken-grotesk",
});

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gabvia.app").replace(/\/+$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Gabvia — Real-Time Multilingual Communication Platform",
    template: "%s | Gabvia",
  },
  description:
    "Gabvia is the real-time multilingual communication platform. Message, send voice notes, and translate instantly across 40+ languages with end-to-end encryption on Web & Android.",
  keywords: [
    "gabvia",
    "gabvia web",
    "gabvia app",
    "gabvia official",
    "gabvia chat",
    "gabvia translator",
    "multilingual communication platform",
    "multilingual chat app",
    "real-time language translator",
    "instant voice translation",
    "cross language messaging",
    "live translation chat",
    "online language translator",
    "kinyarwanda translator",
    "swahili chat app",
    "african language translation",
    "ai chat translator",
    "speech to text translator",
    "free language translator online",
    "bilingual chat app",
    "end-to-end encrypted multilingual chat",
    "voice note translator",
    "translate messages in real time",
  ],
  applicationName: "Gabvia",
  authors: [{ name: "Gabvia Technologies Inc.", url: SITE_URL }],
  creator: "Gabvia Technologies Inc.",
  publisher: "Gabvia Technologies Inc.",
  category: "Communication & Social",
  classification: "Multilingual Communication & Translation Platform",
  manifest: "/manifest.json",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Gabvia — Real-Time Multilingual Communication Platform",
    description:
      "Communicate naturally across 40+ languages with the real-time multilingual communication platform featuring in-flow AI translation and end-to-end encryption.",
    url: SITE_URL,
    siteName: "Gabvia",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Gabvia — Real-Time Multilingual Communication Platform",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gabvia — Real-Time Multilingual Communication Platform",
    description:
      "Connect seamlessly in any language with the real-time multilingual communication platform featuring AI translation and end-to-end encryption.",
    images: ["/logo.png"],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/logo.png", sizes: "180x180", type: "image/png" }],
  },
};

// JSON-LD Structured Data Schemas for Google Rich Results
const jsonLdData = {
  "@context": "https://schema.org",
  "@graph": [
    // 1. Organization Schema
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Gabvia",
      alternateName: ["Gabvia Web", "Gabvia App", "Gabvia Technologies Inc."],
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
      sameAs: [
        "https://play.google.com/store/apps/details?id=app.gabvia",
        "https://github.com/godson-pius/gabviaweb",
      ],
      description:
        "Gabvia provides real-time multilingual communication infrastructure connecting people across 40+ languages with AI translation and end-to-end encryption.",
      knowsAbout: [
        "Multilingual Communication",
        "Machine Translation",
        "Voice Translation",
        "Speech-to-Text",
        "End-to-End Encryption",
      ],
    },
    // 2. WebSite Schema with SearchAction
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Gabvia",
      alternateName: "Gabvia Web",
      publisher: { "@id": `${SITE_URL}/#organization` },
      description: "Real-time multilingual chat and AI voice translation app.",
      inLanguage: "en-US",
    },
    // 3. WebApplication / SoftwareApplication Schema
    {
      "@type": ["WebApplication", "SoftwareApplication"],
      "@id": `${SITE_URL}/#application`,
      name: "Gabvia",
      alternateName: "Gabvia Web",
      url: SITE_URL,
      applicationCategory: "CommunicationApplication",
      operatingSystem: "Web, Android, iOS, Windows, macOS, Linux",
      browserRequirements:
        "Requires modern web browser: Google Chrome, Apple Safari, Mozilla Firefox, Microsoft Edge",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      featureList: [
        "Real-time multilingual text translation in 40+ languages",
        "Voice note transcription and speech translation",
        "Private end-to-end encrypted messaging",
        "Zero-installation browser web client",
        "Cross-platform synchronization with Android",
      ],
      installUrl: "https://play.google.com/store/apps/details?id=app.gabvia",
      downloadUrl: "https://play.google.com/store/apps/details?id=app.gabvia",
    },
    // 4. FAQPage Schema for SERP Dropdown Rich Snippets
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is Gabvia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Gabvia is a real-time multilingual communication platform that lets people chat, send voice notes, and make calls across 40+ languages with instant AI translation and end-to-end encryption.",
          },
        },
        {
          "@type": "Question",
          name: "When does Gabvia Web officially open?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Gabvia Web is officially open and live for everyone with instant access directly in your web browser with zero downloads required.",
          },
        },
        {
          "@type": "Question",
          name: "Can I use Gabvia on my phone right now?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes! Gabvia is fully available right now for Android users directly on the Google Play Store with real-time translation and voice messages.",
          },
        },
        {
          "@type": "Question",
          name: "Are my messages and voice notes private on Gabvia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. All conversations on Gabvia are protected by end-to-end encryption so only you and the recipient can read messages or listen to audio.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need to download or install anything on my computer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No downloads or extensions required. Gabvia Web runs natively inside Google Chrome, Apple Safari, Mozilla Firefox, and Microsoft Edge.",
          },
        },
        {
          "@type": "Question",
          name: "How many languages are supported in Gabvia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Gabvia supports more than 40 world languages including Kinyarwanda, Swahili, French, Spanish, Arabic, German, and English with natural, context-aware AI translation.",
          },
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${hankenGrotesk.variable}`}>
      <head>
        {/* Rich Structured Data (JSON-LD) for Google SERP Knowledge Graph & Rich FAQ Snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
        <meta name="google-site-verification" content="diTKZWNC_6GJx0PNLsJx7A-FclemV7OtvpNzjB9s5A4" />
      </head>
      <body className={`${hankenGrotesk.className} ${hankenGrotesk.variable} bg-[#09090b] text-[#f4f4f5]`}>
        <AuthProvider>{children}</AuthProvider>

        {/* Brevo Conversations Chat Widget */}
        <Script
          id="brevo-conversations"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(d, w, c) {
                w.BrevoConversationsID = '6ace4f9e409bb929bd07422b';
                w[c] = w[c] || function() {
                  (w[c].q = w[c].q || []).push(arguments);
                };
                var s = d.createElement('script');
                s.async = true;
                s.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
                if (d.head) d.head.appendChild(s);
              })(document, window, 'BrevoConversations');
            `,
          }}
        />
      </body>
    </html>
  );
}
