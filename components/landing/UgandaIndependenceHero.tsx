"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { UgandaHistoryModal } from "./UgandaHistoryModal";
import { UgandaIndependence3D } from "./UgandaIndependence3D";
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Heart, 
  Music, 
  Shield, 
  ExternalLink,
  RotateCcw,
  Play,
  Pause
} from "lucide-react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.gabvia&pcampaignid=web_share";

const UGANDAN_GREETINGS = [
  {
    language: "Luganda",
    greeting: "Amazaalibwa g'Eggwanga Amalungi Uganda! Tugende mu maaso mu bumu n'emirembe.",
    translation: "Happy Independence Day Uganda! Let us advance together in unity and peace.",
    region: "Central / Buganda",
  },
  {
    language: "Swahili",
    greeting: "Heri ya Siku ya Uhuru Uganda! Tuungane kwa umoja, amani na maendeleo.",
    translation: "Happy Independence Day Uganda! Let us unite for unity, peace and progress.",
    region: "National / East Africa",
  },
  {
    language: "Runyankore / Rukiga",
    greeting: "Kuhereza emikono aha Mazariwa g'Eihanga Uganda! Nituza omu maisho hamwe.",
    translation: "Warm greetings on Uganda's Independence Day! We move forward together in strength.",
    region: "Western Uganda",
  },
  {
    language: "Luo / Acholi",
    greeting: "Kwo ma ber i Nino me Nying Lobo Uganda! Watim jami ducu i kuc ki bedo acel.",
    translation: "Peace and prosperity on Uganda's Independence Day! May we build our land in harmony.",
    region: "Northern Uganda",
  },
  {
    language: "Lusoga",
    greeting: "Olunaku olulungi olw'Okwefuga Uganda! Tuli balala mu maanyi n'ekitiibwa.",
    translation: "A blessed Independence Day Uganda! We stand together in honour and grace.",
    region: "Eastern Uganda / Busoga",
  },
];

const UGANDA_ANTHEM_STANZAS = [
  {
    num: 1,
    english: [
      "Oh Uganda! may God uphold thee,",
      "We lay our future in thy hand.",
      "United, free, for liberty",
      "Together we'll always stand.",
    ],
    luganda: [
      "Katonda ebyaffe bikube mu ngalo,",
      "Tukukwasizza amakubo gaffe.",
      "Tukolere wamu mu ddembe,",
      "Twesigire mu bumu.",
    ],
    swahili: [
      "Ee Uganda! Mungu akutegemeze,",
      "Tunaweka mustakabali wetu mikononi mwako.",
      "Wamoja, huru, kwa ajili ya uhuru,",
      "Pamoja tutasimama daima.",
    ],
  },
  {
    num: 2,
    english: [
      "Oh Uganda! the land of freedom.",
      "Our love and labour we give,",
      "And with neighbours all",
      "At our nation's call",
      "In peace and friendship we'll live.",
    ],
    luganda: [
      "Nsi y'eddembe n'essanyu,",
      "Twagala nnyo ensi yaffe eno,",
      "Ne baliraanwa baffe bonna,",
      "Mu mirembe tunaabeera wamu.",
    ],
    swahili: [
      "Ee Uganda! nchi ya uhuru,",
      "Upendo wetu na kazi yetu tunatoa,",
      "Na pamoja na majirani wote,",
      "Kwa mwito wa taifa letu,",
      "Kwa amani na urafiki tutaishi.",
    ],
  },
  {
    num: 3,
    english: [
      "Oh Uganda! the land that feeds us",
      "By sun and fertile soil grown.",
      "For our own dear land,",
      "We'll always stand,",
      "The Pearl of Africa's Crown.",
    ],
    luganda: [
      "Ensi etuliisa n'ebirungi byonna,",
      "Omusana n'ettaka eggimu,",
      "Ku lw'ensi yaffe eyaffe ddala,",
      "Tunaayimirira ddaaki.",
    ],
    swahili: [
      "Ee Uganda! nchi inayotulisha,",
      "Kwa jua na ardhi yenye rutuba iliyooteshwa,",
      "Kwa ajili ya nchi yetu wenyewe tuliyoipenda,",
      "Tutasimama daima,",
      "Lulu ya Taji ya Afrika.",
    ],
  },
];

interface UgandaIndependenceHeroProps {
  isDark: boolean;
  theme?: string;
}

export function UgandaIndependenceHero({ isDark }: UgandaIndependenceHeroProps) {
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(43.62);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsLang, setLyricsLang] = useState<"english" | "luganda" | "swahili">("english");
  const [cheersCount, setCheersCount] = useState(1962);
  const [celebrationPops, setCelebrationPops] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-cycle through Ugandan greetings every 5 seconds if anthem is not playing
  useEffect(() => {
    if (isPlayingAudio) return;
    const interval = setInterval(() => {
      setSelectedLangIndex((prev) => (prev + 1) % UGANDAN_GREETINGS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  // Festive confetti particle system in Uganda's National Colors (Black, Gold/Yellow, Post Office Red)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    // Uganda national flag tricolor + gold accent colors
    const colors = ["#000000", "#FCDC04", "#D90000", "#facc15", "#ffffff", "#ca8a04"];
    const particles = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 1.8,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: Math.random() * 0.9 + 0.35,
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

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // National Anthem Audio Controls (Brass & Trumpet / U.S. Navy Band Official Recording)
  const toggleAnthem = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlayingAudio) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.warn("Audio playback error:", err);
      });
    }
  }, [isPlayingAudio]);

  const restartAnthem = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setAudioCurrentTime(time);
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Interactive Cheers Popper
  const handleCheer = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cheersTexts = ["🇺🇬 Uganda!", "Kulika Independence!", "9 Oct 1962", "Pearl of Africa ✨", "For God & My Country", "🎉 Cheers!"];
    const text = cheersTexts[Math.floor(Math.random() * cheersTexts.length)];
    const newPop = { id: Date.now() + Math.random(), x, y, text };

    setCheersCount((prev) => prev + 1);
    setCelebrationPops((prev) => [...prev.slice(-6), newPop]);

    setTimeout(() => {
      setCelebrationPops((prev) => prev.filter((p) => p.id !== newPop.id));
    }, 1200);
  };

  const currentGreeting = UGANDAN_GREETINGS[selectedLangIndex];

  return (
    <section
      className={`relative overflow-hidden border-b transition-colors pt-10 pb-20 lg:pt-16 lg:pb-28 ${
        isDark ? "border-zinc-800/80 bg-[#090a0f]" : "border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white"
      }`}
    >
      {/* Background Falling Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40"
      />

      {/* Decorative Uganda National Ribbon Gradients */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-black via-[#FCDC04] to-[#D90000]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Historical Commemoration & Greetings */}
          <div className="lg:col-span-7 space-y-7">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-xs ${
                  isDark
                    ? "border-amber-500/40 bg-zinc-900/90 text-amber-300"
                    : "border-amber-300 bg-amber-100/80 text-amber-900"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-bold tracking-wider">9 OCTOBER 1962</span>
                <span className="text-zinc-500">•</span>
                <span className="font-semibold">UGANDA INDEPENDENCE DAY</span>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-xs ${
                  isDark ? "border-zinc-800 bg-zinc-900/60 text-zinc-300" : "border-zinc-200 bg-white text-zinc-700"
                }`}
              >
                <span>🇺🇬</span>
                <span className="font-medium">PEARL OF AFRICA</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
              >
                Celebrating Uganda. <br />
                <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-red-500 bg-clip-text text-transparent">
                  Sovereignty, Unity &amp; Peace.
                </span>
              </h1>
              <p
                className={`text-base sm:text-lg max-w-2xl leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                On 9 October 1962, the Uganda flag was proudly hoisted at Kololo Airstrip in Kampala, marking the dawn of an independent nation. Gabvia honors the languages, rich heritage, and boundless spirit of the Pearl of Africa.
              </p>
            </div>

            {/* Interactive Rotating Greetings Carousel across Uganda's Regions */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isDark ? "border-amber-500/20 bg-zinc-950/60" : "border-amber-200 bg-amber-50/70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-mono font-bold tracking-wider ${isDark ? "text-amber-400" : "text-amber-800"}`}>
                  GREETINGS IN UGANDAN LANGUAGES ({currentGreeting.region})
                </span>
                <div className="flex items-center gap-1">
                  {UGANDAN_GREETINGS.map((g, idx) => (
                    <button
                      key={g.language}
                      onClick={() => setSelectedLangIndex(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        selectedLangIndex === idx
                          ? "w-6 bg-amber-400"
                          : isDark
                          ? "w-2 bg-zinc-700 hover:bg-zinc-600"
                          : "w-2 bg-zinc-300 hover:bg-zinc-400"
                      }`}
                      title={g.language}
                    />
                  ))}
                </div>
              </div>

              <p className={`text-base font-medium italic ${isDark ? "text-zinc-200" : "text-zinc-900"}`}>
                &ldquo;{currentGreeting.greeting}&rdquo;
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-amber-500/20 text-xs">
                <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>
                  {currentGreeting.translation}
                </span>
                <span className={`font-mono text-[11px] font-semibold ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                  {currentGreeting.language}
                </span>
              </div>

              {/* Greetings Action Bar: Cheers Reaction & Anthem Sing-Along Lyrics trigger */}
              <div className="mt-3.5 pt-2.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowLyrics((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all cursor-pointer ${
                    showLyrics
                      ? "border-amber-400 bg-amber-400/20 text-amber-300"
                      : isDark
                      ? "border-zinc-800 bg-zinc-850/80 text-zinc-300 hover:text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <Music className="w-3.5 h-3.5 inline mr-1 text-amber-500" />
                  {showLyrics ? "Hide Anthem Lyrics" : "Sing Along Lyrics (3 Stanzas)"}
                </button>

                {/* Interactive Cheers Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleCheer}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer ${
                      isDark
                        ? "border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        : "border-red-300 bg-red-50 text-red-800 hover:bg-red-100"
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current text-red-500" />
                    <span>{cheersCount} Cheers</span>
                  </button>

                  {/* Floating Popups */}
                  {celebrationPops.map((pop) => (
                    <span
                      key={pop.id}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-amber-400 pointer-events-none animate-in fade-in slide-out-to-top duration-700"
                    >
                      {pop.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Expandable Lyrics Drawer */}
            {showLyrics && (
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200 ${
                  isDark ? "border-amber-500/30 bg-zinc-950/80 text-zinc-300" : "border-amber-200 bg-white text-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-3 border-b pb-2 border-zinc-500/20">
                  <span className="font-mono font-bold text-amber-400">ANTHEM STANZAS:</span>
                  <div className="flex gap-1.5 font-mono text-[10px]">
                    <button
                      onClick={() => setLyricsLang("english")}
                      className={`px-2 py-0.5 rounded ${
                        lyricsLang === "english" ? "bg-amber-500 text-black font-bold" : "text-zinc-400"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLyricsLang("luganda")}
                      className={`px-2 py-0.5 rounded ${
                        lyricsLang === "luganda" ? "bg-amber-500 text-black font-bold" : "text-zinc-400"
                      }`}
                    >
                      Luganda
                    </button>
                    <button
                      onClick={() => setLyricsLang("swahili")}
                      className={`px-2 py-0.5 rounded ${
                        lyricsLang === "swahili" ? "bg-amber-500 text-black font-bold" : "text-zinc-400"
                      }`}
                    >
                      Swahili
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {UGANDA_ANTHEM_STANZAS.map((stanza) => (
                    <div
                      key={stanza.num}
                      className={`p-2.5 rounded-xl border ${
                        isDark ? "border-zinc-800/80 bg-zinc-900/50" : "border-zinc-100 bg-zinc-50"
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold text-amber-500 block mb-1">
                        STANZA {stanza.num}
                      </span>
                      {stanza[lyricsLang].map((line, i) => (
                        <p key={i} className="text-[11px] leading-tight text-zinc-300">
                          {line}
                        </p>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link
                href="/chat"
                className={`inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold tracking-wide transition-all shadow-lg active:scale-[0.98] ${
                  isDark
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black shadow-amber-500/25"
                    : "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-amber-600/30"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Chatting on Web</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all border ${
                  isDark
                    ? "border-amber-500/30 bg-zinc-900/80 hover:bg-zinc-800 text-amber-300"
                    : "border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900"
                }`}
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>Explore 1962 History</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Uganda Independence Medallion & WebGL Experience */}
          <div className="lg:col-span-5">
            <div
              className={`relative rounded-3xl border p-2 shadow-2xl transition-colors ${
                isDark ? "border-amber-500/30 bg-zinc-900/60" : "border-amber-200 bg-white"
              }`}
            >
              {/* Corner Crosshairs */}
              <span className="absolute -top-2 -left-2 text-amber-500 font-mono text-sm select-none">+</span>
              <span className="absolute -top-2 -right-2 text-amber-500 font-mono text-sm select-none">+</span>
              <span className="absolute -bottom-2 -left-2 text-amber-500 font-mono text-sm select-none">+</span>
              <span className="absolute -bottom-2 -right-2 text-amber-500 font-mono text-sm select-none">+</span>

              {/* Card Header */}
              <div
                className={`flex items-center justify-between px-4 py-3 border-b font-mono text-[11px] ${
                  isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-200 text-zinc-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className={isDark ? "text-amber-300 font-medium" : "text-amber-900 font-medium"}>
                    UGANDA 1962 3D WEBGL
                  </span>
                </div>
                <span>CRESTED CRANE MEDALLION</span>
              </div>

              {/* 3D Canvas Viewport with Embedded Anthem Player Overlay (Lesotho & Nigeria Pattern) */}
              <div
                className={`relative h-[500px] sm:h-[580px] w-full rounded-2xl overflow-hidden transition-colors ${
                  isDark ? "bg-[#07080c]" : "bg-[#fcfcfd]"
                }`}
              >
                <UgandaIndependence3D
                  theme={isDark ? "dark" : "light"}
                  onOpenHistory={() => setIsHistoryModalOpen(true)}
                  isPlayingAudio={isPlayingAudio}
                  onToggleAudio={toggleAnthem}
                />

                {/* Anthem player (glass overlay inside the 3D scene) */}
                <div className="absolute inset-x-3 bottom-3 z-20 pointer-events-auto">
                  <style>{`@keyframes ugandaEq{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`}</style>
                  <div
                    className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl p-3 sm:p-3.5 shadow-2xl transition-all ${
                      isDark
                        ? "border-amber-500/25 bg-[#08090d]/85 shadow-black/70"
                        : "border-amber-200/90 bg-white/85 shadow-amber-950/10"
                    }`}
                  >
                    {/* Uganda 6-Stripe Tricolor Accent Bar (Black, Yellow, Red, Black, Yellow, Red) */}
                    <div className="absolute inset-x-0 top-0 flex h-1" aria-hidden="true">
                      <div className="flex-1 bg-black" />
                      <div className="flex-1 bg-[#FCDC04]" />
                      <div className="flex-1 bg-[#D90000]" />
                      <div className="flex-1 bg-black" />
                      <div className="flex-1 bg-[#FCDC04]" />
                      <div className="flex-1 bg-[#D90000]" />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      {/* Play / Pause circular action */}
                      <button
                        type="button"
                        onClick={toggleAnthem}
                        aria-label={isPlayingAudio ? "Pause national anthem" : "Play national anthem"}
                        className="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 hover:scale-105 transition-transform bg-gradient-to-br from-amber-500 via-yellow-500 to-red-600 ring-2 ring-amber-400/40 cursor-pointer"
                      >
                        {isPlayingAudio && (
                          <span aria-hidden="true" className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping" />
                        )}
                        {isPlayingAudio ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className={`block text-xs sm:text-sm font-bold truncate ${isDark ? "text-white" : "text-zinc-900"}`}>
                              Oh Uganda, Land of Beauty
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-semibold truncate">
                                {isPlayingAudio ? "Now Playing Fanfare" : "🎺 Trumpet & Brass Band"}
                              </span>
                              <span className="text-[10px] text-zinc-500 hidden sm:inline">•</span>
                              <span className="text-[10px] font-mono text-zinc-400 truncate hidden sm:inline">
                                U.S. Navy Band Official
                              </span>
                            </div>
                          </div>

                          {/* Dancing Equalizer Bars */}
                          <div className="flex items-end gap-[3px] h-6 shrink-0" aria-hidden="true">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <span
                                key={i}
                                className={`w-[3px] h-full origin-bottom rounded-full ${
                                  i % 3 === 0 ? "bg-amber-400" : i % 3 === 1 ? "bg-red-500" : "bg-yellow-300"
                                }`}
                                style={{
                                  transform: "scaleY(.25)",
                                  animation: isPlayingAudio
                                    ? `ugandaEq ${0.65 + i * 0.12}s ease-in-out ${i * 0.07}s infinite`
                                    : "none",
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Interactive Scrubber + Live Counter */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-mono text-amber-500 font-bold tabular-nums w-8 select-none">
                            {formatTime(audioCurrentTime)}
                          </span>
                          <input
                            type="range"
                            aria-label="Anthem progress scrubber"
                            min={0}
                            max={audioDuration || 43.62}
                            step={0.1}
                            value={audioCurrentTime}
                            onChange={handleSeek}
                            className="flex-1 h-1.5 cursor-pointer accent-amber-500"
                          />
                          <span className="text-[10px] font-mono text-zinc-400 tabular-nums w-8 text-right select-none">
                            {formatTime(audioDuration || 43.62)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row: Credits + Restart + Sing along lyrics toggle */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-500/15 text-[10px] font-mono">
                      <span className="text-zinc-400 truncate">
                        G.W. Kakoma (1962)
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={restartAnthem}
                          title="Restart anthem from beginning"
                          className="p-1 rounded hover:text-amber-400 transition-colors text-zinc-400 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLyrics((prev) => !prev)}
                          className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
                        >
                          {showLyrics ? "Hide lyrics" : "Sing along lyrics 📜"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Telemetry */}
              <div
                className={`grid grid-cols-3 border-t px-4 py-3 font-mono text-[10px] ${
                  isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-200 text-zinc-600"
                }`}
              >
                <div>
                  <span className={`block ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>DATE</span>
                  <span className={isDark ? "text-amber-400 font-semibold" : "text-amber-600 font-semibold"}>
                    9 OCT 1962
                  </span>
                </div>
                <div className="text-center">
                  <span className={`block ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>EMBLEM</span>
                  <span className={isDark ? "text-zinc-200 font-semibold" : "text-zinc-800 font-semibold"}>
                    Crested Crane
                  </span>
                </div>
                <div className="text-right">
                  <span className={`block ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>MOTTO</span>
                  <span className="text-amber-500 font-semibold">
                    For God &amp; My Country
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Uganda Independence History Button */}
      <aside aria-label="Uganda Independence History" className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsHistoryModalOpen(true)}
          className={`group relative flex items-center gap-3 p-1.5 pr-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 cursor-pointer ${
            isDark
              ? "bg-[#0b0c10]/95 border-amber-500/80 text-white shadow-amber-950/80 backdrop-blur-md"
              : "bg-white/95 border-amber-500 text-amber-950 shadow-amber-600/30 backdrop-blur-md"
          }`}
          title="Learn the History of Uganda (1962 — 2026)"
        >
          {/* Animated 6-Stripe Uganda Flag Circle Badge */}
          <div className="w-10 h-10 rounded-full overflow-hidden flex flex-col shadow-md border border-amber-400/60 flex-shrink-0 relative">
            <div className="flex-1 bg-black" />
            <div className="flex-1 bg-[#FCDC04]" />
            <div className="flex-1 bg-[#D90000]" />
            <div className="flex-1 bg-black" />
            <div className="flex-1 bg-[#FCDC04]" />
            <div className="flex-1 bg-[#D90000]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] shadow-sm select-none">
                🇺🇬
              </div>
            </div>
          </div>

          <div className="text-left flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold tracking-tight leading-tight">
                Uganda History
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30 hidden sm:inline-block">
                1962–2026
              </span>
            </div>
            <span
              className={`text-[10px] font-mono leading-none ${
                isDark ? "text-amber-300/90" : "text-amber-700"
              }`}
            >
              Explore Country History 🇺🇬 →
            </span>
          </div>

          {/* Shimmer light effect */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
          </div>
        </button>
      </aside>

      {/* Embedded Historical Archive Modal */}
      <UgandaHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        isDark={isDark}
        isPlayingAudio={isPlayingAudio}
        onToggleAudio={toggleAnthem}
      />

      {/* Official Trumpet & Brass National Anthem Audio Element (U.S. Navy Band) */}
      <audio
        ref={audioRef}
        src="/uganda-national-anthem.mp3"
        preload="metadata"
        onPlay={() => setIsPlayingAudio(true)}
        onPause={() => setIsPlayingAudio(false)}
        onEnded={() => {
          setIsPlayingAudio(false);
          setAudioCurrentTime(0);
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setAudioCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && audioRef.current.duration) {
            setAudioDuration(audioRef.current.duration);
          }
        }}
      />
    </section>
  );
}
