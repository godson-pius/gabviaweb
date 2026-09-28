"use client";

import { AppWorkflow3D } from "@/components/landing/AppWorkflow3D";
import { SpaceGlobe } from "@/components/landing/SpaceGlobe";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.gabvia&pcampaignid=web_share";

type IconName =
  | "arrow-up-right"
  | "arrow-right"
  | "globe"
  | "lock"
  | "mic"
  | "spark"
  | "play"
  | "users"
  | "check"
  | "menu"
  | "close"
  | "shield"
  | "bell"
  | "zap"
  | "sun"
  | "moon";

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  const paths: Record<IconName, React.ReactNode> = {
    "arrow-up-right": (
      <>
        <path d="M7 17 17 7" />
        <path d="M7 7h10v10" />
      </>
    ),
    "arrow-right": (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2" />
      </>
    ),
    mic: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8" />
      </>
    ),
    spark: (
      <>
        <path d="m12 3-1.5 5.5L5 10l5.5 1.5L12 17l1.5-5.5L19 10l-5.5-1.5L12 3Z" />
        <path d="m19 16-.7 2.3L16 19l2.3.7L19 22l.7-2.3L22 19l-2.3-.7L19 16Z" />
      </>
    ),
    play: <path d="m9 6 9 6-9 6V6Z" />,
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    menu: (
      <>
        <path d="M4 7h16M4 12h16M4 17h16" />
      </>
    ),
    close: (
      <>
        <path d="m6 6 12 12M18 6 6 18" />
      </>
    ),
    shield: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </>
    ),
    bell: (
      <>
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </>
    ),
    zap: (
      <>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </>
    ),
    moon: (
      <>
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </>
    ),
  };

  return <svg {...common}>{paths[name]}</svg>;
}

function GooglePlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3.609 1.814C3.255 2.188 3 2.766 3 3.518v16.964c0 .752.255 1.33.609 1.704l.089.085 9.539-9.54v-.224L3.698 1.729l-.089.085z"
        fill="#00E676"
      />
      <path
        d="M16.417 15.932l-3.18-3.18v-.224l3.18-3.18.072.041 3.766 2.14c1.076.61 1.076 1.613 0 2.223l-3.766 2.14-.072.04z"
        fill="#FFD600"
      />
      <path
        d="M16.489 15.891L13.237 12.64 3.609 22.268c.355.378.955.424 1.636.037l11.244-6.414"
        fill="#FF3D00"
      />
      <path
        d="M16.489 8.109L5.245 1.695c-.681-.387-1.281-.341-1.636.037L13.237 11.36l3.252-3.251z"
        fill="#00B0FF"
      />
    </svg>
  );
}

const FAQS = [
  {
    q: "When does Gabvia Web officially open?",
    a: "Gabvia Web is open for everyone right now! You can log in or create an account directly in your web browser with zero downloads required.",
  },
  {
    q: "Can I use Gabvia on my phone right now?",
    a: "Yes! Gabvia is fully available right now for Android users. You can download it directly from Google Play to chat and translate immediately.",
  },
  {
    q: "Are my messages and voice notes private?",
    a: "Yes. All conversations are protected by end-to-end encryption. That means only you and the person you're chatting with can read your messages or listen to your voice notes.",
  },
  {
    q: "Do I need to download or install anything on my computer?",
    a: "No downloads or extensions required. Gabvia Web runs natively inside Google Chrome, Apple Safari, Mozilla Firefox, Microsoft Edge, and modern mobile browsers.",
  },
  {
    q: "How many languages are supported?",
    a: "Gabvia supports more than 40 languages with natural, context-aware translation that preserves tone, expressions, and meaning.",
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const saved = localStorage.getItem("gabvia-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      localStorage.setItem("gabvia-theme", next);
      return next;
    });
  };

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-300 ${isDark
        ? "bg-[#09090b] text-[#f4f4f5] selection:bg-zinc-800"
        : "bg-[#fafafa] text-[#09090b] selection:bg-zinc-200"
        }`}
    >
      {/* 1. Top Announcement Bar */}
      <div
        className={`border-b sticky top-0 z-50 transition-colors backdrop-blur-md ${isDark
          ? "border-zinc-800/80 bg-zinc-950/90 text-zinc-300"
          : "border-zinc-200/80 bg-white/95 text-zinc-950"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span
              className={`font-semibold uppercase tracking-wider ${isDark ? "text-zinc-100" : "text-zinc-950"
                }`}
            >
              [ OFFICIAL ANNOUNCEMENT ]
            </span>
            <span className="text-zinc-500 hidden sm:inline">—</span>
            <span className={`${isDark ? "text-zinc-400" : "text-zinc-600"} truncate`}>
              Gabvia Web Platform is now live · Direct in-browser multilingual communication.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/chat"
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-colors ${isDark
                ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                }`}
            >
              WEB CHAT LIVE →
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <header
        className={`border-b transition-colors backdrop-blur-md ${isDark ? "border-zinc-800/80 bg-zinc-950/80" : "border-zinc-200/80 bg-white/80"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center p-1 shadow-sm transition-colors ${isDark
                  ? "bg-zinc-900 border-zinc-800 group-hover:border-zinc-700"
                  : "bg-white border-zinc-200 group-hover:border-zinc-400"
                  }`}
              >
                <Image src="/logo.png" alt="Gabvia" width={32} height={32} priority className="object-contain" />
              </div>
              <div>
                <span
                  className={`font-bold text-xl tracking-tight block leading-tight ${isDark ? "text-white" : "text-zinc-950"
                    }`}
                >
                  Gabvia
                </span>
                {/* <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block">
                  COMMUNICATION PLATFORM
                </span> */}
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a
              href="#features"
              className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"
                } transition-colors`}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"
                } transition-colors`}
            >
              How It Works
            </a>
            <a
              href="#timeline"
              className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"
                } transition-colors`}
            >
              Roadmap
            </a>
            <a
              href="#faq"
              className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"
                } transition-colors`}
            >
              FAQ
            </a>
            <Link
              href="/translator"
              className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"
                } transition-colors flex items-center gap-1.5`}
            >
              <span>Translator</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${isDark ? "bg-zinc-900 text-zinc-400 border-zinc-800" : "bg-zinc-100 text-zinc-600 border-zinc-200"
                  }`}
              >
                TOOL
              </span>
            </Link>
            <Link
              href="/chat"
              className={`${isDark ? "text-sky-400 hover:text-sky-300 font-semibold" : "text-blue-600 hover:text-blue-500 font-semibold"
                } transition-colors flex items-center gap-1.5`}
            >
              <span>Web Chat</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${isDark ? "bg-sky-950/60 text-sky-400 border-sky-800" : "bg-sky-50 text-blue-700 border-sky-200"
                  }`}
              >
                LIVE
              </span>
            </Link>
          </nav>

          {/* Actions & Theme Toggle */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              className={`p-2 px-3 rounded-xl border flex items-center gap-2 text-xs font-mono transition-colors ${isDark
                ? "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800"
                : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200"
                }`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
              title={`Switch to ${isDark ? "light" : "dark"} theme`}
            >
              <Icon name={isDark ? "sun" : "moon"} size={15} />
              <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors border ${isDark
                ? "text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border-zinc-800"
                : "text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border-zinc-200"
                }`}
            >
              <GooglePlayIcon size={16} />
              <span>Android App</span>
            </a>

            {/* Open Web Chat Button */}
            <Link
              href="/chat"
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${isDark
                ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-950/40"
                : "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-blue-500/20"
                }`}
            >
              <Icon name="spark" size={13} />
              <span>Open Web Chat</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border ${isDark ? "border-zinc-800 text-zinc-300" : "border-zinc-200 text-zinc-600"
                }`}
              aria-label="Toggle theme"
            >
              <Icon name={isDark ? "sun" : "moon"} size={18} />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-lg border ${isDark ? "border-zinc-800 text-zinc-300 hover:text-white" : "border-zinc-200 text-zinc-600 hover:text-zinc-950"
                }`}
              aria-label="Toggle menu"
            >
              <Icon name={menuOpen ? "close" : "menu"} size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div
            className={`md:hidden border-t px-4 py-6 space-y-4 ${isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white"
              }`}
          >
            <a
              href="#features"
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              How It Works
            </a>
            <a
              href="#timeline"
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              Roadmap
            </a>
            <a
              href="#faq"
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              FAQ
            </a>
            <Link
              href="/translator"
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              Translator Tool
            </Link>
            <Link
              href="/chat"
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-bold ${isDark ? "text-sky-400" : "text-blue-600"}`}
            >
              Web Chat (Live)
            </Link>
            <div className={`pt-4 border-t flex flex-col gap-2 ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
              <Link
                href="/chat"
                onClick={() => setMenuOpen(false)}
                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${isDark
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                  : "bg-gradient-to-r from-blue-600 to-sky-600 text-white"
                  }`}
              >
                <Icon name="spark" size={14} />
                <span>Open Web Chat</span>
              </Link>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border ${isDark
                  ? "text-white bg-zinc-900 border-zinc-800"
                  : "text-zinc-900 bg-zinc-100 border-zinc-200"
                  }`}
              >
                <GooglePlayIcon size={16} />
                <span>Get Android App</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* 3. Hero Section */}
      <section
        className={`relative overflow-hidden border-b transition-colors pt-12 pb-20 lg:pt-20 lg:pb-28 ${isDark ? "border-zinc-800/80 bg-zinc-950" : "border-zinc-200/80 bg-white"
          }`}
      >
        {/* Architectural Grid Lines */}
        <div
          className={`absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none ${isDark
            ? "bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] opacity-40"
            : "bg-[linear-gradient(to_right,#f1f1f4_1px,transparent_1px),linear-gradient(to_bottom,#f1f1f4_1px,transparent_1px)] opacity-60"
            }`}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Announcement & Value Proposition */}
            <div className="lg:col-span-7 space-y-8">
              {/* Badge */}
              <div
                className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-mono text-xs ${isDark
                  ? "border-zinc-800 bg-zinc-900/70 text-zinc-300"
                  : "border-zinc-200 bg-zinc-50 text-zinc-700"
                  }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className={`font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>NOW LIVE</span>
                <span className="text-zinc-500">|</span>
                <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>GLOBAL WEB CHAT PLATFORM OPEN</span>
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1
                  className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] ${isDark ? "text-white" : "text-zinc-950"
                    }`}
                >
                  The multilingual communication platform. <br />
                  {/* <span className="text-zinc-400 font-normal"></span> */}
                </h1>
                <p
                  className={`text-base sm:text-lg max-w-2xl leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}
                >
                  Gabvia is the real-time multilingual communication platform. Message, talk, and share voice notes with anyone across 40+ languages with in-flow AI translation and end-to-end privacy — directly from Chrome, Safari, Firefox, and Edge.
                </p>
              </div>

              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/chat"
                  className={`inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all shadow-lg active:scale-[0.98] ${isDark
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-500/25"
                    : "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-blue-500/30"
                    }`}
                >
                  <Icon name="spark" size={17} />
                  <span>Start Chatting on Web</span>
                  <Icon name="arrow-right" size={15} />
                </Link>

                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all border ${isDark
                    ? "border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200"
                    : "border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-800"
                    }`}
                >
                  <GooglePlayIcon size={18} />
                  <span>Get for Android</span>
                </a>
              </div>

              {/* Minimal Value Points */}
              <div className={`flex flex-wrap items-center gap-6 pt-2 text-xs font-mono ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                  Zero Installation Required
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-zinc-400" : "bg-zinc-500"}`}></span>
                  100% Private &amp; Encrypted
                </span>
                <span className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-zinc-400" : "bg-zinc-500"}`}></span>
                  40+ Languages
                </span>
              </div>
            </div>

            {/* Right Column: SpaceFS Interactive 3D Canvas */}
            <div className="lg:col-span-5">
              <div
                className={`relative rounded-3xl border p-2 shadow-sm transition-colors ${isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-white"
                  }`}
              >
                {/* SpaceFS Corner Crosshairs (+) */}
                <span className="absolute -top-2 -left-2 text-zinc-500 font-mono text-sm select-none">+</span>
                <span className="absolute -top-2 -right-2 text-zinc-500 font-mono text-sm select-none">+</span>
                <span className="absolute -bottom-2 -left-2 text-zinc-500 font-mono text-sm select-none">+</span>
                <span className="absolute -bottom-2 -right-2 text-zinc-500 font-mono text-sm select-none">+</span>

                {/* Card Header */}
                <div
                  className={`flex items-center justify-between px-4 py-3 border-b font-mono text-[11px] ${isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-200 text-zinc-600"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    <span className={isDark ? "text-zinc-200 font-medium" : "text-zinc-800 font-medium"}>
                      GLOBAL NETWORK
                    </span>
                  </div>
                  <span>INTERACTIVE 3D</span>
                </div>

                {/* 3D Canvas */}
                <div
                  className={`h-[400px] sm:h-[460px] w-full rounded-2xl flex items-center justify-center overflow-hidden transition-colors ${isDark ? "bg-[#0c0d12]" : "bg-[#fcfcfd]"
                    }`}
                >
                  <SpaceGlobe theme={theme} />
                </div>

                {/* Card Footer Telemetry */}
                <div
                  className={`grid grid-cols-3 border-t px-4 py-3 font-mono text-[10px] ${isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-200 text-zinc-600"
                    }`}
                >
                  <div>
                    <span className={`block ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>SECURITY</span>
                    <span className={isDark ? "text-zinc-200 font-semibold" : "text-zinc-800 font-semibold"}>
                      100% Private
                    </span>
                  </div>
                  <div className="text-center">
                    <span className={`block ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>LANGUAGES</span>
                    <span className={isDark ? "text-sky-400 font-semibold" : "text-blue-600 font-semibold"}>
                      40+ Supported
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`block ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>ACCESS</span>
                    <span className="text-emerald-500 font-semibold">
                      Open Now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Features Section */}
      <section
        id="features"
        className={`py-24 border-b transition-colors ${isDark ? "border-zinc-800/80 bg-zinc-950" : "border-zinc-200/80 bg-white"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <span className={`font-mono text-xs uppercase tracking-widest block mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                01 // MULTILINGUAL FEATURES
              </span>
              <h2
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-zinc-950"
                  }`}
              >
                AI translation &amp; seamless messaging.
              </h2>
            </div>
            <p className={`text-sm font-mono max-w-md ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Everything you need for natural cross-language communication, optimized for Google Chrome, Safari, Firefox, and Edge.
            </p>
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border rounded-3xl overflow-hidden divide-y md:divide-y-0 md:divide-x shadow-sm ${isDark
              ? "border-zinc-800 divide-zinc-800 bg-zinc-900/40"
              : "border-zinc-200 divide-zinc-200 bg-white"
              }`}
          >
            {/* Feature 01 */}
            <div className={`p-8 space-y-4 transition-colors group ${isDark ? "hover:bg-zinc-800/40" : "hover:bg-zinc-50/80"}`}>
              <span className={`font-mono text-xs font-semibold block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>01 / ACCESS</span>
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${isDark ? "bg-zinc-800 border-zinc-700 text-zinc-200" : "bg-zinc-100 border-zinc-200 text-zinc-800"
                  }`}
              >
                <Icon name="globe" size={20} />
              </div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-950"}`}>Zero-Install Web</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Connect instantly from any browser. No downloads, installations, or storage space taken on your computer.
              </p>
            </div>

            {/* Feature 02 */}
            <div className={`p-8 space-y-4 transition-colors group ${isDark ? "hover:bg-zinc-800/40" : "hover:bg-zinc-50/80"}`}>
              <span className={`font-mono text-xs font-semibold block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>02 / TRANSLATION</span>
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${isDark ? "bg-zinc-800 border-zinc-700 text-zinc-200" : "bg-zinc-100 border-zinc-200 text-zinc-800"
                  }`}
              >
                <Icon name="spark" size={20} />
              </div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-950"}`}>Real-Time AI Translation</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Seamless in-thread translation across 40+ world languages that preserves your natural tone, emotion, and context.
              </p>
            </div>

            {/* Feature 03 */}
            <div className={`p-8 space-y-4 transition-colors group ${isDark ? "hover:bg-zinc-800/40" : "hover:bg-zinc-50/80"}`}>
              <span className={`font-mono text-xs font-semibold block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>03 / PRIVACY</span>
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${isDark ? "bg-zinc-800 border-zinc-700 text-zinc-200" : "bg-zinc-100 border-zinc-200 text-zinc-800"
                  }`}
              >
                <Icon name="shield" size={20} />
              </div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-950"}`}>End-to-End Encrypted</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Your conversations stay between you and the person you are chatting with. Nobody in between can read them.
              </p>
            </div>

            {/* Feature 04 */}
            <div className={`p-8 space-y-4 transition-colors group ${isDark ? "hover:bg-zinc-800/40" : "hover:bg-zinc-50/80"}`}>
              <span className={`font-mono text-xs font-semibold block ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>04 / AUDIO</span>
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center group-hover:scale-105 transition-transform ${isDark ? "bg-zinc-800 border-zinc-700 text-zinc-200" : "bg-zinc-100 border-zinc-200 text-zinc-800"
                  }`}
              >
                <Icon name="mic" size={20} />
              </div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-950"}`}>Voice Notes &amp; Alerts</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Record crisp voice messages with instant automated text transcripts, plus desktop alerts so you never miss a reply.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works - 3D Interactive Platform Simulator */}
      <section
        id="how-it-works"
        className={`py-24 border-b transition-colors relative overflow-hidden ${isDark ? "border-zinc-800/80 bg-[#0c0d12]" : "border-zinc-200/80 bg-[#fafafa]"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className={`font-mono text-xs uppercase tracking-widest block mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              02 // HOW TO USE GABVIA
            </span>
          </div>

          {/* Three.js Interactive 3D Platform Simulator */}
          <AppWorkflow3D theme={theme} />
        </div>
      </section>

      {/* 6. Release Timeline */}
      <section
        id="timeline"
        className={`py-24 border-b transition-colors ${isDark ? "border-zinc-800/80 bg-zinc-950" : "border-zinc-200/80 bg-white"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-16">
            <span className={`font-mono text-xs uppercase tracking-widest block mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              03 // AVAILABILITY
            </span>
            <h2
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight mb-4 ${isDark ? "text-white" : "text-zinc-950"
                }`}
            >
              Multilingual Access Everywhere
            </h2>
            <p className={`text-base ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
              Communicate across borders and languages on Android and universal web right now.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phase 1 */}
            <div
              className={`p-8 rounded-2xl border space-y-4 ${isDark ? "border-zinc-800 bg-zinc-900/40" : "border-zinc-200 bg-zinc-50/50"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs font-bold ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>PHASE 01</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${isDark
                    ? "bg-sky-950/50 text-sky-400 border-sky-800/60"
                    : "bg-sky-50 text-sky-700 border border-sky-200"
                    }`}
                >
                  AVAILABLE NOW
                </span>
              </div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-950"}`}>Android Mobile App</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Full native mobile application available today on Google Play Store with real-time translation and voice messages.
              </p>
              <div className="pt-2">
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-xs font-mono font-semibold hover:underline inline-flex items-center gap-1 ${isDark ? "text-sky-400" : "text-blue-600"
                    }`}
                >
                  <span>Download on Google Play</span>
                  <Icon name="arrow-up-right" size={12} />
                </a>
              </div>
            </div>

            {/* Phase 2 */}
            <div
              className={`p-8 rounded-2xl border-2 space-y-4 shadow-sm relative ${isDark ? "border-emerald-500/70 bg-zinc-900/80 shadow-lg shadow-emerald-950/20" : "border-emerald-600 bg-white shadow-lg shadow-emerald-500/10"
                }`}
            >
              <span
                className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500 text-white shadow-sm"
              >
                LIVE NOW
              </span>
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs font-bold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                  PHASE 02
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-950"}`}>Universal Web Platform</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Browser-based web client for desktop and laptop computers with real-time translation, voice audio, and notifications.
              </p>
              <div className="pt-2">
                <Link
                  href="/chat"
                  className={`text-xs font-mono font-semibold hover:underline inline-flex items-center gap-1 ${isDark ? "text-emerald-400" : "text-emerald-600"
                    }`}
                >
                  <span>Launch Web Chat</span>
                  <Icon name="arrow-up-right" size={12} />
                </Link>
              </div>
            </div>

            {/* Phase 3 */}
            <div
              className={`p-8 rounded-2xl border space-y-4 opacity-75 ${isDark ? "border-zinc-800 bg-zinc-900/40" : "border-zinc-200 bg-zinc-50/50"
                }`}
            >
              <div className="flex items-center justify-between">
                <span className={`font-mono text-xs font-bold ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>PHASE 03</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${isDark ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                    }`}
                >
                  UPCOMING
                </span>
              </div>
              <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-zinc-950"}`}>Standalone Desktop Apps</h3>
              <p className={`text-sm leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Dedicated native desktop applications for macOS, Windows, and Linux with system tray integration and offline tools.
              </p>
              <div className={`pt-2 text-xs font-mono ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>Planned for later this year</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section
        id="faq"
        className={`py-24 border-b transition-colors ${isDark ? "border-zinc-800/80 bg-[#0c0d12]" : "border-zinc-200/80 bg-[#fafafa]"
          }`}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className={`font-mono text-xs uppercase tracking-widest block mb-2 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
              04 // QUESTIONS
            </span>
            <h2
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-zinc-950"
                }`}
            >
              Multilingual Communication Platform FAQ
            </h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((item, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`rounded-2xl border overflow-hidden transition-all shadow-sm ${isDark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white"
                    }`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className={`w-full p-6 text-left flex items-center justify-between gap-4 font-semibold transition-colors ${isDark
                      ? "text-zinc-100 hover:bg-zinc-800/50"
                      : "text-zinc-950 hover:bg-zinc-50/60"
                      }`}
                  >
                    <span className="text-base sm:text-lg">{item.q}</span>
                    <span className={`font-mono text-lg flex-shrink-0 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div
                      className={`px-6 pb-6 text-sm leading-relaxed border-t pt-4 ${isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-100 text-zinc-600"
                        }`}
                    >
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Minimalist Footer */}
      <footer className={`py-16 transition-colors ${isDark ? "bg-zinc-950" : "bg-white"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b ${isDark ? "border-zinc-800" : "border-zinc-200/80"
              }`}
          >
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Gabvia" width={28} height={28} className="object-contain" />
              <span className={`font-bold text-lg tracking-tight ${isDark ? "text-white" : "text-zinc-950"}`}>
                Gabvia
              </span>
              <span className={`font-mono text-xs ml-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                / Different languages. One conversation.
              </span>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono">
              <Link
                href="/privacy"
                className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"} transition-colors`}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"} transition-colors`}
              >
                Terms of Service
              </Link>
              <Link
                href="/translator"
                className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"} transition-colors`}
              >
                Translator
              </Link>
              <Link
                href="/chat"
                className={`${isDark ? "text-emerald-400 hover:text-emerald-300" : "text-emerald-600 hover:text-emerald-700"} font-semibold transition-colors`}
              >
                Web Chat (Live)
              </Link>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"} transition-colors`}
              >
                Google Play
              </a>
            </div>
          </div>

          <div className={`pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
            <div>© {new Date().getFullYear()} Gabvia Technologies Inc. All rights reserved.</div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>WEB PLATFORM LIVE · READY</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
