"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PLAY_STORE_URL, GooglePlayIcon, Icon } from "@/components/landing/shared";
import {
  Menu,
  X,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  ChevronDown,
  Layers,
  Activity,
  HelpCircle,
  Languages,
} from "lucide-react";

interface BlogHeaderProps {
  currentCategory?: string;
}

export function BlogHeader({ currentCategory }: BlogHeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<"platform" | "tools" | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("gabvia-theme");
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      if (saved === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("gabvia-theme", next);
      if (next === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        document.documentElement.classList.add("dark");
      }
      return next;
    });
  };

  const isDark = theme === "dark";

  return (
    <>
      {/* Top Banner */}
      <div
        className={`border-b sticky top-0 z-50 backdrop-blur-md transition-colors ${
          isDark
            ? "border-zinc-800/80 bg-zinc-950/90 text-zinc-300"
            : "border-zinc-200/80 bg-white/95 text-zinc-950"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className={`font-semibold uppercase tracking-wider ${isDark ? "text-zinc-100" : "text-zinc-950"}`}>
              [ GABVIA INSIGHTS ]
            </span>
            <span className="text-zinc-500 hidden sm:inline">—</span>
            <span className={`${isDark ? "text-zinc-400" : "text-zinc-600"} truncate`}>
              Official Blog &amp; Product Updates · Real-time multilingual communication.
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/chat"
              className={`px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                isDark
                  ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/60 hover:bg-emerald-900/60"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              LAUNCH WEB CHAT →
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`border-b transition-colors backdrop-blur-md sticky top-[37px] z-40 ${
          isDark ? "border-zinc-800/80 bg-zinc-950/80" : "border-zinc-200/80 bg-white/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center p-1 shadow-sm transition-colors ${
                  isDark
                    ? "bg-zinc-900 border-zinc-800 group-hover:border-zinc-700"
                    : "bg-white border-zinc-200 group-hover:border-zinc-400"
                }`}
              >
                <Image src="/logo.png" alt="Gabvia" width={32} height={32} priority className="object-contain" />
              </div>
              <div>
                <span className={`font-bold text-xl tracking-tight block leading-tight ${isDark ? "text-white" : "text-zinc-950"}`}>
                  Gabvia
                </span>
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block">
                  Blog &amp; News
                </span>
              </div>
            </Link>
          </div>

          {/* Grouped Navigation Links */}
          <nav ref={dropdownRef} className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium">
            {/* 1. Platform Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("platform")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "platform" ? null : "platform")}
                className={`flex items-center gap-1.5 py-2 transition-colors ${
                  activeDropdown === "platform"
                    ? isDark ? "text-white" : "text-zinc-950"
                    : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"
                }`}
                aria-expanded={activeDropdown === "platform"}
              >
                <span>Platform</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === "platform" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeDropdown === "platform" && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div
                    className={`w-72 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl transition-all duration-150 animate-in fade-in slide-in-from-top-1 ${
                      isDark
                        ? "border-zinc-800 bg-zinc-950/95 shadow-zinc-950/80"
                        : "border-zinc-200 bg-white/95 shadow-zinc-200/50"
                    }`}
                  >
                    <Link
                      href="/"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        isDark ? "hover:bg-zinc-900/80 text-zinc-300 hover:text-white" : "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-sky-500/20">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`block text-xs font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>Home</span>
                        <span className={`block text-[11px] leading-tight ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Overview &amp; live platform status</span>
                      </div>
                    </Link>

                    <Link
                      href="/#features"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        isDark ? "hover:bg-zinc-900/80 text-zinc-300 hover:text-white" : "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/20">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`block text-xs font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>Features</span>
                        <span className={`block text-[11px] leading-tight ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>AI in-thread translation, voice &amp; E2EE</span>
                      </div>
                    </Link>

                    <Link
                      href="/#how-it-works"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        isDark ? "hover:bg-zinc-900/80 text-zinc-300 hover:text-white" : "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-indigo-500/20">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`block text-xs font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>How It Works</span>
                        <span className={`block text-[11px] leading-tight ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Interactive 3D workflow simulation</span>
                      </div>
                    </Link>

                    <Link
                      href="/#faq"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        isDark ? "hover:bg-zinc-900/80 text-zinc-300 hover:text-white" : "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-500/20">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <span className={`block text-xs font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>FAQ</span>
                        <span className={`block text-[11px] leading-tight ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Common questions &amp; privacy details</span>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Tools & Apps Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setActiveDropdown("tools")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button
                type="button"
                onClick={() => setActiveDropdown(activeDropdown === "tools" ? null : "tools")}
                className={`flex items-center gap-1.5 py-2 transition-colors ${
                  activeDropdown === "tools"
                    ? isDark ? "text-white" : "text-zinc-950"
                    : isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"
                }`}
                aria-expanded={activeDropdown === "tools"}
              >
                <span>Tools &amp; Apps</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === "tools" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeDropdown === "tools" && (
                <div className="absolute top-full left-0 pt-2 z-50">
                  <div
                    className={`w-80 rounded-2xl border p-2 shadow-2xl backdrop-blur-xl transition-all duration-150 animate-in fade-in slide-in-from-top-1 ${
                      isDark
                        ? "border-zinc-800 bg-zinc-950/95 shadow-zinc-950/80"
                        : "border-zinc-200 bg-white/95 shadow-zinc-200/50"
                    }`}
                  >
                    <Link
                      href="/chat"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        isDark ? "hover:bg-zinc-900/80 text-zinc-300 hover:text-white" : "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-sky-500/20">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>Web Chat</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950/60 text-sky-400 border border-sky-800">
                            LIVE
                          </span>
                        </div>
                        <span className={`block text-[11px] leading-tight ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>In-browser zero-install multilingual chat</span>
                      </div>
                    </Link>

                    <Link
                      href="/translator"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        isDark ? "hover:bg-zinc-900/80 text-zinc-300 hover:text-white" : "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/20">
                        <Languages className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>Translator Tool</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                            TOOL
                          </span>
                        </div>
                        <span className={`block text-[11px] leading-tight ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Free instant speech &amp; text in 40+ languages</span>
                      </div>
                    </Link>

                    <a
                      href={PLAY_STORE_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setActiveDropdown(null)}
                      className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                        isDark ? "hover:bg-zinc-900/80 text-zinc-300 hover:text-white" : "hover:bg-zinc-100 text-zinc-700 hover:text-zinc-950"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-300 flex items-center justify-center flex-shrink-0 mt-0.5 border border-zinc-700">
                        <GooglePlayIcon size={16} />
                      </div>
                      <div>
                        <span className={`block text-xs font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>Android Mobile App</span>
                        <span className={`block text-[11px] leading-tight ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Available now on the Google Play Store</span>
                      </div>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Direct Link: Blog (Active) */}
            <Link
              href="/blog"
              className={`font-semibold flex items-center gap-1.5 ${
                isDark ? "text-sky-400" : "text-blue-600"
              } transition-colors`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Blog</span>
            </Link>

            {/* 4. Direct Link: Support */}
            <Link
              href="/support"
              className={`${
                isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"
              } transition-colors`}
            >
              Support
            </Link>
          </nav>

          {/* Actions & Theme Toggle */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              type="button"
              className={`p-2 px-3 rounded-xl border flex items-center gap-2 text-xs font-mono transition-colors ${
                isDark
                  ? "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200"
              }`}
              aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>

            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden lg:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                isDark
                  ? "text-zinc-200 bg-zinc-900 hover:bg-zinc-800 border-zinc-800"
                  : "text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border-zinc-200"
              }`}
            >
              <GooglePlayIcon size={14} />
              <span>Android App</span>
            </a>

            <Link
              href="/chat"
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isDark
                  ? "bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-sky-950/40"
                  : "bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white shadow-blue-500/20"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Web Chat</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border ${
                isDark ? "border-zinc-800 text-zinc-300" : "border-zinc-200 text-zinc-600"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-lg border ${
                isDark ? "border-zinc-800 text-zinc-300 hover:text-white" : "border-zinc-200 text-zinc-600 hover:text-zinc-950"
              }`}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Grouped Mobile Dropdown */}
        {menuOpen && (
          <div
            className={`md:hidden border-t px-5 py-6 space-y-6 ${
              isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white"
            }`}
          >
            {/* Group 1: Platform */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block px-1">
                Platform
              </span>
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-2.5 py-1.5 rounded-lg text-sm font-medium ${isDark ? "text-zinc-300 hover:bg-zinc-900" : "text-zinc-700 hover:bg-zinc-100"}`}
                >
                  Home
                </Link>
                <Link
                  href="/#features"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-2.5 py-1.5 rounded-lg text-sm font-medium ${isDark ? "text-zinc-300 hover:bg-zinc-900" : "text-zinc-700 hover:bg-zinc-100"}`}
                >
                  Features
                </Link>
                <Link
                  href="/#how-it-works"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-2.5 py-1.5 rounded-lg text-sm font-medium ${isDark ? "text-zinc-300 hover:bg-zinc-900" : "text-zinc-700 hover:bg-zinc-100"}`}
                >
                  How It Works
                </Link>
                <Link
                  href="/#faq"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-2.5 py-1.5 rounded-lg text-sm font-medium ${isDark ? "text-zinc-300 hover:bg-zinc-900" : "text-zinc-700 hover:bg-zinc-100"}`}
                >
                  FAQ
                </Link>
              </div>
            </div>

            {/* Group 2: Tools & Apps */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block px-1">
                Tools &amp; Apps
              </span>
              <div className="space-y-1">
                <Link
                  href="/chat"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm font-bold ${isDark ? "text-sky-400 hover:bg-zinc-900" : "text-blue-600 hover:bg-zinc-100"}`}
                >
                  <span>Web Chat</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-950/60 text-sky-400 border border-sky-800">
                    LIVE
                  </span>
                </Link>
                <Link
                  href="/translator"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm font-medium ${isDark ? "text-zinc-300 hover:bg-zinc-900" : "text-zinc-700 hover:bg-zinc-100"}`}
                >
                  <span>Translator Tool</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-zinc-900 text-zinc-400 border-zinc-800">
                    TOOL
                  </span>
                </Link>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block px-2.5 py-1.5 rounded-lg text-sm font-medium ${isDark ? "text-zinc-300 hover:bg-zinc-900" : "text-zinc-700 hover:bg-zinc-100"}`}
                >
                  Android App (Google Play)
                </a>
              </div>
            </div>

            {/* Group 3: Resources */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold block px-1">
                Resources
              </span>
              <div className="space-y-1">
                <Link
                  href="/blog"
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-sm font-bold ${isDark ? "text-sky-400 hover:bg-zinc-900" : "text-blue-600 hover:bg-zinc-100"}`}
                >
                  <span>Blog &amp; News</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded border bg-zinc-900 text-zinc-400 border-zinc-800">
                    ACTIVE
                  </span>
                </Link>
                <Link
                  href="/support"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-2.5 py-1.5 rounded-lg text-sm font-medium ${isDark ? "text-zinc-300 hover:bg-zinc-900" : "text-zinc-700 hover:bg-zinc-100"}`}
                >
                  Support &amp; Feedback
                </Link>
              </div>
            </div>

            {/* Actions */}
            <div className={`pt-4 border-t flex flex-col gap-2.5 ${isDark ? "border-zinc-800" : "border-zinc-200"}`}>
              <Link
                href="/chat"
                onClick={() => setMenuOpen(false)}
                className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isDark
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-950/40"
                    : "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-blue-500/20"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Web Chat</span>
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

