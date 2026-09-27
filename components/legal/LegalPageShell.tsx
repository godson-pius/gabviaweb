"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  FileText,
  Trash2,
  Lock,
  Sun,
  Moon,
  MessageSquare,
  Languages,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Mail,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export type LegalDocType = "privacy" | "terms" | "delete-account";

export interface TocItem {
  id: string;
  label: string;
}

interface LegalPageShellProps {
  current: LegalDocType;
  eyebrow: string;
  title: string;
  lead: string;
  meta: string[];
  notice?: {
    tag: string;
    text: string;
    variant?: "info" | "warning";
  };
  toc: TocItem[];
  asideCopy: string;
  children: React.ReactNode;
}

export function LegalPageShell({
  current,
  eyebrow,
  title,
  lead,
  meta,
  notice,
  toc,
  asideCopy,
  children,
}: LegalPageShellProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const saved = localStorage.getItem("gabvia-theme") as "light" | "dark" | null;
    if (saved === "dark" || saved === "light") {
      setTheme(saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("gabvia-theme", next);
  };

  const isDark = theme === "dark";

  // Intersection observer to highlight current section in TOC
  useEffect(() => {
    const sectionIds = toc.map((item) => item.id).filter(Boolean);
    if (sectionIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  const navLinks = [
    { href: "/privacy", label: "Privacy Policy", id: "privacy", icon: Shield },
    { href: "/terms", label: "Terms of Service", id: "terms", icon: FileText },
    { href: "/delete-account", label: "Delete Account", id: "delete-account", icon: Trash2 },
  ];

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-300 relative flex flex-col ${
        isDark
          ? "bg-[#09090b] text-[#f4f4f5] selection:bg-sky-500/30 selection:text-sky-200"
          : "bg-[#fafafa] text-[#09090b] selection:bg-blue-500/20 selection:text-blue-900"
      }`}
    >
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className={`absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] transition-opacity duration-500 ${
            isDark ? "bg-sky-500/10 opacity-70" : "bg-sky-400/10 opacity-40"
          }`}
        />
        <div
          className={`absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full blur-[140px] transition-opacity duration-500 ${
            isDark ? "bg-blue-600/10 opacity-70" : "bg-blue-500/10 opacity-30"
          }`}
        />
        <div
          className={`absolute bottom-0 left-1/3 w-[500px] h-[500px] rounded-full blur-[160px] transition-opacity duration-500 ${
            isDark ? "bg-cyan-500/5 opacity-50" : "bg-blue-400/5 opacity-30"
          }`}
        />
      </div>

      {/* TOP HEADER */}
      <header
        className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-200 ${
          isDark
            ? "border-zinc-800/80 bg-zinc-950/80"
            : "border-zinc-200/80 bg-white/90"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div
              className={`w-9 h-9 rounded-xl overflow-hidden border shadow-xs flex items-center justify-center transition-colors ${
                isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"
              }`}
            >
              <Image src="/logo.png" alt="Gabvia" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`font-bold text-lg tracking-tight transition-colors ${
                  isDark ? "text-white group-hover:text-sky-400" : "text-zinc-950 group-hover:text-blue-600"
                }`}
              >
                Gabvia
              </span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                Legal
              </span>
            </div>
          </Link>

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl border transition-colors bg-zinc-950/40 border-zinc-800/80">
            {navLinks.map((link) => {
              const isActive = current === link.id;
              const IconComp = link.icon;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 !text-white shadow-sm"
                      : isDark
                      ? "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                      : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Dedicated Translator */}
            <Link
              href="/translator"
              className={`p-2 rounded-xl border transition-colors hidden sm:flex items-center gap-1 text-xs font-semibold ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-sky-400 hover:bg-zinc-800"
                  : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-blue-600 hover:bg-zinc-200"
              }`}
              title="Translator Tool"
            >
              <Languages className="w-4 h-4" />
              <span className="hidden lg:inline">Translator</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              type="button"
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
                  : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200"
              }`}
              title={`Switch to ${isDark ? "light" : "dark"} theme`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>

            {/* Web Chat CTA */}
            <Link
              href="/chat"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Launch Chat</span>
            </Link>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div
          className={`md:hidden px-4 py-2 border-t flex items-center justify-around gap-1 text-xs font-semibold overflow-x-auto ${
            isDark ? "border-zinc-800/60 bg-zinc-950/60" : "border-zinc-200/60 bg-zinc-50/80"
          }`}
        >
          {navLinks.map((link) => {
            const isActive = current === link.id;
            return (
              <Link
                key={link.id}
                href={link.href}
                className={`px-3 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30"
                    : isDark
                    ? "text-zinc-400 hover:text-white"
                    : "text-zinc-600 hover:text-zinc-950"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-8 lg:gap-14 items-start">
          {/* SIDEBAR (Sticky on Desktop) */}
          <aside className="hidden lg:block sticky top-24 space-y-6">
            <div
              className={`p-5 rounded-3xl border transition-colors ${
                isDark
                  ? "bg-zinc-900/60 border-zinc-800/80 backdrop-blur-md"
                  : "bg-white/80 border-zinc-200/80 shadow-sm backdrop-blur-md"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-sky-400" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400">
                  Gabvia Trust & Legal
                </span>
              </div>
              <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                {asideCopy}
              </p>

              {/* Table of contents */}
              {toc.length > 0 && (
                <div className="mt-5 pt-5 border-t border-zinc-800/60">
                  <h4 className={`text-[11px] font-mono uppercase tracking-wider font-bold mb-3 ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                    Table of Contents
                  </h4>
                  <nav className="space-y-1">
                    {toc.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all ${
                            isActive
                              ? "bg-sky-500/15 text-sky-400 font-bold border border-sky-500/30"
                              : isDark
                              ? "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                              : "text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100"
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          <ChevronRight
                            className={`w-3 h-3 transition-transform ${
                              isActive ? "text-sky-400 translate-x-0.5" : "text-zinc-600 group-hover:text-zinc-400"
                            }`}
                          />
                        </a>
                      );
                    })}
                  </nav>
                </div>
              )}
            </div>

            {/* Compliance & Security Card */}
            <div
              className={`p-4 rounded-2xl border transition-colors space-y-3 ${
                isDark ? "bg-zinc-950/60 border-zinc-800/80" : "bg-blue-50/50 border-blue-200/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-sky-400" />
                <span className={`text-xs font-bold ${isDark ? "text-white" : "text-zinc-950"}`}>
                  End-to-End Encryption
                </span>
              </div>
              <p className={`text-[11px] leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Direct conversations are cryptographically protected. Only you and your recipient hold the keys.
              </p>
              <div className="pt-2 border-t border-zinc-800/40 flex items-center gap-1.5 text-[11px] text-sky-400">
                <Mail className="w-3.5 h-3.5" />
                <a href="mailto:legal@gabvia.app" className="hover:underline font-medium">
                  legal@gabvia.app
                </a>
              </div>
            </div>
          </aside>

          {/* MAIN DOCUMENT ARTICLE */}
          <article
            className={`min-w-0 p-6 sm:p-10 lg:p-12 rounded-3xl border transition-colors shadow-xl ${
              isDark
                ? "bg-zinc-900/70 border-zinc-800/90 backdrop-blur-md shadow-black/40"
                : "bg-white border-zinc-200 shadow-zinc-200/50"
            }`}
          >
            {/* Document Header */}
            <div className="pb-8 border-b border-zinc-800/60 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-sky-500/10 text-sky-400 border border-sky-500/25">
                <Shield className="w-3.5 h-3.5" />
                <span>{eyebrow}</span>
              </div>

              <h1
                className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.08] ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
              >
                {title}
              </h1>

              <p className={`text-base sm:text-lg leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                {lead}
              </p>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {meta.map((item, idx) => (
                  <span
                    key={idx}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium border ${
                      isDark
                        ? "bg-zinc-950/60 border-zinc-800 text-zinc-400"
                        : "bg-zinc-100 border-zinc-200 text-zinc-600"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 text-sky-400" />
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Optional Callout / Summary Banner */}
            {notice && (
              <div
                className={`my-8 p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 transition-colors ${
                  notice.variant === "warning"
                    ? isDark
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                    : isDark
                    ? "bg-gradient-to-r from-sky-500/15 via-blue-500/10 to-transparent border-sky-500/30 text-sky-100"
                    : "bg-gradient-to-r from-sky-50 via-blue-50 to-transparent border-blue-200 text-blue-950"
                }`}
              >
                <div
                  className={`p-2 rounded-xl shrink-0 ${
                    notice.variant === "warning"
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-sky-500/20 text-sky-400"
                  }`}
                >
                  {notice.variant === "warning" ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-xs uppercase tracking-wider mb-1">
                    {notice.tag}
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed opacity-90">
                    {notice.text}
                  </p>
                </div>
              </div>
            )}

            {/* Document Content Flow with modern typography */}
            <div
              className={`legal-content-body space-y-10 leading-relaxed text-sm sm:text-base ${
                isDark ? "text-zinc-300" : "text-zinc-700"
              }`}
            >
              {children}
            </div>
          </article>
        </div>
      </main>

      {/* MINIMALIST SITE FOOTER */}
      <footer
        className={`mt-auto border-t transition-colors ${
          isDark ? "border-zinc-800/80 bg-zinc-950" : "border-zinc-200/80 bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-800/40">
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Gabvia" width={28} height={28} className="object-contain" />
              <span className={`font-bold text-base tracking-tight ${isDark ? "text-white" : "text-zinc-950"}`}>
                Gabvia
              </span>
              <span className={`font-mono text-xs ml-2 ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                / Different languages. One conversation.
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono">
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
                href="/delete-account"
                className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"} transition-colors`}
              >
                Delete Account
              </Link>
              <Link
                href="/translator"
                className={`${isDark ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-950"} transition-colors`}
              >
                Translator
              </Link>
              <Link
                href="/chat"
                className={`${isDark ? "text-sky-400 hover:text-sky-300 font-bold" : "text-blue-600 hover:text-blue-700 font-bold"} transition-colors`}
              >
                Web Chat ↗
              </Link>
            </div>
          </div>

          <div
            className={`pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono ${
              isDark ? "text-zinc-500" : "text-zinc-500"
            }`}
          >
            <div>© {new Date().getFullYear()} Gabvia Technologies Inc. Made for every voice.</div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              <span>LEGAL COMPLIANCE VERIFIED</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
