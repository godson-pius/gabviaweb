"use client";

import { AppWorkflow3D } from "@/components/landing/AppWorkflow3D";
// import { UgandaIndependenceHero } from "@/components/landing/UgandaIndependenceHero";
import { GabviaHero } from "@/components/landing/GabviaHero";
import { GooglePlayIcon, Icon, PLAY_STORE_URL } from "@/components/landing/shared";
import { SupportFeedback3D } from "@/components/landing/SupportFeedback3D";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

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
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("gabvia-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
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

      {/* ========================================================================= */}
      {/* CANONICAL GABVIA HERO SECTION                                             */}
      {/* ========================================================================= */}
      <GabviaHero isDark={isDark} theme={theme} />

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

      {/* 8. 3D Support & Feedback Community Hub */}
      <SupportFeedback3D theme={isDark ? "dark" : "light"} />

      {/* 9. Minimalist Footer */}
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
                href="/support"
                className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"} transition-colors`}
              >
                Support
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
