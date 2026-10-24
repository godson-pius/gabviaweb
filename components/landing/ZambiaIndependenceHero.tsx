"use client";

import Link from "next/link";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { ZambiaHistoryModal } from "./ZambiaHistoryModal";
import { ZambiaIndependence3D } from "./ZambiaIndependence3D";
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
  Pause,
} from "lucide-react";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=app.gabvia&pcampaignid=web_share";

const ZAMBIAN_GREETINGS = [
  {
    language: "Bemba (Icibemba)",
    greeting: "Mwashibukeni bonse! Twasekelela ubuntungwa bwa Zambia! Twikatane bonse, calo cimo, luko lumo.",
    translation: "Warm greetings to everyone! We celebrate Zambia's Independence Day! Let us unite, One Zambia, One Nation.",
    region: "Copperbelt / Northern / Lusaka",
  },
  {
    language: "Nyanja / Chewa",
    greeting: "Tikondwere tsiku la ufulu wa dziko la Zambia! Umodzi ndi mtendere m'dziko lathu lokondedwa.",
    translation: "Let us celebrate Zambia's Independence Day! Unity and peace in our beloved motherland.",
    region: "Lusaka / Eastern Province",
  },
  {
    language: "Tonga (Chitonga)",
    greeting: "Bwiime bwa bulemu bwa cisi ca Zambia! Twende antoomwe muluumuno ampindu yabulemu.",
    translation: "A glorious Independence Day to Zambia! Let us advance together in peace, honour, and progress.",
    region: "Southern Province / Victoria Falls",
  },
  {
    language: "Lozi (Silozi)",
    greeting: "Tukwile taba ya tukuluho ya naha ya Zambia! Lu be ba bañwi mwa kozo, tokomelo ni maswanelo.",
    translation: "Rejoice in the freedom of the nation of Zambia! May we dwell as one in peace, care, and unity.",
    region: "Western Province / Zambezi",
  },
  {
    language: "Kaonde (Kikaonde)",
    greeting: "Kusekelela jibelo ja bwana-bwa-kine bwa Zambia! Twikwashe mu mutende ne lusekelo lwa kine.",
    translation: "Celebrating true sovereignty of Zambia! Let us support one another in authentic joy and peace.",
    region: "North-Western / Solwezi",
  },
  {
    language: "Lunda & Luvale",
    greeting: "Kusekelela ifuku da wuswayi wa Zambia! Tukalenu hamu mukunyangwa nawunyonji wamweka.",
    translation: "Celebrating the glorious day of Zambia's freedom! Let us flourish together in enduring harmony.",
    region: "North-Western / Zambezi Basin",
  },
];

const ZAMBIA_ANTHEM_STANZAS = [
  {
    num: 1,
    title: "Stanza 1: Freedom & Unity",
    english: [
      "Stand and sing of Zambia, proud and free,",
      "Land of work and joy in unity,",
      "Victors in the struggle for the right,",
      "We've won freedom's fight.",
      "All one, strong and free.",
    ],
    bemba: [
      "Lumbanyeni Zambia, no kwanga,",
      "Ne cilumba twange tuumfwane,",
      "Mpalume sha bulwi bwa cine,",
      "Twaliilubula.",
      "Twikatane bonse.",
    ],
    nyanja: [
      "Imani timtamande Zambia,",
      "Dziko la cimwemwe ndi umodzi,",
      "Ife tinamenyera ufulu,",
      "Tinapata ufuluwu,",
      "Umodzi ndi mphamvu.",
    ],
  },
  {
    num: 2,
    title: "Stanza 2 (Chorus): Mother Africa",
    english: [
      "Africa is our own motherland,",
      "Fashion'd with and blessed by God's good hand,",
      "Let us all her people join as one,",
      "Brothers under the sun.",
      "All one, strong and free.",
    ],
    bemba: [
      "Bonse tuli bana ba Africa,",
      "Uwasenaminwa na Lesa,",
      "Nomba bonse twendele pamo,",
      "Twaliilubula.",
      "Twikatane bonse.",
    ],
    nyanja: [
      "Africa ndiye Mayi wathu,",
      "Dzanja la Mbuye lamdalitsa,",
      "Tiyeni tonse tigwirizane,",
      "Ndife abale m'dziko,",
      "Umodzi ndi mphamvu.",
    ],
  },
  {
    num: 3,
    title: "Stanza 3: The Noble Eagle & Peace",
    english: [
      "One land and one nation is our cry,",
      "Dignity and peace 'neath Zambia's sky,",
      "Like our noble eagle in its flight,",
      "Zambia, praise to thee.",
      "All one, strong and free.",
    ],
    bemba: [
      "Fwe lukuta lwa Zambia lonse,",
      "Twikatane tubyo mutende,",
      "Pamo nga lubambe mu mulu,",
      "Lumbanyeni Zambia.",
      "Twikatane bonse.",
    ],
    nyanja: [
      "Dziko limodzi, mtundu umodzi,",
      "Ndi cilakolako cathutu,",
      "Ulemu ndi mtendere m'dziko,",
      "Monga nkwazi m'mwamba,",
      "Umodzi ndi mphamvu.",
    ],
  },
  {
    num: 4,
    title: "Stanza 4: Praise to the Almighty",
    english: [
      "Praise be to God, praise be, praise be, praise be,",
      "Bless our great nation, Zambia, Zambia, Zambia.",
      "Free men we stand under the flag of our land.",
      "Zambia, praise to thee,",
      "All one, strong and free.",
    ],
    bemba: [
      "Lumbanyeni, Lesa, Lesa, wesu,",
      "Apale calo, Zambia, Zambia, Zambia.",
      "Fwe bantungwa, mu luunga lwa calo.",
      "Lumbanyeni Zambia,",
      "Twikatane bonse.",
    ],
    nyanja: [
      "Mulungu atidalitse ife,",
      "Atidalitse Zambia, Zambia, Zambia.",
      "Tili omasuka pansi pa mbendera,",
      "Zambia tikondwera,",
      "Umodzi ndi mphamvu.",
    ],
  },
];

interface ZambiaIndependenceHeroProps {
  isDark: boolean;
  theme?: string;
}

export function ZambiaIndependenceHero({ isDark }: ZambiaIndependenceHeroProps) {
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(113);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyricsLang, setLyricsLang] = useState<"english" | "bemba" | "nyanja">("english");
  const [cheersCount, setCheersCount] = useState(1964);
  const [celebrationPops, setCelebrationPops] = useState<{ id: number; x: number; y: number; text: string }[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-cycle through Zambian greetings every 5 seconds if anthem is not playing
  useEffect(() => {
    if (isPlayingAudio) return;
    const interval = setInterval(() => {
      setSelectedLangIndex((prev) => (prev + 1) % ZAMBIAN_GREETINGS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  // Festive confetti particle system in Zambia's National Colors (Green, Red, Black, Copper Orange, Gold)
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

    const colors = ["#15803d", "#ea580c", "#dc2626", "#09090b", "#facc15", "#ffffff", "#16a34a"];
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

  // National Anthem Audio Controls
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

    const cheersTexts = [
      "🇿🇲 Zambia!",
      "One Zambia, One Nation!",
      "24 Oct 1964",
      "Mosi-oa-Tunya 🌊",
      "African Fish Eagle 🦅",
      "Lumbanyeni Zambia!",
      "Twikatane bonse! ✨",
      "🎉 Cheers!",
    ];
    const text = cheersTexts[Math.floor(Math.random() * cheersTexts.length)];
    const newPop = { id: Date.now() + Math.random(), x, y, text };

    setCheersCount((prev) => prev + 1);
    setCelebrationPops((prev) => [...prev.slice(-6), newPop]);

    setTimeout(() => {
      setCelebrationPops((prev) => prev.filter((p) => p.id !== newPop.id));
    }, 1200);
  };

  const currentGreeting = ZAMBIAN_GREETINGS[selectedLangIndex];

  return (
    <section
      className={`relative overflow-hidden border-b transition-colors pt-10 pb-20 lg:pt-16 lg:pb-28 ${
        isDark ? "border-zinc-800/80 bg-[#080a0c]" : "border-emerald-200/80 bg-gradient-to-b from-emerald-50/40 via-orange-50/20 to-white"
      }`}
    >
      {/* Background Falling Confetti Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40"
      />

      {/* Decorative Zambia National Ribbon Gradients */}
      <div className="absolute top-0 left-0 right-0 h-1.5 flex" aria-hidden="true">
        <div className="flex-[3] bg-[#15803d]" />
        <div className="flex-1 bg-[#dc2626]" />
        <div className="flex-1 bg-[#09090b]" />
        <div className="flex-1 bg-[#ea580c]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Commemoration & Multilingual Greetings */}
          <div className="lg:col-span-7 space-y-7">
            {/* Top Badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-mono text-xs ${
                  isDark
                    ? "border-emerald-500/40 bg-zinc-900/90 text-emerald-300"
                    : "border-emerald-300 bg-emerald-100/80 text-emerald-950"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold tracking-wider">24 OCTOBER 1964</span>
                <span className="text-zinc-500">•</span>
                <span className="font-semibold">62 YEARS OF SOVEREIGNTY</span>
              </div>

              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-xs ${
                  isDark ? "border-orange-500/30 bg-zinc-900/60 text-orange-300" : "border-orange-200 bg-orange-50 text-orange-900"
                }`}
              >
                <span>🇿🇲</span>
                <span className="font-medium">ONE ZAMBIA, ONE NATION</span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] ${
                  isDark ? "text-white" : "text-zinc-950"
                }`}
              >
                Celebrating Zambia. <br />
                <span className="bg-gradient-to-r from-emerald-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                  Freedom, Unity &amp; Peace.
                </span>
              </h1>
              <p
                className={`text-base sm:text-lg max-w-2xl leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-zinc-600"
                }`}
              >
                At midnight on 24 October 1964, the Zambian flag was hoisted at Independence Stadium in Lusaka, heralding a proud republic. Gabvia honors the 70+ languages, glorious natural wonders from Victoria Falls to the Copperbelt, and the unbreakable spirit of &ldquo;One Zambia, One Nation&rdquo;.
              </p>
            </div>

            {/* Interactive Rotating Greetings Carousel across Zambia's Regions */}
            <div
              className={`p-4 rounded-2xl border transition-all ${
                isDark ? "border-emerald-500/20 bg-zinc-950/70" : "border-emerald-200 bg-emerald-50/70"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-mono font-bold tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-800"}`}>
                  GREETINGS IN ZAMBIAN LANGUAGES ({currentGreeting.region})
                </span>
                <div className="flex items-center gap-1">
                  {ZAMBIAN_GREETINGS.map((g, idx) => (
                    <button
                      key={g.language}
                      onClick={() => setSelectedLangIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        selectedLangIndex === idx
                          ? "w-6 bg-emerald-400"
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
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-emerald-500/20 text-xs">
                <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>
                  {currentGreeting.translation}
                </span>
                <span className={`font-mono text-[11px] font-semibold ${isDark ? "text-emerald-400" : "text-emerald-700"}`}>
                  {currentGreeting.language}
                </span>
              </div>

              {/* Action Bar: Cheers Reaction & Anthem Sing-Along Lyrics trigger */}
              <div className="mt-3.5 pt-2.5 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setShowLyrics((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all cursor-pointer ${
                    showLyrics
                      ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                      : isDark
                      ? "border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white"
                      : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  <Music className="w-3.5 h-3.5 inline mr-1 text-emerald-500" />
                  {showLyrics ? "Hide Anthem Lyrics" : "Sing Along Lyrics (4 Stanzas)"}
                </button>

                {/* Interactive Cheers Button */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={handleCheer}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer ${
                      isDark
                        ? "border-orange-500/40 bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
                        : "border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100"
                    }`}
                  >
                    <Heart className="w-3.5 h-3.5 fill-current text-orange-500" />
                    <span>{cheersCount} Cheers</span>
                  </button>

                  {/* Floating Popups */}
                  {celebrationPops.map((pop) => (
                    <span
                      key={pop.id}
                      className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs font-bold text-emerald-400 pointer-events-none animate-in fade-in slide-out-to-top duration-700"
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
                  isDark ? "border-emerald-500/30 bg-zinc-950/80 text-zinc-300" : "border-emerald-200 bg-white text-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between mb-3 border-b pb-2 border-zinc-500/20">
                  <span className="font-mono font-bold text-emerald-400">ANTHEM STANZAS:</span>
                  <div className="flex gap-1.5 font-mono text-[10px]">
                    <button
                      onClick={() => setLyricsLang("english")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        lyricsLang === "english" ? "bg-emerald-500 text-black font-bold" : "text-zinc-400"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLyricsLang("bemba")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        lyricsLang === "bemba" ? "bg-emerald-500 text-black font-bold" : "text-zinc-400"
                      }`}
                    >
                      Bemba
                    </button>
                    <button
                      onClick={() => setLyricsLang("nyanja")}
                      className={`px-2 py-0.5 rounded cursor-pointer ${
                        lyricsLang === "nyanja" ? "bg-emerald-500 text-black font-bold" : "text-zinc-400"
                      }`}
                    >
                      Nyanja
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ZAMBIA_ANTHEM_STANZAS.map((stanza) => (
                    <div
                      key={stanza.num}
                      className={`p-2.5 rounded-xl border ${
                        isDark ? "border-zinc-800/80 bg-zinc-900/50" : "border-zinc-100 bg-zinc-50"
                      }`}
                    >
                      <span className="font-mono text-[10px] font-bold text-emerald-500 block mb-1">
                        {stanza.title}
                      </span>
                      {stanza[lyricsLang].map((line, i) => (
                        <p key={i} className={`text-[11px] leading-tight ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
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
                    ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-black shadow-emerald-500/25"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/30"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Chatting on Web</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className={`inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all border cursor-pointer ${
                  isDark
                    ? "border-emerald-500/30 bg-zinc-900/80 hover:bg-zinc-800 text-emerald-300"
                    : "border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950"
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Explore 1964 History</span>
              </button>
            </div>
          </div>

          {/* Right Column: 3D Zambia Independence Medallion & WebGL Experience */}
          <div className="lg:col-span-5">
            <div
              className={`relative rounded-3xl border p-2 shadow-2xl transition-colors ${
                isDark ? "border-emerald-500/30 bg-zinc-900/60" : "border-emerald-200 bg-white"
              }`}
            >
              {/* Corner Crosshairs */}
              <span className="absolute -top-2 -left-2 text-emerald-500 font-mono text-sm select-none">+</span>
              <span className="absolute -top-2 -right-2 text-emerald-500 font-mono text-sm select-none">+</span>
              <span className="absolute -bottom-2 -left-2 text-emerald-500 font-mono text-sm select-none">+</span>
              <span className="absolute -bottom-2 -right-2 text-emerald-500 font-mono text-sm select-none">+</span>

              {/* Card Header */}
              <div
                className={`flex items-center justify-between px-4 py-3 border-b font-mono text-[11px] ${
                  isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-200 text-zinc-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className={isDark ? "text-emerald-300 font-medium" : "text-emerald-950 font-medium"}>
                    ZAMBIA 1964 3D WEBGL
                  </span>
                </div>
                <span>AFRICAN FISH EAGLE MEDALLION</span>
              </div>

              {/* 3D Canvas Viewport with Embedded Anthem Player Overlay */}
              <div
                className={`relative h-[500px] sm:h-[580px] w-full rounded-2xl overflow-hidden transition-colors ${
                  isDark ? "bg-[#07090b]" : "bg-[#fcfcfd]"
                }`}
              >
                <ZambiaIndependence3D
                  theme={isDark ? "dark" : "light"}
                  onOpenHistory={() => setIsHistoryModalOpen(true)}
                  isPlayingAudio={isPlayingAudio}
                  onToggleAudio={toggleAnthem}
                />

                {/* Anthem player (glass overlay inside the 3D scene) */}
                <div className="absolute inset-x-3 bottom-3 z-20 pointer-events-auto">
                  <style>{`@keyframes zambiaEq{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`}</style>
                  <div
                    className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl p-3 sm:p-3.5 shadow-2xl transition-all ${
                      isDark
                        ? "border-emerald-500/25 bg-[#080a0c]/85 shadow-black/70"
                        : "border-emerald-200/90 bg-white/85 shadow-emerald-950/10"
                    }`}
                  >
                    {/* Zambia Tricolor Accent Bar */}
                    <div className="absolute inset-x-0 top-0 flex h-1" aria-hidden="true">
                      <div className="flex-[3] bg-[#15803d]" />
                      <div className="flex-1 bg-[#dc2626]" />
                      <div className="flex-1 bg-[#09090b]" />
                      <div className="flex-1 bg-[#ea580c]" />
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      {/* Play / Pause circular action */}
                      <button
                        type="button"
                        onClick={toggleAnthem}
                        aria-label={isPlayingAudio ? "Pause national anthem" : "Play national anthem"}
                        className="relative shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 hover:scale-105 transition-transform bg-gradient-to-br from-emerald-500 via-teal-500 to-orange-500 ring-2 ring-emerald-400/40 cursor-pointer"
                      >
                        {isPlayingAudio && (
                          <span aria-hidden="true" className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping" />
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
                              Stand and Sing of Zambia, Proud and Free
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold truncate">
                                {isPlayingAudio ? "Now Playing Anthem" : "🎺 Official Instrumental"}
                              </span>
                              <span className="text-[10px] text-zinc-500 hidden sm:inline">•</span>
                              <span className="text-[10px] font-mono text-zinc-400 truncate hidden sm:inline">
                                Lumbanyeni Zambia
                              </span>
                            </div>
                          </div>

                          {/* Dancing Equalizer Bars */}
                          <div className="flex items-end gap-[3px] h-6 shrink-0" aria-hidden="true">
                            {[0, 1, 2, 3, 4, 5].map((i) => (
                              <span
                                key={i}
                                className={`w-[3px] h-full origin-bottom rounded-full ${
                                  i % 3 === 0 ? "bg-emerald-400" : i % 3 === 1 ? "bg-orange-500" : "bg-red-500"
                                }`}
                                style={{
                                  transform: "scaleY(.25)",
                                  animation: isPlayingAudio
                                    ? `zambiaEq ${0.65 + i * 0.12}s ease-in-out ${i * 0.07}s infinite`
                                    : "none",
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Interactive Scrubber + Live Counter */}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-mono text-emerald-500 font-bold tabular-nums w-8 select-none">
                            {formatTime(audioCurrentTime)}
                          </span>
                          <input
                            type="range"
                            aria-label="Anthem progress scrubber"
                            min={0}
                            max={audioDuration || 113}
                            step={0.1}
                            value={audioCurrentTime}
                            onChange={handleSeek}
                            className="flex-1 h-1.5 cursor-pointer accent-emerald-500"
                          />
                          <span className="text-[10px] font-mono text-zinc-400 tabular-nums w-8 text-right select-none">
                            {formatTime(audioDuration || 113)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Row: Credits + Restart + Sing along lyrics toggle */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-zinc-500/15 text-[10px] font-mono">
                      <span className="text-zinc-400 truncate">
                        Tune: Enoch Sontonga &bull; 1964
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={restartAnthem}
                          title="Restart anthem from beginning"
                          className="p-1 rounded hover:text-emerald-400 transition-colors text-zinc-400 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLyrics((prev) => !prev)}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
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
                  <span className={isDark ? "text-emerald-400 font-semibold" : "text-emerald-700 font-semibold"}>
                    24 OCT 1964
                  </span>
                </div>
                <div className="text-center">
                  <span className={`block ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>EMBLEM</span>
                  <span className={isDark ? "text-orange-400 font-semibold" : "text-orange-600 font-semibold"}>
                    African Fish Eagle
                  </span>
                </div>
                <div className="text-right">
                  <span className={`block ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>MOTTO</span>
                  <span className="text-emerald-500 font-semibold">
                    One Zambia, One Nation
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Zambia Independence History Button */}
      <aside aria-label="Zambia Independence History" className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsHistoryModalOpen(true)}
          className={`group relative flex items-center gap-3 p-1.5 pr-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 cursor-pointer ${
            isDark
              ? "bg-[#090b0e]/95 border-emerald-500/80 text-white shadow-emerald-950/80 backdrop-blur-md"
              : "bg-white/95 border-emerald-500 text-emerald-950 shadow-emerald-600/30 backdrop-blur-md"
          }`}
          title="Learn the History of Zambia (1964 — 2026)"
        >
          {/* Animated 4-Section Zambia Flag Circle Badge */}
          <div className="w-10 h-10 rounded-full overflow-hidden flex shadow-md border border-emerald-400/60 flex-shrink-0 relative">
            <div className="flex-[3] bg-[#15803d]" />
            <div className="flex-1 flex flex-col">
              <div className="flex-1 bg-[#dc2626]" />
              <div className="flex-1 bg-[#09090b]" />
              <div className="flex-1 bg-[#ea580c]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center text-[10px] shadow-sm select-none">
                🇿🇲
              </div>
            </div>
          </div>

          <div className="text-left flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-bold tracking-tight leading-tight">
                Zambia History
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 hidden sm:inline-block">
                1964–2026
              </span>
            </div>
            <span
              className={`text-[10px] font-mono leading-none ${
                isDark ? "text-emerald-300/90" : "text-emerald-700"
              }`}
            >
              Explore Country History 🇿🇲 →
            </span>
          </div>

          {/* Shimmer light effect */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000" />
          </div>
        </button>
      </aside>

      {/* Embedded Historical Archive Modal */}
      <ZambiaHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        isDark={isDark}
        isPlayingAudio={isPlayingAudio}
        onToggleAudio={toggleAnthem}
      />

      {/* Zambia National Anthem Audio Element */}
      <audio
        ref={audioRef}
        src="/zambia-national-anthem.mp3"
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
