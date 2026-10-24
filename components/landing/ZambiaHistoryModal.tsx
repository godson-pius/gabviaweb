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

interface ZambiaHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  isPlayingAudio?: boolean;
  onToggleAudio?: () => void;
}

const HISTORICAL_MILESTONES = [
  {
    year: "1964",
    date: "24 October 1964",
    title: "Independence Midnight: The Birth of the Republic of Zambia",
    badge: "FOUNDATIONAL MILESTONE",
    tagColor: "copper",
    summary:
      "At midnight on 24 October 1964 at the Independence Stadium in Lusaka, the British Union Jack was lowered for the last time and the vibrant Green, Red, Black, and Copper flag of Zambia was hoisted to the thunderous cheers of a new nation.",
    details: [
      "Zambia officially declared independence from British colonial rule (Northern Rhodesia) after decades of peaceful and determined civil resistance.",
      "Dr. Kenneth David Kaunda ('KK') was inaugurated as the first President of Zambia, leading the United National Independence Party (UNIP).",
      "Unlike many former British territories that began as dominions, Zambia declared itself an immediate sovereign constitutional Republic on day one.",
      "Representatives from over 60 nations attended the historic ceremony, celebrating alongside more than 30,000 citizens in Lusaka.",
    ],
  },
  {
    year: "1964",
    date: "October 1964",
    title: "The National Philosophy: 'One Zambia, One Nation'",
    badge: "SACRED CREED",
    tagColor: "green",
    summary:
      "Dr. Kenneth Kaunda established the unifying national motto 'One Zambia, One Nation' to bridge more than 73 distinct ethnic groups into a single brotherhood without ethnic strife.",
    details: [
      "The phrase became Zambia's eternal compass, fostering an enduring tradition of peace, democracy, and national solidarity.",
      "Kaunda also championed Zambian Humanism, an indigenous socio-political philosophy placing human dignity, hospitality, and communal welfare at the heart of statecraft.",
      "Zambia emerged as a courageous sanctuary and frontline state, providing haven, logistics, and moral leadership to freedom movements across Southern Africa.",
    ],
  },
  {
    year: "1964",
    date: "October 1964",
    title: "The National Anthem: 'Stand and Sing of Zambia, Proud and Free'",
    badge: "MUSICAL HERITAGE",
    tagColor: "copper",
    summary:
      "Set to the stirring melody of Enoch Sontonga's 1897 hymn 'Nkosi Sikelel' iAfrika', the national anthem was adapted with lyrics composed by a collective of Zambian educators and poets.",
    details: [
      "Known in Bemba as 'Lumbanyeni Zambia' and in Nyanja as 'Dziko la Zambia', the anthem celebrates work, joy in unity, and victor's struggle for righteous freedom.",
      "The soaring chorus ('Africa is our own motherland / Fashion'd with and blessed by God's good hand') anchors Zambia firmly within the Pan-African renaissance.",
      "Adopted under the National Anthem Act, it is sung with hand over heart in English, Bemba, Nyanja, and Tonga across all formal state and civic gatherings.",
    ],
  },
  {
    year: "1964",
    date: "October 1964",
    title: "The National Symbols: The African Fish Eagle & The Flag",
    badge: "SOVEREIGN EMBLEMS",
    tagColor: "gold",
    summary:
      "Designed by acclaimed artist Gabriel Ellison, Zambia's flag breaks traditional heraldic conventions with its green field and distinct lower fly tricolor topped by the African Fish Eagle.",
    details: [
      "Green represents Zambia's abundant agricultural resources, lush flora, and fertile soil.",
      "Red symbolizes the blood shed and selfless sacrifices made in the bitter struggle for freedom.",
      "Black represents the Zambian people and indigenous African heritage.",
      "Orange/Copper honors the country's immense mineral wealth, world-famous copper mines, and economic strength.",
      "The African Fish Eagle (Haliaeetus vocifer) in flight symbolizes the Zambian people's ability to rise above adversity and soar high towards freedom and peace.",
    ],
  },
  {
    year: "1964",
    date: "23 October 1964",
    title: "The Freedom Statue: The Legend of Zanco Mpundu Mutembo",
    badge: "MONUMENT OF COURAGE",
    tagColor: "red",
    summary:
      "Standing tall in front of the National Museum along Independence Avenue in Lusaka, the Freedom Statue immortalizes Zanco Mpundu Mutembo snapping iron shackles.",
    details: [
      "In the early 1960s, Mutembo was ordered by colonial soldiers to submit, but he defiantly snapped heavy iron chains shackling his hands and cried 'Freedom!'.",
      "The statue depicts a man breaking chains with both fists raised to the heavens, an immortal tribute to all heroes who laid down their lives for self-determination.",
      "Every year on 24 October, state wreath-laying ceremonies commence at this sacred monument.",
    ],
  },
  {
    year: "Today",
    date: "62 Years of Sovereignty",
    title: "Mosi-oa-Tunya, Multilingual Harmony & Modern Innovation",
    badge: "MODERN ZAMBIA",
    tagColor: "emerald",
    summary:
      "From Victoria Falls ('The Smoke That Thunders') to thriving tech hubs in Lusaka and the Copperbelt, Zambia stands today as an African beacon of peace, rich culture, and multilingual progress.",
    details: [
      "Home to Mosi-oa-Tunya (Victoria Falls), one of the Seven Natural Wonders of the World where the Zambezi River roars down over 100 meters.",
      "A rich linguistic mosaic spanning Bemba, Nyanja, Tonga, Lozi, Kaonde, Luvale, Lunda, and over 70 indigenous dialects.",
      "Gabvia empowers Zambians at home and across the worldwide diaspora to communicate seamlessly with real-time AI translation, voice notes, and end-to-end encryption.",
    ],
  },
];

const ANTHEM_STANZAS = [
  {
    number: "Stanza 1",
    theme: "Freedom & Unity",
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
    number: "Stanza 2 (Chorus)",
    theme: "Mother Africa",
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
    number: "Stanza 3",
    theme: "The Noble Eagle & Peace",
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
    number: "Stanza 4 (Praise)",
    theme: "Praise to the Almighty",
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

const FAST_FACTS = [
  { label: "Date of Independence", value: "24 October 1964", icon: Calendar },
  { label: "First President", value: "Dr. Kenneth David Kaunda", icon: Award },
  { label: "National Motto", value: "One Zambia, One Nation", icon: Sparkles },
  { label: "National Bird", value: "African Fish Eagle (Haliaeetus vocifer)", icon: Globe2 },
  { label: "Historic Ground", value: "Independence Stadium, Lusaka", icon: MapPin },
  { label: "Flag Colors", value: "Green • Red • Black • Copper Orange", icon: BookOpen },
  { label: "Natural Wonder", value: "Mosi-oa-Tunya (Victoria Falls)", icon: MapPin },
  { label: "Anthem Tune", value: "Adapted from Enoch Sontonga (1897)", icon: Music },
];

export function ZambiaHistoryModal({
  isOpen,
  onClose,
  isDark,
  isPlayingAudio = false,
  onToggleAudio,
}: ZambiaHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<"timeline" | "symbols" | "anthem" | "languages">("timeline");
  const [anthemLang, setAnthemLang] = useState<"english" | "bemba" | "nyanja">("english");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? "bg-[#090b0e] border-emerald-900/60 text-zinc-100" : "bg-white border-emerald-200 text-zinc-900"
        }`}
      >
        {/* Top Flag Ribbon: Zambia Green, Red, Black, Copper */}
        <div className="h-2 w-full flex shrink-0">
          <div className="flex-[3] bg-[#15803d]" />
          <div className="flex-1 bg-[#dc2626]" />
          <div className="flex-1 bg-[#09090b]" />
          <div className="flex-1 bg-[#ea580c]" />
        </div>

        {/* Modal Header */}
        <div
          className={`px-5 sm:px-8 py-5 border-b flex items-center justify-between gap-4 shrink-0 ${
            isDark ? "border-zinc-800/80 bg-zinc-950/70" : "border-zinc-100 bg-zinc-50/80"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 via-orange-500/10 to-emerald-500/20 border border-emerald-500/30 text-2xl shadow-inner select-none">
              🇿🇲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-emerald-500">
                  24 OCTOBER 1964 • 62 YEARS OF SOVEREIGNTY
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-2">
                <span>Zambia Independence &amp; Heritage</span>
              </h2>
              <p className={`text-xs font-mono ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                Motto: &ldquo;One Zambia, One Nation&rdquo; &bull; The Warm Heart of Southern Africa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleAudio && (
              <button
                onClick={onToggleAudio}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold font-mono border transition-all cursor-pointer ${
                  isPlayingAudio
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/20 animate-pulse"
                    : isDark
                    ? "border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300"
                    : "border-zinc-200 bg-white hover:bg-zinc-100 text-zinc-700"
                }`}
                title={isPlayingAudio ? "Pause National Anthem" : "Play Zambia National Anthem"}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pause Anthem</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Play Anthem</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                isDark
                  ? "border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                  : "border-zinc-200 hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900"
              }`}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className={`flex items-center gap-2 px-5 sm:px-8 border-b shrink-0 overflow-x-auto no-scrollbar font-mono text-xs ${
            isDark ? "border-zinc-800/80 bg-zinc-950/40" : "border-zinc-100 bg-white"
          }`}
        >
          <button
            onClick={() => setActiveTab("timeline")}
            className={`py-3 px-3 border-b-2 font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "timeline"
                ? "border-emerald-500 text-emerald-400"
                : isDark
                ? "border-transparent text-zinc-400 hover:text-zinc-200"
                : "border-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Chronicle of Freedom
          </button>
          <button
            onClick={() => setActiveTab("symbols")}
            className={`py-3 px-3 border-b-2 font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "symbols"
                ? "border-emerald-500 text-emerald-400"
                : isDark
                ? "border-transparent text-zinc-400 hover:text-zinc-200"
                : "border-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            National Symbols &amp; Flag
          </button>
          <button
            onClick={() => setActiveTab("anthem")}
            className={`py-3 px-3 border-b-2 font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "anthem"
                ? "border-emerald-500 text-emerald-400"
                : isDark
                ? "border-transparent text-zinc-400 hover:text-zinc-200"
                : "border-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            National Anthem Lyrics
          </button>
          <button
            onClick={() => setActiveTab("languages")}
            className={`py-3 px-3 border-b-2 font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "languages"
                ? "border-emerald-500 text-emerald-400"
                : isDark
                ? "border-transparent text-zinc-400 hover:text-zinc-200"
                : "border-transparent text-zinc-600 hover:text-zinc-900"
            }`}
          >
            Linguistic Heritage &amp; Gabvia
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {/* Quick Facts Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FAST_FACTS.map((fact, idx) => {
              const IconComp = fact.icon;
              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border transition-colors ${
                    isDark ? "border-zinc-800/80 bg-zinc-900/40" : "border-zinc-100 bg-zinc-50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <IconComp className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 truncate">
                      {fact.label}
                    </span>
                  </div>
                  <span className={`text-xs sm:text-sm font-bold block truncate ${isDark ? "text-zinc-100" : "text-zinc-900"}`}>
                    {fact.value}
                  </span>
                </div>
              );
            })}
          </div>

          {/* TAB 1: Chronicle of Freedom */}
          {activeTab === "timeline" && (
            <div className="space-y-6">
              <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-orange-500 before:to-emerald-500">
                {HISTORICAL_MILESTONES.map((item, idx) => (
                  <div key={idx} className="relative group">
                    {/* Node Dot */}
                    <div className="absolute -left-[23px] sm:-left-[27px] top-1.5 w-4 h-4 rounded-full border-2 border-[#15803d] bg-zinc-950 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    </div>

                    <div
                      className={`p-5 rounded-2xl border transition-all ${
                        isDark ? "border-zinc-800/80 bg-zinc-900/50 hover:border-emerald-500/40" : "border-zinc-200 bg-white hover:border-emerald-300"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded-md font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            {item.year}
                          </span>
                          <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>{item.date}</span>
                        </div>
                        <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          {item.badge}
                        </span>
                      </div>

                      <h3 className={`text-base sm:text-lg font-bold mb-2 ${isDark ? "text-white" : "text-zinc-950"}`}>
                        {item.title}
                      </h3>
                      <p className={`text-xs sm:text-sm leading-relaxed mb-4 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                        {item.summary}
                      </p>

                      <ul className="space-y-2 pt-3 border-t border-dashed border-zinc-800/60">
                        {item.details.map((detail, dIdx) => (
                          <li key={dIdx} className="flex items-start gap-2 text-xs leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className={isDark ? "text-zinc-400" : "text-zinc-600"}>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: National Symbols & Flag */}
          {activeTab === "symbols" && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl border ${
                  isDark ? "border-emerald-500/30 bg-emerald-950/10" : "border-emerald-200 bg-emerald-50/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#15803d] flex items-center justify-center text-white font-bold text-xl shadow-md">
                    🦅
                  </div>
                  <div>
                    <h3 className="text-base font-bold">The National Flag &amp; Gabriel Ellison&apos;s Design</h3>
                    <p className={`text-xs font-mono ${isDark ? "text-zinc-400" : "text-zinc-600"}`}>
                      Adopted on 24 October 1964 &bull; Designed by Gabriel Ellison, O.G.D.S., M.B.E.
                    </p>
                  </div>
                </div>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  The Zambian flag is celebrated globally as one of the most uniquely composed national flags. Instead of standard horizontal stripes, it features an all-green field with three vertical stripes (Red, Black, Copper Orange) in the lower fly corner, surmounted by the soaring African Fish Eagle.
                </p>
              </div>

              {/* Color breakdown cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className={`p-4 rounded-xl border ${isDark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white"}`}>
                  <div className="w-8 h-8 rounded-lg bg-[#15803d] mb-2 shadow-sm" />
                  <span className="font-mono text-xs font-bold text-emerald-400 block">GREEN FIELD</span>
                  <p className="text-xs text-zinc-400 mt-1">
                    Represents Zambia&apos;s lush natural vegetation, fertile soils, agriculture, and forestry that sustain the nation.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white"}`}>
                  <div className="w-8 h-8 rounded-lg bg-[#dc2626] mb-2 shadow-sm" />
                  <span className="font-mono text-xs font-bold text-red-400 block">RED STRIPE</span>
                  <p className="text-xs text-zinc-400 mt-1">
                    Symbolizes the struggle for freedom and the blood shed by courageous patriots fighting colonial rule.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white"}`}>
                  <div className="w-8 h-8 rounded-lg bg-[#09090b] border border-zinc-700 mb-2 shadow-sm" />
                  <span className="font-mono text-xs font-bold text-zinc-300 block">BLACK STRIPE</span>
                  <p className="text-xs text-zinc-400 mt-1">
                    Represents the Zambian people, their indigenous heritage, strength, and sovereign brotherhood.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white"}`}>
                  <div className="w-8 h-8 rounded-lg bg-[#ea580c] mb-2 shadow-sm" />
                  <span className="font-mono text-xs font-bold text-orange-400 block">COPPER STRIPE</span>
                  <p className="text-xs text-zinc-400 mt-1">
                    Honors Zambia&apos;s world-renowned mineral wealth, copper mining industry, and economic backbone.
                  </p>
                </div>
              </div>

              {/* The African Fish Eagle Detail */}
              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? "border-zinc-800 bg-zinc-900/40" : "border-zinc-200 bg-zinc-50"
                }`}
              >
                <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span>The African Fish Eagle (Haliaeetus vocifer)</span>
                </h4>
                <p className={`text-xs leading-relaxed mb-3 ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  Perched high above the Zambezi and Kafue rivers, the African Fish Eagle is renowned for its iconic ringing call and effortless mastery of the skies. On the Zambian flag, the eagle is depicted with wings outspread in mid-flight, symbolizing the nation&apos;s resilience and the people&apos;s ability to rise triumphantly over any challenge.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className={`p-2.5 rounded-lg border ${isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white"}`}>
                    <span className="text-zinc-500 block text-[10px]">COAT OF ARMS MOTTO</span>
                    <span className="font-bold text-emerald-400">&ldquo;ONE ZAMBIA, ONE NATION&rdquo;</span>
                  </div>
                  <div className={`p-2.5 rounded-lg border ${isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-200 bg-white"}`}>
                    <span className="text-zinc-500 block text-[10px]">FREEDOM STATUE COMMEMORATION</span>
                    <span className="font-bold text-orange-400">Zanco Mpundu Mutembo (Chain Breaker)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: National Anthem Lyrics */}
          {activeTab === "anthem" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border border-zinc-800 bg-zinc-950/60">
                <div>
                  <h3 className="text-sm font-bold">Stand and Sing of Zambia, Proud and Free</h3>
                  <p className="text-xs font-mono text-zinc-400">
                    Adopted 24 October 1964 &bull; Melody based on &ldquo;Nkosi Sikelel&apos; iAfrika&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs">
                  <button
                    onClick={() => setAnthemLang("english")}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      anthemLang === "english"
                        ? "bg-emerald-500 text-black font-bold"
                        : isDark
                        ? "text-zinc-400 hover:text-white"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setAnthemLang("bemba")}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      anthemLang === "bemba"
                        ? "bg-emerald-500 text-black font-bold"
                        : isDark
                        ? "text-zinc-400 hover:text-white"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    Bemba (Lumbanyeni)
                  </button>
                  <button
                    onClick={() => setAnthemLang("nyanja")}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      anthemLang === "nyanja"
                        ? "bg-emerald-500 text-black font-bold"
                        : isDark
                        ? "text-zinc-400 hover:text-white"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    Nyanja (Dziko la Zambia)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ANTHEM_STANZAS.map((stanza, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDark ? "border-zinc-800/80 bg-zinc-900/50" : "border-zinc-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{stanza.number}</span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{stanza.theme}</span>
                    </div>
                    <div className="space-y-1.5 font-sans">
                      {stanza[anthemLang].map((line, lIdx) => (
                        <p key={lIdx} className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Linguistic Heritage & Gabvia */}
          {activeTab === "languages" && (
            <div className="space-y-6">
              <div
                className={`p-6 rounded-2xl border ${
                  isDark ? "border-emerald-500/30 bg-emerald-950/10" : "border-emerald-200 bg-emerald-50/50"
                }`}
              >
                <h3 className="text-base font-bold mb-2">Zambia: Over 70 Languages, One United Voice</h3>
                <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  Zambia is celebrated across Africa as a peaceful beacon of linguistic diversity. While English serves as the official administrative language, seven major regional languages are officially recognized and taught: Bemba, Nyanja, Tonga, Lozi, Kaonde, Luvale, and Lunda.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-4 rounded-xl border ${isDark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white"}`}>
                  <span className="font-mono text-xs font-bold text-emerald-400">BEMBA (ICIBEMBA)</span>
                  <span className="text-[11px] text-zinc-500 block">Copperbelt, Northern, Luapula, Muchinga</span>
                  <p className="text-xs text-zinc-400 mt-2">
                    The most widely spoken indigenous language in Zambia, ubiquitous in music, commerce, and everyday conversation across Lusaka and the Copperbelt.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white"}`}>
                  <span className="font-mono text-xs font-bold text-orange-400">NYANJA / CHEWA (CINYANJA)</span>
                  <span className="text-[11px] text-zinc-500 block">Lusaka, Eastern Province, Malawi Border</span>
                  <p className="text-xs text-zinc-400 mt-2">
                    A major lingua franca in the capital Lusaka and Eastern Province, widely spoken across media, markets, and regional transport.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white"}`}>
                  <span className="font-mono text-xs font-bold text-sky-400">TONGA (CHITONGA)</span>
                  <span className="text-[11px] text-zinc-500 block">Southern Province, Livingstone, Victoria Falls</span>
                  <p className="text-xs text-zinc-400 mt-2">
                    The voice of the Southern plains and Victoria Falls corridor, rich in agricultural proverbs, royal oral traditions, and poetry.
                  </p>
                </div>

                <div className={`p-4 rounded-xl border ${isDark ? "border-zinc-800 bg-zinc-900/60" : "border-zinc-200 bg-white"}`}>
                  <span className="font-mono text-xs font-bold text-amber-400">LOZI, KAONDE, LUNDA &amp; LUVALE</span>
                  <span className="text-[11px] text-zinc-500 block">Western Province (Barotseland), North-Western</span>
                  <p className="text-xs text-zinc-400 mt-2">
                    Deep cultural roots along the upper Zambezi floodplains (famous for the Kuomboka ceremony) and rich mineral belts of Solwezi.
                  </p>
                </div>
              </div>

              <div
                className={`p-5 rounded-2xl border ${
                  isDark ? "border-zinc-800 bg-zinc-900/40" : "border-zinc-200 bg-zinc-50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>How Gabvia Bridges Zambia to the Global Diaspora</span>
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? "text-zinc-300" : "text-zinc-700"}`}>
                  Gabvia enables Zambians anywhere in the world to chat, call, and send voice notes seamlessly. Whether you speak Bemba, Nyanja, Tonga, or English, Gabvia translates your voice and text in real time across 40+ world languages with zero friction and end-to-end privacy.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className={`px-5 sm:px-8 py-4 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
            isDark ? "border-zinc-800 bg-zinc-950/80" : "border-zinc-100 bg-zinc-50"
          }`}
        >
          <span className="text-xs font-mono text-zinc-500">
            Commemorating 62 Years of Zambian Sovereignty (1964 — 2026)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#15803d] hover:bg-emerald-600 text-white shadow-md transition-all cursor-pointer"
          >
            Close Archive
          </button>
        </div>
      </div>
    </div>
  );
}
