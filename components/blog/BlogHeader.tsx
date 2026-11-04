"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { PLAY_STORE_URL, GooglePlayIcon, Icon } from "@/components/landing/shared";
import { Menu, X, Sun, Moon, Sparkles, BookOpen } from "lucide-react";

interface BlogHeaderProps {
  currentCategory?: string;
}

export function BlogHeader({ currentCategory }: BlogHeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

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

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            <Link
              href="/"
              className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"} transition-colors`}
            >
              Home
            </Link>
            <Link
              href="/#features"
              className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"} transition-colors`}
            >
              Features
            </Link>
            <Link
              href="/blog"
              className={`font-semibold flex items-center gap-1.5 ${
                isDark ? "text-sky-400" : "text-blue-600"
              } transition-colors`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Blog</span>
            </Link>
            <Link
              href="/translator"
              className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"} transition-colors flex items-center gap-1.5`}
            >
              <span>Translator</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  isDark ? "bg-zinc-900 text-zinc-400 border-zinc-800" : "bg-zinc-100 text-zinc-600 border-zinc-200"
                }`}
              >
                TOOL
              </span>
            </Link>
            <Link
              href="/chat"
              className={`${
                isDark ? "text-sky-400 hover:text-sky-300 font-semibold" : "text-blue-600 hover:text-blue-500 font-semibold"
              } transition-colors flex items-center gap-1.5`}
            >
              <span>Web Chat</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  isDark ? "bg-sky-950/60 text-sky-400 border-sky-800" : "bg-sky-50 text-blue-700 border-sky-200"
                }`}
              >
                LIVE
              </span>
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
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
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
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
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

        {/* Mobile Dropdown */}
        {menuOpen && (
          <div
            className={`md:hidden border-t px-4 py-5 space-y-3 ${
              isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white"
            }`}
          >
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              Home
            </Link>
            <Link
              href="/#features"
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-medium ${isDark ? "text-zinc-300" : "text-zinc-700"}`}
            >
              Features
            </Link>
            <Link
              href="/blog"
              onClick={() => setMenuOpen(false)}
              className={`block text-sm font-bold ${isDark ? "text-sky-400" : "text-blue-600"}`}
            >
              Blog &amp; News
            </Link>
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
              className={`block text-sm font-semibold ${isDark ? "text-emerald-400" : "text-emerald-600"}`}
            >
              Web Chat (Live)
            </Link>
            <div className={`pt-3 border-t flex flex-col gap-2 ${isDark ? "border-zinc-800" : "border-zinc-100"}`}>
              <Link
                href="/chat"
                onClick={() => setMenuOpen(false)}
                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  isDark
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                    : "bg-gradient-to-r from-blue-600 to-sky-600 text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Web Chat</span>
              </Link>
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold border ${
                  isDark ? "text-white bg-zinc-900 border-zinc-800" : "text-zinc-900 bg-zinc-100 border-zinc-200"
                }`}
              >
                <GooglePlayIcon size={14} />
                <span>Get Android App</span>
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

