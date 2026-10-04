"use client";

import Link from "next/link";
import React from "react";
import { GooglePlayIcon, Icon, PLAY_STORE_URL } from "./shared";
import { SpaceGlobe } from "./SpaceGlobe";

interface GabviaHeroProps {
  isDark: boolean;
  theme: "light" | "dark";
}

/** Canonical Gabvia landing hero. Swap with a seasonal hero in app/page.tsx when needed. */
export function GabviaHero({ isDark, theme }: GabviaHeroProps) {
  return (
        <section
          className={`relative overflow-hidden border-b transition-colors pt-12 pb-20 lg:pt-20 lg:pb-28 ${isDark ? "border-zinc-800/80 bg-zinc-950" : "border-zinc-200/80 bg-white"
            }`}
        >
          {/*  Architectural Grid Lines  */}
          <div
            className={`absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none ${isDark
              ? "bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] opacity-40"
              : "bg-[linear-gradient(to_right,#f1f1f4_1px,transparent_1px),linear-gradient(to_bottom,#f1f1f4_1px,transparent_1px)] opacity-60"
              }`}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/*  Left Column: Announcement & Value Proposition  */}
              <div className="lg:col-span-7 space-y-8">
                {/*  Badge  */}
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

                {/*  Headline  */}
                <div className="space-y-4">
                  <h1
                    className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] ${isDark ? "text-white" : "text-zinc-950"
                      }`}
                  >
                    The multilingual communication platform. <br />
                  </h1>
                  <p
                    className={`text-base sm:text-lg max-w-2xl leading-relaxed ${isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                  >
                    Gabvia is the real-time multilingual communication platform. Message, talk, and share voice notes with anyone across 40+ languages with in-flow AI translation and end-to-end privacy — directly from Chrome, Safari, Firefox, and Edge.
                  </p>
                </div>

                {/*  Hero Action Buttons  */}
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

                {/*  Minimal Value Points  */}
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

              {/*  Right Column: SpaceFS Interactive 3D Canvas  */}
              <div className="lg:col-span-5">
                <div
                  className={`relative rounded-3xl border p-2 shadow-sm transition-colors ${isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-200 bg-white"
                    }`}
                >
                  {/*  SpaceFS Corner Crosshairs (+)  */}
                  <span className="absolute -top-2 -left-2 text-zinc-500 font-mono text-sm select-none">+</span>
                  <span className="absolute -top-2 -right-2 text-zinc-500 font-mono text-sm select-none">+</span>
                  <span className="absolute -bottom-2 -left-2 text-zinc-500 font-mono text-sm select-none">+</span>
                  <span className="absolute -bottom-2 -right-2 text-zinc-500 font-mono text-sm select-none">+</span>

                  {/*  Card Header  */}
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

                  {/*  3D Canvas  */}
                  <div
                    className={`h-[400px] sm:h-[460px] w-full rounded-2xl flex items-center justify-center overflow-hidden transition-colors ${isDark ? "bg-[#0c0d12]" : "bg-[#fcfcfd]"
                      }`}
                  >
                    <SpaceGlobe theme={theme} />
                  </div>

                  {/*  Card Footer Telemetry  */}
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
  );
}
