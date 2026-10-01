"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.gabvia&pcampaignid=web_share";

const NIGERIAN_GREETINGS = [
  {
    language: "Yorùbá",
    greeting: "Ẹ kú Ọdún Òmìnira Nàìjíríà! A ó máa tẹ̀síwájú.",
    translation: "Happy Independence Day Nigeria! We shall keep moving forward.",
    region: "South West",
  },
  {
    language: "Hausa",
    greeting: "Barka da Ranar 'Yancin Kai ga dukkan 'yan Najeriya!",
    translation: "Happy Independence Day to all Nigerians!",
    region: "North",
  },
  {
    language: "Igbo",
    greeting: "Ụbọchị Nwere Onwe Ọma Nigeria! Ọganihu na udo.",
    translation: "Happy Independence Day Nigeria! Progress and peace.",
    region: "South East",
  },
  {
    language: "Nigerian Pidgin",
    greeting: "Happy 66th Independence Naija! Our voice dey loud anywhere for world.",
    translation: "Happy 66th Independence Nigeria! Our voice echoes across the globe.",
    region: "Nationwide",
  },
];

const ANTHEMS = {
  "we-hail-thee": {
    id: "we-hail-thee" as const,
    title: "Nigeria, We Hail Thee",
    versionLabel: "Official National Anthem",
    src: "/nigeria-national-anthem.mp3",
    composer: "Frances Benda / Lillian Jean Williams",
    stanzas: [
      [
        "Nigeria, we hail thee,",
        "Our own dear native land,",
        "Though tribe and tongue may differ,",
        "In brotherhood we stand,",
        "Nigerians all, are proud to serve",
        "Our sovereign Motherland.",
      ],
      [
        "Our flag shall be a symbol",
        "That truth and justice reign,",
        "In peace or battle honour’d,",
        "And this we count as gain,",
        "To hand on to our children",
        "A banner without stain.",
      ],
      [
        "O God of all creation,",
        "Grant this our one request:",
        "Help us to build a nation",
        "Where no man is oppressed,",
        "And so with peace and plenty",
        "Nigeria may be blest.",
      ],
    ],
  },
  arise: {
    id: "arise" as const,
    title: "Arise, O Compatriots",
    versionLabel: "1978 — 2024 Anthem",
    src: "/nigeria-arise-o-compatriots.mp3",
    composer: "Pa Benedict Odiase / Nigerian Police Band",
    stanzas: [
      [
        "Arise, O compatriots,",
        "Nigeria's call obey",
        "To serve our fatherland",
        "With love and strength and faith.",
        "The labour of our heroes past,",
        "Shall never be in vain,",
        "To serve with heart and might,",
        "One nation bound in freedom, peace and unity.",
      ],
      [
        "Oh God of creation, direct our noble cause,",
        "Guide our leaders right,",
        "Help our youth the truth to know,",
        "In love and honesty to grow,",
        "And living just and true,",
        "Great lofty heights attain,",
        "To build a nation where peace and justice shall reign.",
      ],
    ],
  },
};

interface NigeriaIndependenceHeroProps {
  isDark: boolean;
  theme?: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function NigeriaIndependenceHero({ isDark }: NigeriaIndependenceHeroProps) {
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeAnthemKey, setActiveAnthemKey] = useState<"we-hail-thee" | "arise">("we-hail-thee");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showLyrics, setShowLyrics] = useState(false);
  const [cheersCount, setCheersCount] = useState(66);
  const [celebrationPops, setCelebrationPops] = useState<{ id: number; x: number; y: number; text: string }[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeAnthem = ANTHEMS[activeAnthemKey];

  // Auto-cycle through Nigerian greetings every 5 seconds if anthem is not playing
  useEffect(() => {
    if (isPlayingAudio) return;
    const interval = setInterval(() => {
      setSelectedLangIndex((prev) => (prev + 1) % NIGERIAN_GREETINGS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  // Handle Play / Pause
  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      try {
        await audio.play();
        setIsPlayingAudio(true);
      } catch (err) {
        console.error("Audio playback error:", err);
      }
    }
  };

  // Switch between "Nigeria, We Hail Thee" and "Arise, O Compatriots"
  const handleSelectAnthem = async (key: "we-hail-thee" | "arise") => {
    if (activeAnthemKey === key) return;
    const audio = audioRef.current;
    const wasPlaying = isPlayingAudio;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setActiveAnthemKey(key);
    setCurrentTime(0);
    setIsPlayingAudio(false);

    // If it was playing, resume playing the new anthem after source update
    if (wasPlaying) {
      setTimeout(async () => {
        if (audioRef.current) {
          try {
            await audioRef.current.play();
            setIsPlayingAudio(true);
          } catch (err) {
            console.error("Playback resume error:", err);
          }
        }
      }, 100);
    }
  };

  // Scrubber change
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekVal = parseFloat(e.target.value);
    setCurrentTime(seekVal);
    if (audioRef.current) {
      audioRef.current.currentTime = seekVal;
    }
  };

  // Festive confetti particle system
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const colors = ["#008751", "#10b981", "#34d399", "#ffffff", "#f59e0b", "#fbbf24"];
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1.5,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: Math.random() * 0.9 + 0.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: Math.random() * 0.7 + 0.3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }
        if (p.x > width) p.x = 0;
        if (p.x < 0) p.x = width;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.8);
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleCelebrateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCheersCount((prev) => prev + 1);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newPop = {
      id: Date.now() + Math.random(),
      x,
      y,
      text: ["🇳🇬 66!", "🎉 Naija!", "✨ Peace & Unity!", "💚 Independence!"][
        Math.floor(Math.random() * 4)
      ],
    };
    setCelebrationPops((prev) => [...prev.slice(-4), newPop]);
    setTimeout(() => {
      setCelebrationPops((prev) => prev.filter((p) => p.id !== newPop.id));
    }, 1200);
  };

  const activeGreeting = NIGERIAN_GREETINGS[selectedLangIndex];

  return (
    <section
      className={`relative overflow-hidden border-b transition-colors pt-10 pb-20 lg:pt-16 lg:pb-28 ${
        isDark ? "border-emerald-950/80 bg-[#060a08]" : "border-emerald-100 bg-[#f9fcfa]"
      }`}
    >
      {/* Hidden HTML5 Audio Element for National Anthem */}
      <audio
        ref={audioRef}
        src={activeAnthem.src}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          setIsPlayingAudio(false);
          setCurrentTime(0);
        }}
      />

      {/* Interactive celebratory confetti canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none w-full h-full z-0 opacity-60"
      />

      {/* Atmospheric Radial Gradient Lighting */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? "bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(0,135,81,0.25),transparent_75%)]"
            : "bg-[radial-gradient(ellipse_75%_50%_at_50%_0%,rgba(16,185,129,0.18),transparent_75%)]"
        }`}
      />

      {/* Subtle Architectural Grid Lines */}
      <div
        className={`absolute inset-0 bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none ${
          isDark
            ? "bg-[linear-gradient(to_right,#08281a_1px,transparent_1px),linear-gradient(to_bottom,#08281a_1px,transparent_1px)] opacity-35"
            : "bg-[linear-gradient(to_right,#e1f3ea_1px,transparent_1px),linear-gradient(to_bottom,#e1f3ea_1px,transparent_1px)] opacity-60"
        }`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Patriotic Hero Announcement & Copy */}
          <div className="lg:col-span-7 space-y-8">
            {/* Independence Anniversary Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border font-mono text-xs shadow-sm transition-all ${
                  isDark
                    ? "border-emerald-700/60 bg-emerald-950/80 text-emerald-200"
                    : "border-emerald-300 bg-emerald-50/90 text-emerald-900"
                }`}
              >
                <span className="text-base leading-none">🇳🇬</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="font-bold tracking-wide text-emerald-400">
                  NIGERIA AT 66
                </span>
                <span className="text-emerald-500/60">|</span>
                <span className="font-semibold uppercase tracking-wider text-[11px]">
                  1960 — 2026
                </span>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-[11px] ${
                  isDark
                    ? "border-amber-500/30 bg-amber-950/40 text-amber-300"
                    : "border-amber-300 bg-amber-50 text-amber-800"
                }`}
              >
                <span>⭐</span>
                <span>INDEPENDENCE DAY CELEBRATION</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
              >
                Happy 66th Independence Day,{" "}
                <span className="bg-gradient-to-r from-emerald-500 via-green-400 to-teal-300 bg-clip-text text-transparent inline-block">
                  Nigeria! 🇳🇬
                </span>
              </h1>
              <p
                className={`text-base sm:text-lg max-w-2xl leading-relaxed ${
                  isDark ? "text-emerald-100/80" : "text-zinc-700"
                }`}
              >
                Celebrating 66 years of unity, strength, and cultural brilliance. From
                Lagos to Abuja, Kano to Enugu, and across the worldwide Nigerian diaspora —
                Gabvia empowers every Nigerian to connect, talk, and share voice notes
                without language barriers across <strong className={isDark ? "text-white font-semibold" : "text-zinc-900 font-semibold"}>Hausa, Yorùbá, Igbo, Nigerian Pidgin</strong>, and 40+ global languages.
              </p>
            </div>

            {/* Interactive Nigerian Language Greeting Card */}
            <div
              className={`p-5 rounded-2xl border transition-all ${
                isDark
                  ? "border-emerald-900/60 bg-emerald-950/30 backdrop-blur-sm"
                  : "border-emerald-200 bg-white shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-wider text-emerald-500 uppercase">
                    Commemorative Greeting in
                  </span>
                  {/* Language Selector Pills */}
                  <div className="flex flex-wrap gap-1">
                    {NIGERIAN_GREETINGS.map((item, idx) => (
                      <button
                        key={item.language}
                        onClick={() => setSelectedLangIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          selectedLangIndex === idx
                            ? isDark
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-emerald-700 text-white shadow-sm"
                            : isDark
                            ? "bg-zinc-900/60 text-zinc-400 hover:text-white"
                            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                        }`}
                      >
                        {item.language}
                      </button>
                    ))}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border hidden sm:inline-block ${
                    isDark
                      ? "border-emerald-800 text-emerald-400 bg-emerald-950/60"
                      : "border-emerald-200 text-emerald-700 bg-emerald-50"
                  }`}
                >
                  AI Translation In-Flow
                </span>
              </div>

              {/* Greeting quote display */}
              <div className="space-y-1.5">
                <p
                  className={`text-lg sm:text-xl font-bold italic ${
                    isDark ? "text-emerald-200" : "text-emerald-950"
                  }`}
                >
                  “{activeGreeting.greeting}”
                </p>
                <p
                  className={`text-xs sm:text-sm font-mono flex items-center gap-1.5 ${
                    isDark ? "text-zinc-400" : "text-zinc-600"
                  }`}
                >
                  <span className="text-emerald-500 font-bold">EN:</span>
                  <span>{activeGreeting.translation}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/chat"
                className={`inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all shadow-lg active:scale-[0.98] ${
                  isDark
                    ? "bg-gradient-to-r from-emerald-500 via-green-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-500/25"
                    : "bg-gradient-to-r from-emerald-600 via-green-700 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white shadow-emerald-600/30"
                }`}
              >
                <span>🎉 Celebrate &amp; Chat Free on Web</span>
                <span className="font-mono text-xs">→</span>
              </Link>

              {/* Quick Play Anthem Button */}
              <button
                onClick={toggleAudio}
                className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all border ${
                  isPlayingAudio
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-md"
                    : isDark
                    ? "border-emerald-800/80 bg-zinc-900/90 hover:bg-zinc-800 text-emerald-300"
                    : "border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-900"
                }`}
              >
                <span>{isPlayingAudio ? "❚❚ Pause Anthem" : "▶ Play National Anthem"}</span>
              </button>

              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all border ${
                  isDark
                    ? "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300"
                    : "border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                }`}
              >
                <span>Get App</span>
              </a>
            </div>

            {/* Commemorative Value Points */}
            <div
              className={`flex flex-wrap items-center gap-6 pt-2 text-xs font-mono ${
                isDark ? "text-emerald-400/80" : "text-emerald-800"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Proudly Connecting Nigeria to the World
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Zero App Installation Required
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                End-to-End Encrypted Voice &amp; Chat
              </span>
            </div>
          </div>

          {/* Right Column: 66th Independence 3D-styled Commemorative Plaque & Audio Visualizer */}
          <div className="lg:col-span-5">
            <div
              className={`relative rounded-3xl border p-2 shadow-2xl transition-all ${
                isDark
                  ? "border-emerald-800/60 bg-zinc-950/90 shadow-emerald-950/60"
                  : "border-emerald-200 bg-white shadow-emerald-100/80"
              }`}
            >
              {/* SpaceFS Corner Crosshairs (+) in Nigeria Green */}
              <span className="absolute -top-2 -left-2 text-emerald-500 font-mono text-sm select-none">
                +
              </span>
              <span className="absolute -top-2 -right-2 text-emerald-500 font-mono text-sm select-none">
                +
              </span>
              <span className="absolute -bottom-2 -left-2 text-emerald-500 font-mono text-sm select-none">
                +
              </span>
              <span className="absolute -bottom-2 -right-2 text-emerald-500 font-mono text-sm select-none">
                +
              </span>

              {/* Card Header Telemetry */}
              <div
                className={`flex items-center justify-between px-4 py-3 border-b font-mono text-[11px] ${
                  isDark
                    ? "border-emerald-900/60 text-emerald-400"
                    : "border-emerald-100 text-emerald-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span
                    className={
                      isDark ? "text-emerald-200 font-semibold" : "text-emerald-950 font-semibold"
                    }
                  >
                    FEDERAL REPUBLIC OF NIGERIA
                  </span>
                </div>
                <span className="text-[10px] tracking-wider uppercase">OCT 01, 2026</span>
              </div>

              {/* Center Plaque Display */}
              <div
                className={`p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden transition-colors ${
                  isDark
                    ? "bg-gradient-to-b from-[#091f14] via-[#06120b] to-[#040906]"
                    : "bg-gradient-to-b from-[#ebfaf2] via-[#f4fcf7] to-[#ffffff]"
                }`}
              >
                {/* Waving Tricolor Ribbon Bar (Green - White - Green) */}
                <div className="w-full max-w-[240px] h-3 rounded-full flex overflow-hidden shadow-inner mb-6 border border-emerald-500/20">
                  <div className="flex-1 bg-[#008751]" />
                  <div className="flex-1 bg-white" />
                  <div className="flex-1 bg-[#008751]" />
                </div>

                {/* Grand "66" Emblem */}
                <div className="relative mb-3 group cursor-pointer" onClick={() => setCheersCount((c) => c + 1)}>
                  <div className="text-7xl sm:text-8xl font-black tracking-tighter leading-none bg-gradient-to-br from-emerald-400 via-green-300 to-amber-300 bg-clip-text text-transparent drop-shadow-sm select-none">
                    66
                  </div>
                  {/* Decorative laurel ring glow */}
                  <div className="absolute -inset-4 rounded-full bg-emerald-500/10 blur-xl -z-10 group-hover:bg-emerald-500/20 transition-all" />
                </div>

                {/* Plaque Title */}
                <div className="space-y-1 mb-5">
                  <span
                    className={`block font-mono text-xs uppercase tracking-widest font-bold ${
                      isDark ? "text-emerald-300" : "text-emerald-800"
                    }`}
                  >
                    YEARS OF INDEPENDENCE
                  </span>
                  <p
                    className={`text-xs ${
                      isDark ? "text-zinc-400" : "text-zinc-600"
                    }`}
                  >
                    Unity &amp; Faith, Peace &amp; Progress
                  </p>
                </div>

                {/* Real Nigeria National Anthem Audio Player */}
                <div
                  className={`w-full p-4 rounded-2xl border transition-all text-left space-y-3 ${
                    isDark
                      ? "border-emerald-800/60 bg-black/60 shadow-lg shadow-black/40"
                      : "border-emerald-200 bg-emerald-50/80 shadow-sm"
                  }`}
                >
                  {/* Anthem Selector Tabs */}
                  <div className="flex items-center justify-between gap-1 pb-1 border-b border-emerald-900/30">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-500 font-bold">
                      National Anthem:
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleSelectAnthem("we-hail-thee")}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                          activeAnthemKey === "we-hail-thee"
                            ? "bg-emerald-600 text-white font-bold shadow-sm"
                            : isDark
                            ? "text-zinc-400 hover:text-white"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        Nigeria, We Hail Thee
                      </button>
                      <button
                        onClick={() => handleSelectAnthem("arise")}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                          activeAnthemKey === "arise"
                            ? "bg-emerald-600 text-white font-bold shadow-sm"
                            : isDark
                            ? "text-zinc-400 hover:text-white"
                            : "text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        Arise O Compatriots
                      </button>
                    </div>
                  </div>

                  {/* Playback Controls & Info */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={toggleAudio}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
                          isPlayingAudio
                            ? "bg-emerald-500 text-white shadow-emerald-500/40 ring-4 ring-emerald-500/20"
                            : isDark
                            ? "bg-emerald-900/90 text-emerald-300 hover:bg-emerald-800"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                        title={isPlayingAudio ? "Pause Anthem" : "Play Nigerian National Anthem"}
                      >
                        {isPlayingAudio ? (
                          <span className="text-sm font-bold">❚❚</span>
                        ) : (
                          <span className="text-sm font-bold ml-0.5">▶</span>
                        )}
                      </button>
                      <div>
                        <span
                          className={`text-xs font-bold block leading-tight ${
                            isDark ? "text-white" : "text-zinc-900"
                          }`}
                        >
                          {activeAnthem.title}
                        </span>
                        <span
                          className={`text-[10px] font-mono ${
                            isDark ? "text-emerald-400" : "text-emerald-700"
                          }`}
                        >
                          {isPlayingAudio ? "Playing official brass recording..." : activeAnthem.versionLabel}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-emerald-500 font-bold block">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                      <button
                        onClick={() => setShowLyrics(!showLyrics)}
                        className={`text-[10px] font-mono underline hover:text-emerald-400 transition-colors ${
                          isDark ? "text-zinc-400" : "text-zinc-600"
                        }`}
                      >
                        {showLyrics ? "Hide lyrics" : "View lyrics"}
                      </button>
                    </div>
                  </div>

                  {/* Equalizer Waveform Visualization */}
                  <div className="flex items-end gap-1 h-8 px-1 py-1">
                    {[14, 26, 18, 30, 16, 24, 12, 28, 34, 20, 24, 16, 32, 22, 18, 26, 30, 14, 22, 28, 20, 16, 26, 18].map(
                      (h, i) => {
                        const dynamicHeight = isPlayingAudio
                          ? Math.max(6, (h * ((i % 4) + 1) * (1 + (currentTime % 2))) % 30)
                          : Math.max(4, h * 0.4);

                        return (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all duration-100 ${
                              isPlayingAudio
                                ? "bg-gradient-to-t from-emerald-500 via-green-400 to-amber-300"
                                : isDark
                                ? "bg-emerald-900/50"
                                : "bg-emerald-300"
                            }`}
                            style={{
                              height: `${dynamicHeight}px`,
                            }}
                          />
                        );
                      }
                    )}
                  </div>

                  {/* Audio Progress Scrubber */}
                  <div className="pt-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1.5 bg-emerald-900/40 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  {/* Expandable Lyrics Box */}
                  {showLyrics && (
                    <div
                      className={`mt-2 p-3 rounded-xl border text-xs leading-relaxed max-h-48 overflow-y-auto ${
                        isDark
                          ? "bg-zinc-950/80 border-emerald-900/60 text-emerald-100"
                          : "bg-white border-emerald-200 text-zinc-800"
                      }`}
                    >
                      <span className="font-mono text-[10px] text-emerald-500 font-bold block mb-1 uppercase">
                        {activeAnthem.title} — Lyrics
                      </span>
                      {activeAnthem.stanzas.map((stanza, sIdx) => (
                        <div key={sIdx} className="mb-2.5 last:mb-0">
                          {stanza.map((line, lIdx) => (
                            <p key={lIdx} className="italic">
                              {line}
                            </p>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Interactive Toast Button to Celebrate */}
                <div className="relative mt-4 w-full">
                  <button
                    onClick={handleCelebrateClick}
                    className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all border flex items-center justify-center gap-2 active:scale-95 ${
                      isDark
                        ? "border-emerald-700/60 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/80"
                        : "border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-50 shadow-sm"
                    }`}
                  >
                    <span>Tap to Celebrate 🇳🇬</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px]">
                      {cheersCount} Cheers
                    </span>
                  </button>

                  {/* Floating click popups */}
                  {celebrationPops.map((pop) => (
                    <span
                      key={pop.id}
                      className="absolute font-bold text-xs pointer-events-none text-emerald-400 animate-bounce"
                      style={{
                        left: `${pop.x}px`,
                        top: `${pop.y - 25}px`,
                        textShadow: "0 0 10px rgba(16,185,129,0.8)",
                      }}
                    >
                      {pop.text}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer Telemetry */}
              <div
                className={`grid grid-cols-3 border-t px-4 py-3 font-mono text-[10px] ${
                  isDark
                    ? "border-emerald-900/60 text-emerald-400/80"
                    : "border-emerald-100 text-emerald-700"
                }`}
              >
                <div>
                  <span className={`block ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                    NATION
                  </span>
                  <span
                    className={
                      isDark ? "text-emerald-300 font-semibold" : "text-emerald-950 font-semibold"
                    }
                  >
                    Nigeria (NG)
                  </span>
                </div>
                <div className="text-center">
                  <span className={`block ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                    ANNIVERSARY
                  </span>
                  <span className="text-amber-500 font-bold">
                    66 Years
                  </span>
                </div>
                <div className="text-right">
                  <span className={`block ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>
                    TRIBES &amp; TONGUES
                  </span>
                  <span className="text-emerald-500 font-semibold">
                    United in 1
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
