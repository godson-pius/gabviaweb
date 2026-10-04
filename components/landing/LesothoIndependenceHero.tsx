"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { LesothoHistoryModal } from "./LesothoHistoryModal";
import { LesothoIndependence3D } from "./LesothoIndependence3D";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.gabvia&pcampaignid=web_share";

const ANTHEM = {
  title: "Lesotho Fatše La Bo-ntata Rona",
  subtitle: "National Anthem of Lesotho",
  src: "/lesotho-national-anthem.m4a",
  credit: "Recording: U.S. Navy Band (public domain)",
};

function formatTime(s: number) {
  if (!isFinite(s) || s <= 0) return "0:00";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

const GREETINGS = [
  {
    language: "Sesotho",
    greeting: "Ho keteka Matsatsi a Boipuso, Lesotho! Khotso, Pula, Nala!",
    translation: "Happy Independence Day, Lesotho! Peace, Rain, Prosperity!",
  },
  {
    language: "English",
    greeting: "Happy 60th Independence Day to the Kingdom in the Sky!",
    translation: "Celebrating six decades of freedom, unity and pride.",
  },
];

interface LesothoIndependenceHeroProps {
  isDark: boolean;
  theme?: "light" | "dark";
}

export function LesothoIndependenceHero({ isDark, theme }: LesothoIndependenceHeroProps) {
  const [greetingIdx, setGreetingIdx] = useState(0);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [cheers, setCheers] = useState(60);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const toggleAnthem = async () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      try {
        await a.play();
        setPlaying(true);
      } catch (err) {
        console.error("Anthem playback error:", err);
      }
    }
  };

  useEffect(() => {
    const id = setInterval(() => setGreetingIdx((i) => (i + 1) % GREETINGS.length), 5000);
    return () => clearInterval(id);
  }, []);

  const g = GREETINGS[greetingIdx];

  return (
    <>
      <section
        aria-labelledby="lesotho-hero-title"
        className={`relative overflow-hidden border-b transition-colors pt-10 pb-20 lg:pt-16 lg:pb-28 ${
          isDark ? "border-blue-950 bg-[#050816]" : "border-blue-100 bg-[#f6f9ff]"
        }`}
      >
        {/* Atmospheric flag-colour glows */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDark
              ? "radial-gradient(ellipse 55% 55% at 15% 0%, rgba(0,32,159,0.45), transparent 70%), radial-gradient(ellipse 50% 50% at 90% 100%, rgba(0,149,67,0.30), transparent 70%)"
              : "radial-gradient(ellipse 55% 55% at 15% 0%, rgba(0,32,159,0.16), transparent 70%), radial-gradient(ellipse 50% 50% at 90% 100%, rgba(0,149,67,0.16), transparent 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className={`absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none ${
            isDark
              ? "bg-[linear-gradient(to_right,#0b1a4a_1px,transparent_1px),linear-gradient(to_bottom,#0b1a4a_1px,transparent_1px)] opacity-40"
              : "bg-[linear-gradient(to_right,#dbe6ff_1px,transparent_1px),linear-gradient(to_bottom,#dbe6ff_1px,transparent_1px)] opacity-70"
          }`}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Copy */}
            <div className="lg:col-span-6 space-y-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <div
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border font-mono text-xs shadow-sm ${
                    isDark ? "border-blue-700/60 bg-blue-950/70 text-blue-200" : "border-blue-300 bg-blue-50 text-blue-900"
                  }`}
                >
                  <span aria-hidden="true" className="text-base leading-none">🇱🇸</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold tracking-wide text-blue-500">LESOTHO AT 60</span>
                  <span className="opacity-50">|</span>
                  <span className="font-semibold tracking-wider text-[11px]">1966 — 2026</span>
                </div>
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full border font-mono text-[11px] ${
                    isDark ? "border-amber-500/30 bg-amber-950/40 text-amber-300" : "border-amber-300 bg-amber-50 text-amber-800"
                  }`}
                >
                  ⭐ 4 OCTOBER · INDEPENDENCE DAY
                </div>
              </div>

              <div className="space-y-4">
                <h1
                  id="lesotho-hero-title"
                  className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] ${
                    isDark ? "text-white" : "text-slate-950"
                  }`}
                >
                  Happy 60th Independence Day,{" "}
                  <span className="bg-gradient-to-r from-blue-500 via-sky-300 to-emerald-400 bg-clip-text text-transparent inline-block">
                    Lesotho!
                  </span>
                </h1>
                <p className={`text-base sm:text-lg max-w-2xl leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  Sixty years of peace, rain and prosperity. From Maseru to the Maloti Mountains and across the
                  Basotho diaspora, Gabvia lets you chat, talk and share voice notes in{" "}
                  <strong className={isDark ? "text-white" : "text-slate-900"}>Sesotho</strong>, English and 40+
                  languages, with in-flow AI translation.
                </p>
              </div>

              {/* Greeting card */}
              <div
                aria-live="polite"
                className={`p-5 rounded-2xl border backdrop-blur-sm ${
                  isDark ? "border-blue-900/60 bg-blue-950/30" : "border-blue-200 bg-white shadow-sm"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-xs font-mono font-bold tracking-wider text-emerald-500 uppercase mr-1">
                    Greeting in
                  </span>
                  {GREETINGS.map((item, idx) => (
                    <button
                      key={item.language}
                      type="button"
                      onClick={() => setGreetingIdx(idx)}
                      aria-pressed={greetingIdx === idx}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        greetingIdx === idx
                          ? "bg-blue-600 text-white shadow-sm"
                          : isDark
                            ? "bg-slate-900/60 text-slate-400 hover:text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {item.language}
                    </button>
                  ))}
                </div>
                <p className={`text-lg sm:text-xl font-bold italic ${isDark ? "text-blue-100" : "text-blue-950"}`}>
                  “{g.greeting}”
                </p>
                <p className={`text-xs sm:text-sm font-mono mt-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  <span className="text-emerald-500 font-bold">EN:</span> {g.translation}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all shadow-lg active:scale-[0.98] text-white bg-gradient-to-r from-blue-600 via-blue-600 to-emerald-600 hover:brightness-110 shadow-blue-600/30"
                >
                  🎉 Celebrate &amp; Chat Free on Web →
                </Link>
                <button
                  type="button"
                  onClick={() => setCheers((c) => c + 1)}
                  className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold border transition-all active:scale-95 ${
                    isDark
                      ? "border-blue-800/80 bg-blue-950/40 text-blue-200 hover:bg-blue-900/60"
                      : "border-blue-300 bg-white text-blue-900 hover:bg-blue-50"
                  }`}
                >
                  🇱🇸 Cheer <span className="font-mono text-xs opacity-80">{cheers}</span>
                </button>
                <a
                  href={PLAY_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center px-5 py-3.5 rounded-full text-sm font-semibold border transition-all ${
                    isDark
                      ? "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300"
                      : "border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                  }`}
                >
                  Get App
                </a>
              </div>
            </div>

            {/* 3D */}
            <div className="lg:col-span-6">
              <div
                className={`relative rounded-3xl border p-2 shadow-2xl ${
                  isDark ? "border-blue-900/60 bg-[#070c22]/80 shadow-blue-950/60" : "border-blue-200 bg-white shadow-blue-100"
                }`}
              >
                <div
                  className={`flex items-center justify-between px-4 py-3 border-b font-mono text-[11px] ${
                    isDark ? "border-blue-900/60 text-blue-300" : "border-blue-100 text-blue-700"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    KINGDOM OF LESOTHO
                  </span>
                  <span className="uppercase tracking-wider">Drag to spin</span>
                </div>
                <div className="relative h-[480px] sm:h-[540px] rounded-2xl overflow-hidden">
                  <LesothoIndependence3D theme={theme ?? (isDark ? "dark" : "light")} />

                  {/* Anthem player (glass overlay inside the 3D scene) */}
                  <div className="absolute inset-x-3 bottom-3 z-10">
                    <style>{`@keyframes lesothoEq{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`}</style>
                    <audio
                      ref={audioRef}
                      src={ANTHEM.src}
                      preload="metadata"
                      onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
                      onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                      onEnded={() => {
                        setPlaying(false);
                        setTime(0);
                      }}
                    />
                    <div
                      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl p-3.5 shadow-2xl ${
                        isDark
                          ? "border-white/15 bg-[#050816]/70 shadow-black/50"
                          : "border-blue-200/80 bg-white/75 shadow-blue-900/10"
                      }`}
                    >
                      {/* Flag-colour accent bar */}
                      <div className="absolute inset-x-0 top-0 flex h-1" aria-hidden="true">
                        <div className="flex-[3] bg-[#00209F]" />
                        <div className="flex-[4] bg-white" />
                        <div className="flex-[3] bg-[#009543]" />
                      </div>

                      <div className="flex items-center gap-3.5 pt-1">
                        <button
                          type="button"
                          onClick={toggleAnthem}
                          aria-label={playing ? "Pause national anthem" : "Play national anthem"}
                          className="relative shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 hover:scale-105 transition-transform bg-gradient-to-br from-[#00209F] to-[#009543] ring-2 ring-white/40"
                        >
                          {playing && (
                            <span aria-hidden="true" className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />
                          )}
                          {playing ? (
                            <svg className="relative" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <rect x="5" y="4" width="5" height="16" rx="1.5" />
                              <rect x="14" y="4" width="5" height="16" rx="1.5" />
                            </svg>
                          ) : (
                            <svg className="relative ml-0.5" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5Z" />
                            </svg>
                          )}
                        </button>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <span className={`block text-sm font-bold truncate ${isDark ? "text-white" : "text-slate-900"}`}>
                                {ANTHEM.title}
                              </span>
                              <span className="block text-[10px] font-mono uppercase tracking-wider text-emerald-500">
                                {playing ? "Now playing" : ANTHEM.subtitle}
                              </span>
                            </div>
                            {/* Equalizer */}
                            <div className="flex items-end gap-[3px] h-6 shrink-0" aria-hidden="true">
                              {[0, 1, 2, 3, 4].map((i) => (
                                <span
                                  key={i}
                                  className={`w-[3px] h-full origin-bottom rounded-full ${
                                    i % 2 ? "bg-emerald-400" : "bg-blue-400"
                                  }`}
                                  style={{
                                    transform: "scaleY(.25)",
                                    animation: playing
                                      ? `lesothoEq ${0.7 + i * 0.13}s ease-in-out ${i * 0.08}s infinite`
                                      : "none",
                                  }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] font-mono text-blue-500 font-bold tabular-nums w-8">
                              {formatTime(time)}
                            </span>
                            <input
                              type="range"
                              aria-label="Anthem progress"
                              min={0}
                              max={duration || 100}
                              step={0.1}
                              value={time}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                setTime(v);
                                if (audioRef.current) audioRef.current.currentTime = v;
                              }}
                              className="flex-1 h-1.5 cursor-pointer accent-emerald-500"
                            />
                            <span className="text-[10px] font-mono text-zinc-500 tabular-nums w-8 text-right">
                              {formatTime(duration)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="block mt-2 text-[9px] font-mono text-zinc-500">{ANTHEM.credit}</span>
                    </div>
                  </div>
                </div>
                <div
                  className={`grid grid-cols-3 border-t px-4 py-3 font-mono text-[10px] ${
                    isDark ? "border-blue-900/60" : "border-blue-100"
                  }`}
                >
                  <div>
                    <span className="block text-zinc-500">CAPITAL</span>
                    <span className={`font-semibold ${isDark ? "text-blue-200" : "text-blue-950"}`}>Maseru</span>
                  </div>
                  <div className="text-center">
                    <span className="block text-zinc-500">MOTTO</span>
                    <span className="text-emerald-500 font-semibold">Khotso · Pula · Nala</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-zinc-500">FREE SINCE</span>
                    <span className="text-amber-500 font-bold">1966</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Floating history button */}
      <button
        type="button"
        onClick={() => setHistoryOpen(true)}
        aria-haspopup="dialog"
        aria-label="Learn the history of Lesotho"
        className="fixed bottom-5 right-5 z-40 group inline-flex items-center gap-2.5 pl-3 pr-5 py-3 rounded-full text-sm font-bold text-white shadow-2xl shadow-blue-900/50 bg-gradient-to-r from-[#00209F] via-blue-600 to-[#009543] hover:scale-105 active:scale-95 transition-transform ring-2 ring-white/40"
      >
        <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" aria-hidden="true" />
          <span className="relative text-lg" aria-hidden="true">📜</span>
        </span>
        <span>History of Lesotho</span>
      </button>

      <LesothoHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} isDark={isDark} />
    </>
  );
}
