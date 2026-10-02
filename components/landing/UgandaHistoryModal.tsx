"use client";

import React, { useState } from "react";
import {
  X,
  Volume2,
  VolumeX,
  Calendar,
  Sparkles,
  Award,
  Globe2,
  BookOpen,
  MapPin,
  Music,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

interface UgandaHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
}

const HISTORICAL_MILESTONES = [
  {
    year: "1962",
    date: "9 October 1962",
    title: "Independence Day: The Birth of a Sovereign Uganda",
    badge: "FOUNDATIONAL MILESTONE",
    tagColor: "gold",
    summary:
      "At midnight on 9 October 1962 at Kololo Airstrip in Kampala, the British Union Jack was lowered for the last time and the Black-Yellow-Red flag of Uganda was hoisted to the cheers of thousands.",
    details: [
      "Major Richard Akorimo had the historic honor of hoisting the new national flag of Uganda at midnight.",
      "Prince Edward, the Duke of Kent, representing Queen Elizabeth II, formally handed over the instruments of independence to Prime Minister Apollo Milton Obote.",
      "Sir Edward Mutesa II, the Kabaka of Buganda, later became the first ceremonial President of Uganda under the constitutional agreement of 1963.",
      "The ceremony was witnessed by hundreds of thousands of citizens, delegates from 70 nations, and beamed across radio waves across Africa and the world.",
    ],
  },
  {
    year: "1962",
    date: "July — October 1962",
    title: "The National Anthem: 'Oh Uganda, Land of Beauty'",
    badge: "MUSICAL HERITAGE",
    tagColor: "red",
    summary:
      "Selected through a nationwide competition, George Wilberforce Kakoma composed Uganda's national anthem—one of the shortest, most majestic, and melodically memorable anthems in the world.",
    details: [
      "Kakoma composed the music in July 1962 and collaborated with Peter Wingard on the inspirational lyrics.",
      "At only eight bars of music, it is designed to be concise, solemn, and readily sung by citizens of all ages and languages.",
      "Its opening lines invoke the lush, sunlit beauty of the country, while its final stanza sanctifies the national motto: 'For God and My Country'.",
    ],
  },
  {
    year: "1962",
    date: "October 1962",
    title: "The National Symbols: Crested Crane & The Flag",
    badge: "SOVEREIGN EMBLEMS",
    tagColor: "black",
    summary:
      "Grace Grace Ibingira, then Minister of Justice, designed the six horizontal stripes of Black, Yellow, and Red, centering the Grey Crowned Crane as the sovereign emblem.",
    details: [
      "Black stands for the African people and their ancient indigenous heritage.",
      "Yellow (Gold) represents the glorious sunshine that warms the land along the Equator all year round.",
      "Red symbolizes the shared blood and universal brotherhood uniting all Africans and humanity.",
      "The Grey Crowned Crane (Balearica regulorum gibbericeps) was chosen for its gentle nature, royalty, and its posture with one foot forward—symbolizing Uganda ever moving forward.",
    ],
  },
  {
    year: "1963",
    date: "October 1963",
    title: "The Sovereign Republic & Coat of Arms",
    badge: "CONSTITUTIONAL BIRTH",
    tagColor: "gold",
    summary:
      "One year after independence, Uganda amended its constitution to replace the British monarch with an indigenous Head of State and formally established the national Coat of Arms.",
    details: [
      "The Coat of Arms features the Uganda Kob (representing abundant wildlife) and the Crested Crane standing on a green mound.",
      "The shield depicts the sun (abundant sunshine), traditional drum (culture and royal summoning), and the waves of Lake Victoria & the River Nile.",
      "At the base are coffee and cotton stalks—the twin agricultural pillars of Uganda's prosperity—flanking the River Nile.",
      "Inscribed in gold ribbon beneath the emblem is the sacred national motto: 'FOR GOD AND MY COUNTRY'.",
    ],
  },
  {
    year: "Today",
    date: "64 Years of Sovereignty",
    title: "The Pearl of Africa: Innovation, Culture & Multilingual Power",
    badge: "MODERN UGANDA",
    tagColor: "emerald",
    summary:
      "Coined 'The Pearl of Africa' by Winston Churchill in 1908 for its magnificence, color, and vitality, Uganda stands today as a vibrant technological, agricultural, and cultural hub in East Africa.",
    details: [
      "Home to the Source of the River Nile at Jinja, the snow-capped Rwenzori Mountains of the Moon, and the biodiversity of Bwindi Impenetrable National Park.",
      "A rich linguistic mosaic spanning Luganda, Swahili, Runyankole, Acholi, Lusoga, Ateso, Lugbara, English, and more than 40 indigenous tongues.",
      "Gabvia empowers Ugandans and the global diaspora to bridge languages instantly—sending translated voice notes and chats across 40+ world languages with zero friction.",
    ],
  },
];

const ANTHEM_STANZAS = [
  {
    number: "Stanza 1",
    theme: "Land of Beauty & Freedom",
    english: [
      "Oh, Uganda! may God uphold thee,",
      "We lay our future in thy hand;",
      "United, free for liberty",
      "Together we'll always stand.",
    ],
    luganda: [
      "Yee Uganda! Katonda akukuume,",
      "Tuteeka ebyenkya byaffe mu mikono gyo;",
      "Wamu n'eddembe ly'ensi yaffe",
      "Twembi tubeerere wamu bulijjo.",
    ],
    swahili: [
      "Ee Uganda! Mungu akulinde,",
      "Tunaweka mustakabali wetu mikononi mwako;",
      "Pamoja, huru kwa ajili ya uhuru,",
      "Daima tutasimama pamoja.",
    ],
  },
  {
    number: "Stanza 2",
    theme: "Sun & Fertile Land",
    english: [
      "Oh, Uganda! the land of freedom,",
      "Our love and labour we give;",
      "And with neighbors all at our country's call",
      "In peace and friendship we'll live.",
    ],
    luganda: [
      "Yee Uganda! Ensi ey'eddembe,",
      "Okwagala n'emirimu gyaffe tuguwaayo;",
      "N'abaziranyi bonna ku kukoowoola kw'ensi yaffe",
      "Mu mirembe n'omukwano tunaabeeranga.",
    ],
    swahili: [
      "Ee Uganda! Nchi ya uhuru,",
      "Upendo wetu na kazi zetu tunatoa;",
      "Na majirani wote nchi yetu inapoita,",
      "Kwa amani na urafiki tutaishi.",
    ],
  },
  {
    number: "Stanza 3",
    theme: "The Pearl of Africa & The Motto",
    english: [
      "Oh, Uganda! the land that feeds us,",
      "By sun and fertile soil grown;",
      "For our own dear land, we'll always stand:",
      "The Pearl of Africa's Crown.",
    ],
    luganda: [
      "Yee Uganda! Ensi etuliisa,",
      "N'omusana n'ettaka eggimu erikulisa;",
      "Ku lw'ensi yaffe eyaffe, tunaayimiriranga bulijjo:",
      "Luulu w'Afirika ey'ettiiti.",
    ],
    swahili: [
      "Ee Uganda! Nchi inayotulisha,",
      "Kwa jua na ardhi yenye rutuba iliyostawi;",
      "Kwa nchi yetu wenyewe, tutasimama daima:",
      "Lulu ya Taji la Afrika.",
    ],
  },
];

const FAST_FACTS = [
  { label: "Date of Independence", value: "9 October 1962", icon: Calendar },
  { label: "First Prime Minister", value: "Dr. Apollo Milton Obote", icon: Award },
  { label: "First President / Kabaka", value: "Sir Edward Mutesa II", icon: Award },
  { label: "National Motto", value: "For God and My Country", icon: Sparkles },
  { label: "National Emblem", value: "Grey Crowned Crane", icon: Globe2 },
  { label: "Historic Location", value: "Kololo Airstrip, Kampala", icon: MapPin },
  { label: "Flag Colors", value: "Black • Yellow (Gold) • Red", icon: BookOpen },
  { label: "Anthem Composer", value: "George Wilberforce Kakoma", icon: Music },
];

export function UgandaHistoryModal({
  isOpen,
  onClose,
  isDark,
  isPlayingAudio = false,
  onToggleAudio,
}: UgandaHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "symbols" | "anthem" | "languages">("timeline");
  const [anthemLang, setAnthemLang] = useState<"english" | "luganda" | "swahili">("english");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? "bg-[#0c0d12] border-zinc-800 text-zinc-100" : "bg-white border-zinc-200 text-zinc-900"
        }`}
      >
        {/* Top Flag Ribbon: Uganda Black, Yellow, Red */}
        <div className="h-2 w-full flex shrink-0">
          <div className="flex-1 bg-black" />
          <div className="flex-1 bg-[#FCDC04]" />
          <div className="flex-1 bg-[#D90000]" />
          <div className="flex-1 bg-black" />
          <div className="flex-1 bg-[#FCDC04]" />
          <div className="flex-1 bg-[#D90000]" />
        </div>

        {/* Modal Header */}
        <div
          className={`px-5 sm:px-8 py-5 border-b flex items-center justify-between gap-4 shrink-0 ${
            isDark ? "border-zinc-800/80 bg-zinc-950/60" : "border-zinc-100 bg-zinc-50/70"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500/20 via-red-500/10 to-yellow-500/20 border border-amber-500/30 text-2xl shadow-inner select-none">
              🇺🇬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-amber-500">
                  9 OCTOBER 1962 • 64 YEARS OF SOVEREIGNTY
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <span>Uganda Independence &amp; Heritage</span>
              </h2>
              <p className={`text-xs font-mono ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Motto: &ldquo;For God and My Country&rdquo; &bull; The Pearl of Africa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleAudio && (
              <button
                onClick={onToggleAudio}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold font-mono border transition-all ${
                  isPlayingAudio
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-sm shadow-amber-500/20 animate-pulse"
                    : isDark
                    ? "border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300"
                    : "border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700"
                }`}
                title={isPlayingAudio ? "Pause National Anthem" : "Play National Anthem"}
              >
                {isPlayingAudio ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Playing Anthem</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Play Anthem</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-white"
                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100 text-zinc-600 hover:text-black"
              }`}
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex items-center gap-1 px-5 sm:px-8 py-2.5 border-b overflow-x-auto no-scrollbar shrink-0 text-xs font-mono font-medium ${
            isDark ? "border-zinc-800/80 bg-zinc-950/40" : "border-zinc-100 bg-zinc-50/50"
          }`}
        >
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "timeline"
                ? isDark
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
                : isDark
                ? "text-zinc-400 hover:text-white hover:bg-zinc-900"
                : "text-zinc-600 hover:text-black hover:bg-zinc-100"
            }`}
          >
            📜 The 1962 Story &amp; Milestones
          </button>

          <button
            onClick={() => setActiveTab("symbols")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "symbols"
                ? isDark
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
                : isDark
                ? "text-zinc-400 hover:text-white hover:bg-zinc-900"
                : "text-zinc-600 hover:text-black hover:bg-zinc-100"
            }`}
          >
            🦅 National Symbols &amp; Flag
          </button>

          <button
            onClick={() => setActiveTab("anthem")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "anthem"
                ? isDark
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
                : isDark
                ? "text-zinc-400 hover:text-white hover:bg-zinc-900"
                : "text-zinc-600 hover:text-black hover:bg-zinc-100"
            }`}
          >
            🎵 National Anthem (3 Stanzas)
          </button>

          <button
            onClick={() => setActiveTab("languages")}
            className={`px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "languages"
                ? isDark
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-amber-100 text-amber-900 border border-amber-300"
                : isDark
                ? "text-zinc-400 hover:text-white hover:bg-zinc-900"
                : "text-zinc-600 hover:text-black hover:bg-zinc-100"
            }`}
          >
            🌍 East Africa &amp; Gabvia
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-8">
          {/* TAB 1: TIMELINE & HISTORICAL MILESTONES */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              {/* Quick Fact Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FAST_FACTS.map((fact, idx) => {
                  const Icon = fact.icon;
                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border transition-colors ${
                        isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-3.5 h-3.5 text-amber-500" />
                        <span className={`text-[10px] font-mono uppercase tracking-wider ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                          {fact.label}
                        </span>
                      </div>
                      <span className={`text-xs font-bold block leading-snug ${isDark ? "text-white" : "text-zinc-900"}`}>
                        {fact.value}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Historical Timeline List */}
              <div className="space-y-5 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold tracking-tight">Historic Timeline &amp; Journey</h3>
                  <span className="text-xs font-mono text-amber-500">1962 — 2026</span>
                </div>

                <div className="space-y-4">
                  {HISTORICAL_MILESTONES.map((item, index) => (
                    <div
                      key={index}
                      className={`p-5 rounded-2xl border transition-colors relative overflow-hidden ${
                        isDark ? "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700" : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-amber-500 font-mono">{item.year}</span>
                          <span className="text-zinc-500">&bull;</span>
                          <span className="text-xs font-mono text-zinc-400">{item.date}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold uppercase">
                          {item.badge}
                        </span>
                      </div>

                      <h4 className="text-sm sm:text-base font-bold mb-2 text-zinc-100">{item.title}</h4>
                      <p className={`text-xs sm:text-sm leading-relaxed mb-3 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                        {item.summary}
                      </p>

                      <div className="space-y-1.5 pt-1 border-t border-zinc-800/40">
                        {item.details.map((point, pIdx) => (
                          <div key={pIdx} className="flex items-start gap-2 text-xs text-zinc-400">
                            <span className="text-amber-500 mt-0.5 shrink-0">&bull;</span>
                            <span className="leading-snug">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NATIONAL SYMBOLS */}
          {activeTab === "symbols" && (
            <div className="space-y-6">
              {/* Flag Breakdown */}
              <div
                className={`p-5 sm:p-6 rounded-2xl border ${
                  isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Flag Illustration */}
                  <div className="w-full sm:w-48 h-32 rounded-xl overflow-hidden border border-zinc-700 flex flex-col shadow-lg shrink-0 relative">
                    <div className="flex-1 bg-black" />
                    <div className="flex-1 bg-[#FCDC04]" />
                    <div className="flex-1 bg-[#D90000]" />
                    <div className="flex-1 bg-black" />
                    <div className="flex-1 bg-[#FCDC04]" />
                    <div className="flex-1 bg-[#D90000]" />

                    {/* Centered Crested Crane disc */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-white border border-zinc-400 flex items-center justify-center text-xl shadow-md">
                        🦅
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-500">
                      OFFICIALLY ADOPTED 9 OCTOBER 1962
                    </span>
                    <h3 className="text-base sm:text-lg font-bold">The National Flag of Uganda</h3>
                    <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                      Designed by Grace Ibingira, the flag features six alternating horizontal stripes of Black, Yellow, and Red, with a white central disc containing the Grey Crowned Crane facing the flagpole.
                    </p>
                  </div>
                </div>

                {/* Color Legend */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-zinc-800">
                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-black border border-zinc-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold block">Black</span>
                      <span className="text-[11px] text-zinc-400 leading-tight block">
                        Represents the African people and their sovereign indigenous lineage.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#FCDC04] border border-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold block">Yellow (Gold)</span>
                      <span className="text-[11px] text-zinc-400 leading-tight block">
                        Represents the abundant African sunshine warming the land along the Equator.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#D90000] border border-red-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold block">Red</span>
                      <span className="text-[11px] text-zinc-400 leading-tight block">
                        Represents the common brotherhood and blood connecting all humanity.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Crested Crane Deep Dive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className={`p-5 rounded-2xl border ${
                    isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🦅</span>
                    <h4 className="text-sm font-bold">The Grey Crowned Crane</h4>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    The national bird of Uganda is known for its gentle, graceful demeanor and its crown of golden feathers. Standing proudly on one leg with the other poised forward, it embodies the spirit of a peaceful nation perpetually marching into progress.
                  </p>
                </div>

                <div
                  className={`p-5 rounded-2xl border ${
                    isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">🛡️</span>
                    <h4 className="text-sm font-bold">The National Coat of Arms</h4>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    Flanked by the Uganda Kob and the Crested Crane, the shield features the Sun, traditional royal drum, Lake Victoria waves, coffee, and cotton. Across the base flows the River Nile with the motto: &ldquo;For God and My Country&rdquo;.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NATIONAL ANTHEM */}
          {activeTab === "anthem" && (
            <div className="space-y-6">
              {/* Anthem Audio Banner */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark
                    ? "bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-900 border-amber-500/30"
                    : "bg-amber-50/80 border-amber-200"
                }`}
              >
                <div>
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider block">
                    COMPOSED BY GEORGE WILBERFORCE KAKOMA (1962)
                  </span>
                  <h3 className="text-lg font-bold tracking-tight">Oh Uganda, Land of Beauty</h3>
                  <p className="text-xs text-zinc-400">
                    Composed in July 1962 &bull; 8 bars of melody &bull; One of the world&apos;s most concise anthems
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 p-1 rounded-xl border border-zinc-800 bg-zinc-900 text-xs font-mono">
                    <button
                      onClick={() => setAnthemLang("english")}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        anthemLang === "english" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setAnthemLang("luganda")}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        anthemLang === "luganda" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Luganda
                    </button>
                    <button
                      onClick={() => setAnthemLang("swahili")}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        anthemLang === "swahili" ? "bg-amber-500 text-black font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      Swahili
                    </button>
                  </div>
                </div>
              </div>

              {/* 3 Stanzas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {ANTHEM_STANZAS.map((stanza, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-colors ${
                      isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                      <span className="text-xs font-bold text-amber-500 font-mono">{stanza.number}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{stanza.theme}</span>
                    </div>

                    <div className="space-y-2 font-serif text-xs sm:text-sm leading-relaxed text-zinc-200">
                      {stanza[anthemLang].map((line, lIdx) => (
                        <p key={lIdx} className="italic">
                          &ldquo;{line}&rdquo;
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: EAST AFRICA & GABVIA MULTILINGUAL */}
          {activeTab === "languages" && (
            <div className="space-y-6">
              <div
                className={`p-5 sm:p-6 rounded-2xl border ${
                  isDark ? "bg-zinc-900/60 border-zinc-800" : "bg-zinc-50 border-zinc-200"
                }`}
              >
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] font-mono text-amber-500 font-bold uppercase tracking-wider">
                    MULTILINGUAL HERITAGE IN ACTION
                  </span>
                  <h3 className="text-lg font-bold">Uniting Diverse Languages with Zero Friction</h3>
                  <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                    Uganda is home to more than 40 indigenous languages belonging to Bantu, Nilotic, Central Sudanic, and Kuliak language families. On Gabvia, language barriers dissolve completely.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-800">
                  <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-1">
                    <span className="text-xs font-bold text-amber-400 block font-mono">Luganda &bull; Oluganda</span>
                    <p className="text-xs text-zinc-300">
                      &ldquo;Oli otya? Tusobola okwogera n&apos;omuntu yenna mu nsi yonna nga tewali buzibu bw&apos;olulimi.&rdquo;
                    </p>
                    <span className="text-[10px] text-zinc-500 block italic">
                      &ldquo;How are you? We can speak with anyone in the world without language barriers.&rdquo;
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-950/60 space-y-1">
                    <span className="text-xs font-bold text-amber-400 block font-mono">Swahili &bull; Kiswahili</span>
                    <p className="text-xs text-zinc-300">
                      &ldquo;Habari yako? Gabvia inavunja vizuizi vya lugha ili Afrika ya Mashariki iweze kuungana na ulimwengu.&rdquo;
                    </p>
                    <span className="text-[10px] text-zinc-500 block italic">
                      &ldquo;Gabvia breaks language barriers so East Africa connects seamlessly with the world.&rdquo;
                    </span>
                  </div>
                </div>
              </div>

              {/* End-to-End Privacy callout */}
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  isDark ? "bg-amber-500/10 border-amber-500/30 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-xs leading-relaxed">
                  Gabvia provides end-to-end encrypted direct messaging and speech-to-speech translations so your conversations, voice notes, and communications stay 100% private to you and your recipient.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 sm:px-8 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs font-mono ${
            isDark ? "border-zinc-800 bg-zinc-950/80 text-zinc-400" : "border-zinc-100 bg-zinc-50 text-zinc-600"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>COMMEMORATING UGANDA INDEPENDENCE &bull; 9 OCTOBER 1962</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs hover:from-amber-400 hover:to-yellow-400 transition-all cursor-pointer shadow-md shadow-amber-500/20"
          >
            Close &amp; Explore Platform
          </button>
        </div>
      </div>
    </div>
  );
}
