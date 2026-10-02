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
  RotateCcw
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
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsLang, setLyricsLang] = useState<"english" | "luganda" | "swahili">("english");
  const [cheersCount, setCheersCount] = useState(1962);
  const [celebrationPops, setCelebrationPops] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

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

  // Web Audio Synthesizer for Uganda National Anthem ("Oh Uganda, Land of Beauty")
  const stopAnthem = useCallback(() => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlayingAudio(false);
  }, []);

  const toggleAnthem = useCallback(() => {
    if (isPlayingAudio) {
      stopAnthem();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      setIsPlayingAudio(true);

      // George Wilberforce Kakoma's 1962 Melody
      const notes = [
        { freq: 392.00, dur: 0.6, bass: 196.00 }, // Oh Uganda!
        { freq: 493.88, dur: 0.6, bass: 196.00 },
        { freq: 587.33, dur: 0.9, bass: 196.00 },
        { freq: 523.25, dur: 0.45, bass: 261.63 }, // may God uphold thee
        { freq: 493.88, dur: 0.45, bass: 196.00 },
        { freq: 440.00, dur: 0.9, bass: 220.00 },
        { freq: 440.00, dur: 0.45, bass: 220.00 }, // We lay our future
        { freq: 493.88, dur: 0.45, bass: 246.94 },
        { freq: 523.25, dur: 0.45, bass: 261.63 },
        { freq: 587.33, dur: 0.45, bass: 293.66 },
        { freq: 493.88, dur: 0.5, bass: 246.94 }, // in thy hand
        { freq: 392.00, dur: 1.1, bass: 196.00 },
        { freq: 587.33, dur: 0.6, bass: 293.66 }, // United, free
        { freq: 659.25, dur: 0.6, bass: 329.63 },
        { freq: 587.33, dur: 0.8, bass: 293.66 },
        { freq: 523.25, dur: 0.45, bass: 261.63 }, // for liberty
        { freq: 493.88, dur: 0.45, bass: 246.94 },
        { freq: 440.00, dur: 0.8, bass: 220.00 },
        { freq: 392.00, dur: 0.45, bass: 196.00 }, // Together we'll always stand
        { freq: 440.00, dur: 0.45, bass: 220.00 },
        { freq: 493.88, dur: 0.6, bass: 246.94 },
        { freq: 440.00, dur: 0.6, bass: 220.00 },
        { freq: 392.00, dur: 1.6, bass: 196.00 },
      ];

      let startTime = ctx.currentTime + 0.1;

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const oscSub = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(note.freq, startTime);

        oscSub.type = "triangle";
        oscSub.frequency.setValueAtTime(note.bass, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.24, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + note.dur);

        osc.connect(gain);
        oscSub.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        oscSub.start(startTime);
        osc.stop(startTime + note.dur);
        oscSub.stop(startTime + note.dur);

        startTime += note.dur + 0.08;
      });

      const totalDuration = (startTime - ctx.currentTime) * 1000;
      const tId = setTimeout(() => {
        setIsPlayingAudio(false);
      }, totalDuration);
      timeoutsRef.current.push(tId);

    } catch (e) {
      console.warn("Audio synthesizer error:", e);
      setIsPlayingAudio(false);
    }
  }, [isPlayingAudio, stopAnthem]);

  useEffect(() => {
    return () => {
      stopAnthem();
    };
  }, [stopAnthem]);

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
            </div>

            {/* Anthem Synthesizer Bar & Actions */}
            <div
              className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isDark ? "border-zinc-800 bg-zinc-900/70" : "border-zinc-200 bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleAnthem}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${
                    isPlayingAudio
                      ? "bg-gradient-to-r from-amber-500 to-red-600 text-white animate-pulse"
                      : isDark
                      ? "bg-amber-500 text-black hover:bg-amber-400"
                      : "bg-amber-500 text-white hover:bg-amber-600"
                  }`}
                  title={isPlayingAudio ? "Pause National Anthem" : "Play 'Oh Uganda, Land of Beauty' (1962)"}
                >
                  {isPlayingAudio ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
                <div>
                  <span className={`block text-xs font-bold ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                    &ldquo;Oh Uganda, Land of Beauty&rdquo;
                  </span>
                  <span className={`block text-[11px] font-mono ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                    George Wilberforce Kakoma (1962)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLyrics((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all ${
                    showLyrics
                      ? "border-amber-400 bg-amber-400/20 text-amber-300"
                      : isDark
                      ? "border-zinc-800 bg-zinc-800/60 text-zinc-300 hover:text-white"
                      : "border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                  }`}
                >
                  <Music className="w-3.5 h-3.5 inline mr-1" />
                  {showLyrics ? "Hide Lyrics" : "View Lyrics"}
                </button>

                {/* Cheers Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleCheer}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all shadow-sm active:scale-95 ${
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

              {/* 3D Canvas */}
              <div
                className={`h-[420px] sm:h-[480px] w-full rounded-2xl flex items-center justify-center overflow-hidden transition-colors ${
                  isDark ? "bg-[#07080c]" : "bg-[#fcfcfd]"
                }`}
              >
                <UgandaIndependence3D
                  theme={isDark ? "dark" : "light"}
                  onOpenHistory={() => setIsHistoryModalOpen(true)}
                />
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

      {/* Embedded Historical Archive Modal */}
      <UgandaHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        isDark={isDark}
      />
    </section>
  );
}
