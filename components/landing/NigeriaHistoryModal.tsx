"use client";

import React, { useEffect, useState } from "react";

interface NigeriaHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
}

const HISTORICAL_MILESTONES = [
  {
    year: "1960",
    date: "October 1, 1960",
    title: "Independence: A Sovereign Nation is Born",
    badge: "FOUNDATIONAL MILESTONE",
    tagColor: "emerald",
    summary:
      "At midnight on October 1, 1960, the British Union Jack was lowered, and the Green-White-Green flag was raised at the Lagos Racecourse (now Tafawa Balewa Square).",
    details: [
      "23-year-old student Michael Taiwo Akinkunmi designed the national flag in 1959, choosing green for agriculture and fertility, and white for peace and unity.",
      "Sir Abubakar Tafawa Balewa delivered the historic inaugural address as the first Prime Minister, with Dr. Nnamdi Azikiwe becoming the first indigenous Governor-General.",
      "Princess Alexandra of Kent represented Queen Elizabeth II at the ceremony to hand over the instruments of independence.",
    ],
  },
  {
    year: "1963",
    date: "October 1, 1963",
    title: "Birth of the Federal Republic of Nigeria",
    badge: "CONSTITUTIONAL SOVEREIGNTY",
    tagColor: "blue",
    summary:
      "Exactly three years after independence, Nigeria promulgated a republican constitution, severing all remaining constitutional ties to the British Monarchy.",
    details: [
      "Dr. Nnamdi Azikiwe was sworn in as the first President of the Federal Republic of Nigeria.",
      "The Judicial Committee of the Privy Council in London ceased to be the highest court of appeal, establishing the Supreme Court of Nigeria as the ultimate legal authority.",
      "The country was organized into four regions: Northern, Western, Eastern, and the newly created Mid-Western Region.",
    ],
  },
  {
    year: "1967 — 1970",
    date: "July 1967 — January 1970",
    title: "The Civil War & The Spirit of Reconciliation",
    badge: "NATIONAL UNITY",
    tagColor: "amber",
    summary:
      "A defining period that tested the federation. The war concluded with General Yakubu Gowon's historic declaration of 'No Victor, No Vanquished'.",
    details: [
      "The post-war era ushered in the famous '3Rs' policy: Reconstruction, Rehabilitation, and Reintegration.",
      "Creation of the National Youth Service Corps (NYSC) in 1973 to foster inter-ethnic unity, national integration, and cultural exposure among young Nigerian graduates.",
      "Established the indomitable resilience of the Nigerian people to preserve the sovereignty and indivisibility of the nation.",
    ],
  },
  {
    year: "1977",
    date: "January 15 — February 12, 1977",
    title: "FESTAC '77: Center of Black World Culture",
    badge: "CULTURAL RENAISSANCE",
    tagColor: "emerald",
    summary:
      "Nigeria hosted the 2nd World Black and African Festival of Arts and Culture (FESTAC '77), the largest pan-African cultural gathering in human history.",
    details: [
      "Over 16,000 participants from 56 African nations and the diaspora gathered in Lagos.",
      "The National Theatre in Iganmu, Lagos—modeled after the Bulgarian military hat—was commissioned specifically for the festival.",
      "Solidified Nigeria's global standing as the cultural, artistic, and philosophical heartbeat of the Black world.",
    ],
  },
  {
    year: "1991",
    date: "December 12, 1991",
    title: "Relocation of the Federal Capital to Abuja",
    badge: "GEOGRAPHIC HEARTLAND",
    tagColor: "purple",
    summary:
      "The seat of the Federal Government was officially relocated from the coastal metropolis of Lagos to the purpose-built capital city of Abuja.",
    details: [
      "Chosen for its central geographic location, favorable climate, and ethnic neutrality in the heart of the country.",
      "Master-planned as a symbol of unity, featuring the iconic Aso Rock, Zuma Rock, and modern infrastructure designed to accommodate all Nigerians equally.",
    ],
  },
  {
    year: "1993",
    date: "June 12, 1993",
    title: "June 12 & The Historic Struggle for Democracy",
    badge: "DEMOCRACY HEROES",
    tagColor: "amber",
    summary:
      "The June 12 presidential election, won by Chief Moshood Kashimawo Olawale (M.K.O.) Abiola, is celebrated as the freest and fairest vote in Nigerian history.",
    details: [
      "Voters across religion, region, and ethnicity united around a single mandate, shattering historical demographic divisions.",
      "The courage of Nigerian pro-democracy activists, journalists, students, and citizens laid the unbreakable foundation for the return of civilian rule.",
      "June 12 is now federally commemorated each year as Nigeria's official Democracy Day.",
    ],
  },
  {
    year: "1999",
    date: "May 29, 1999",
    title: "Inauguration of the Fourth Republic",
    badge: "UNBROKEN DEMOCRACY",
    tagColor: "emerald",
    summary:
      "Nigeria transitioned to civilian democratic governance with the swearing-in of President Olusegun Obasanjo, launching the Fourth Republic.",
    details: [
      "Marked the beginning of the longest continuous era of democratic governance in Nigerian history.",
      "Led to monumental institutional reforms, including the deregulation of telecommunications (GSM revolution), banking consolidation, and judicial independence.",
      "Witnessed successive peaceful transitions of power between political parties, including the historic 2015 democratic handover.",
    ],
  },
  {
    year: "2000s — 2010s",
    date: "2000 — 2019",
    title: "The Nollywood, Afrobeats & Tech Revolution",
    badge: "GLOBAL DOMINANCE",
    tagColor: "blue",
    summary:
      "Nigerian youth, culture, and creative genius took the world stage by storm across cinema, music, and financial technology.",
    details: [
      "Nollywood evolved into the world's 2nd largest film industry by volume, captivating global audiences across cinema and streaming platforms.",
      "Afrobeats grew into a multibillion-dollar global phenomenon with pioneers from Fela Kuti to Wizkid, Burna Boy, and Davido selling out Madison Square Garden and the O2 Arena.",
      "Lagos (Yaba) emerged as the undisputed Silicon Valley of Africa, producing multi-billion-dollar fintech giants and tech innovators.",
    ],
  },
  {
    year: "2026",
    date: "October 1, 2026",
    title: "Nigeria at 66: Unity, Innovation & The Future",
    badge: "66 YEARS OF GLORY",
    tagColor: "emerald",
    summary:
      "Celebrating 66 years as the Giant of Africa, home to over 225 million people with unmatched creative vitality and resilience.",
    details: [
      "Over 70% of Nigeria's population is under 30 years old, representing the youngest and most dynamic talent pool on Earth.",
      "Connecting over 250 ethnic groups and 500 indigenous languages, with Nigerian innovations spanning AI, multilingual communication, renewable energy, and world commerce.",
      "Re-adoption of the founding anthem 'Nigeria, We Hail Thee' in 2024, honoring the sacred vow: 'Though tribe and tongue may differ, in brotherhood we stand.'",
    ],
  },
];

const NATIONAL_SYMBOLS = [
  {
    name: "The National Flag (Green - White - Green)",
    designedBy: "Michael Taiwo Akinkunmi (1959)",
    significance:
      "The two lush green stripes represent Nigeria's vast agricultural wealth, abundant forests, and natural resources. The central white stripe symbolizes lasting peace, harmony, and national unity.",
  },
  {
    name: "The National Coat of Arms",
    elements: "Black Shield, Wavy Pall, Red Eagle, Two White Horses",
    significance:
      "The black shield represents Nigeria's fertile soil; the silver 'Y' shaped wavy band symbolizes the confluence of Rivers Niger and Benue; the red eagle represents national strength; the two chargers (white horses) denote dignity and pride; and the yellow wildflowers (Costus Spectabilis) on the base represent natural beauty.",
  },
  {
    name: "The National Motto",
    text: "“Unity and Faith, Peace and Progress”",
    significance:
      "Enshrined in the 1979 and 1999 Constitutions, serving as the guiding light for national coexistence, governance, and collective aspiration.",
  },
  {
    name: "The River Niger & Benue Confluence",
    location: "Lokoja, Kogi State",
    significance:
      "The unique natural intersection where West Africa's longest river (Niger) meets the Benue River, creating the distinctive geographic landmark that gave the country its name (from 'Niger-area').",
  },
];

const FAST_FACTS = [
  { label: "Population", value: "~225+ Million", subtext: "Most populous in Africa (6th globally)" },
  { label: "Ethnic Groups", value: "250+", subtext: "Diverse cultural tapestry" },
  { label: "Indigenous Languages", value: "500+", subtext: "Hausa, Yorùbá, Igbo, Pidgin & more" },
  { label: "Capital City", value: "Abuja", subtext: "Relocated from Lagos in 1991" },
  { label: "Currency", value: "Nigerian Naira (₦)", subtext: "Issued by Central Bank of Nigeria" },
  { label: "Largest City", value: "Lagos", subtext: "Economic & entertainment powerhouse" },
];

export function NigeriaHistoryModal({
  isOpen,
  onClose,
  isDark,
  isPlayingAudio = false,
  onToggleAudio,
}: NigeriaHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "symbols" | "facts">("timeline");

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity animate-in fade-in"
      />

      {/* Modal Dialog Window */}
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] rounded-3xl border flex flex-col shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200 ${
          isDark
            ? "border-emerald-800/80 bg-[#070e0a] text-white shadow-emerald-950/80"
            : "border-emerald-200 bg-white text-zinc-950 shadow-emerald-900/20"
        }`}
      >
        {/* Tricolor Ribbon on top border */}
        <div className="w-full h-2 flex overflow-hidden">
          <div className="flex-1 bg-[#008751]" />
          <div className="flex-1 bg-white" />
          <div className="flex-1 bg-[#008751]" />
        </div>

        {/* Modal Header */}
        <div
          className={`px-5 sm:px-7 py-4 border-b flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md ${
            isDark
              ? "border-emerald-900/60 bg-[#070e0a]/90 text-white"
              : "border-emerald-100 bg-white/90 text-zinc-950"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-xl shadow-inner">
              🇳🇬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                  The Journey of Nigeria
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  1960 — 2026
                </span>
              </div>
              <p
                className={`text-xs ${
                  isDark ? "text-emerald-300/80" : "text-emerald-800"
                }`}
              >
                Celebrating 66 Years of Independence &amp; African Excellence
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {onToggleAudio && (
              <button
                onClick={onToggleAudio}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold transition-all border ${
                  isPlayingAudio
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-md animate-pulse"
                    : isDark
                    ? "border-emerald-800 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900"
                    : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                }`}
                title="Listen to National Anthem while reading"
              >
                <span>{isPlayingAudio ? "❚❚" : "▶"}</span>
                <span>{isPlayingAudio ? "Anthem Playing" : "Play Anthem"}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all border ${
                isDark
                  ? "border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
                  : "border-zinc-200 bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
              }`}
              aria-label="Close dialog"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div
          className={`flex items-center gap-2 px-5 sm:px-7 py-2.5 border-b text-xs font-mono font-semibold ${
            isDark ? "border-emerald-950 bg-black/40" : "border-emerald-50 bg-emerald-50/40"
          }`}
        >
          <button
            onClick={() => setActiveTab("timeline")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "timeline"
                ? "bg-emerald-600 text-white shadow-sm"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            📜 Historical Timeline (1960–2026)
          </button>
          <button
            onClick={() => setActiveTab("symbols")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "symbols"
                ? "bg-emerald-600 text-white shadow-sm"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            🛡️ National Symbols
          </button>
          <button
            onClick={() => setActiveTab("facts")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "facts"
                ? "bg-emerald-600 text-white shadow-sm"
                : isDark
                ? "text-zinc-400 hover:text-white"
                : "text-zinc-600 hover:text-zinc-950"
            }`}
          >
            ⚡ Key Facts
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-6 space-y-6">
          {/* TAB 1: HISTORICAL TIMELINE */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed flex items-center justify-between gap-4 ${
                  isDark
                    ? "border-emerald-900/50 bg-emerald-950/20 text-emerald-200"
                    : "border-emerald-200 bg-emerald-50/80 text-emerald-900"
                }`}
              >
                <div>
                  <span className="font-bold block mb-0.5">
                    Nigeria at 66: The Chronicle of Resilience &amp; Unity
                  </span>
                  <span>
                    Explore key defining moments that shaped the most populous nation in Africa from October 1, 1960, to the modern digital era.
                  </span>
                </div>
                {onToggleAudio && (
                  <button
                    onClick={onToggleAudio}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 shadow"
                  >
                    {isPlayingAudio ? "❚❚ Pause Anthem" : "▶ Play Anthem"}
                  </button>
                )}
              </div>

              {/* Chronological Timeline Cards */}
              <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-500/30 space-y-8 my-4">
                {HISTORICAL_MILESTONES.map((milestone, idx) => (
                  <div key={idx} className="relative group">
                    {/* Glowing Bullet Dot */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 border-emerald-500 bg-[#070e0a] flex items-center justify-center shadow-md">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>

                    {/* Milestone Card */}
                    <div
                      className={`p-5 rounded-2xl border transition-all ${
                        isDark
                          ? "border-emerald-900/60 bg-zinc-950/70 hover:border-emerald-700/80"
                          : "border-emerald-100 bg-white hover:border-emerald-300 shadow-sm"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-black text-emerald-500">
                            {milestone.year}
                          </span>
                          <span className="text-xs text-zinc-500">•</span>
                          <span
                            className={`text-xs font-mono ${
                              isDark ? "text-zinc-400" : "text-zinc-500"
                            }`}
                          >
                            {milestone.date}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                            isDark
                              ? "border-emerald-800 text-emerald-400 bg-emerald-950/60"
                              : "border-emerald-200 text-emerald-800 bg-emerald-50"
                          }`}
                        >
                          {milestone.badge}
                        </span>
                      </div>

                      <h3
                        className={`text-base sm:text-lg font-bold mb-2 ${
                          isDark ? "text-white" : "text-zinc-950"
                        }`}
                      >
                        {milestone.title}
                      </h3>

                      <p
                        className={`text-xs sm:text-sm leading-relaxed mb-3 ${
                          isDark ? "text-zinc-300" : "text-zinc-700"
                        }`}
                      >
                        {milestone.summary}
                      </p>

                      <ul className="space-y-1.5 pt-1 text-xs">
                        {milestone.details.map((detail, dIdx) => (
                          <li
                            key={dIdx}
                            className={`flex items-start gap-2 ${
                              isDark ? "text-zinc-400" : "text-zinc-600"
                            }`}
                          >
                            <span className="text-emerald-500 font-bold leading-none mt-0.5">
                              ✓
                            </span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: NATIONAL SYMBOLS */}
          {activeTab === "symbols" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NATIONAL_SYMBOLS.map((symbol, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      isDark
                        ? "border-emerald-900/60 bg-zinc-950/70"
                        : "border-emerald-100 bg-white shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-500 font-mono text-xs font-bold">
                        0{idx + 1} //
                      </span>
                      <h3
                        className={`font-bold text-sm sm:text-base ${
                          isDark ? "text-white" : "text-zinc-950"
                        }`}
                      >
                        {symbol.name}
                      </h3>
                    </div>

                    {"designedBy" in symbol && (
                      <p className="text-[11px] font-mono text-emerald-400 mb-2">
                        Designed by: {symbol.designedBy}
                      </p>
                    )}
                    {"elements" in symbol && (
                      <p className="text-[11px] font-mono text-emerald-400 mb-2">
                        Elements: {symbol.elements}
                      </p>
                    )}
                    {"location" in symbol && (
                      <p className="text-[11px] font-mono text-emerald-400 mb-2">
                        Location: {symbol.location}
                      </p>
                    )}
                    {"text" in symbol && (
                      <p className="text-sm font-bold italic text-emerald-300 mb-2">
                        {symbol.text}
                      </p>
                    )}

                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? "text-zinc-300" : "text-zinc-700"
                      }`}
                    >
                      {symbol.significance}
                    </p>
                  </div>
                ))}
              </div>

              {/* The National Pledge */}
              <div
                className={`p-5 rounded-2xl border text-center space-y-2 ${
                  isDark
                    ? "border-emerald-800/60 bg-emerald-950/30 text-emerald-100"
                    : "border-emerald-200 bg-emerald-50/70 text-emerald-950"
                }`}
              >
                <span className="font-mono text-xs uppercase tracking-widest font-bold text-emerald-500 block">
                  The National Pledge
                </span>
                <p className="text-xs sm:text-sm italic leading-relaxed max-w-xl mx-auto">
                  “I pledge to Nigeria my country. To be faithful, loyal and honest. To serve
                  Nigeria with all my strength. To defend her unity, and uphold her honour and
                  glory. So help me God.”
                </p>
                <span className="text-[10px] font-mono text-zinc-500 block pt-1">
                  Authored by Prof. Felicia Adebola Adedoyin in 1976
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: KEY FACTS */}
          {activeTab === "facts" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FAST_FACTS.map((fact, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border text-left ${
                      isDark
                        ? "border-emerald-900/60 bg-zinc-950/70"
                        : "border-emerald-100 bg-white shadow-sm"
                    }`}
                  >
                    <span
                      className={`block font-mono text-[10px] uppercase tracking-wider mb-1 ${
                        isDark ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      {fact.label}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 block mb-1">
                      {fact.value}
                    </span>
                    <span
                      className={`text-xs ${
                        isDark ? "text-zinc-400" : "text-zinc-600"
                      }`}
                    >
                      {fact.subtext}
                    </span>
                  </div>
                ))}
              </div>

              {/* Multilingual Bridge Note (Connecting to Gabvia) */}
              <div
                className={`p-5 rounded-2xl border text-left space-y-2 ${
                  isDark
                    ? "border-emerald-900/60 bg-emerald-950/20 text-emerald-200"
                    : "border-emerald-200 bg-emerald-50/60 text-emerald-950"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">💬</span>
                  <h4 className="font-bold text-sm">
                    Linguistic Wealth &amp; Gabvia&apos;s Mission
                  </h4>
                </div>
                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? "text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  Nigeria is one of the most linguistically diverse nations on earth with over 500 indigenous languages. Gabvia celebrates this rich heritage by offering real-time AI voice note and chat translation across <strong>Hausa, Yorùbá, Igbo, Nigerian Pidgin</strong>, and 40+ world languages—so every Nigerian voice can be heard everywhere on Earth without barriers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 sm:px-7 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 text-xs font-mono ${
            isDark
              ? "border-emerald-900/60 bg-[#070e0a] text-zinc-400"
              : "border-emerald-100 bg-white text-zinc-600"
          }`}
        >
          <span>Federal Republic of Nigeria • 1960 — 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-all shadow-sm"
          >
            Close Overview
          </button>
        </div>
      </div>
    </div>
  );
}
