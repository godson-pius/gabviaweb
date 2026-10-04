"use client";

import React, { useEffect, useRef } from "react";

interface LesothoHistoryModalProps {
  open: boolean;
  onClose: () => void;
  isDark: boolean;
}

const TIMELINE = [
  {
    year: "c. 1822",
    title: "A nation is forged",
    text: "Amid the upheavals of the Lifaqane, Moshoeshoe I gathers scattered clans and begins building the Basotho nation. In 1824 he settles at the natural fortress of Thaba Bosiu.",
  },
  {
    year: "1843 – 1868",
    title: "Diplomacy and defence",
    text: "Moshoeshoe skilfully balances alliances with missionaries, neighbours and the British while defending his people against Boer expansion. In 1868 he appeals to Britain and Basutoland becomes a British protectorate.",
  },
  {
    year: "1880 – 1881",
    title: "The Gun War",
    text: "When the Cape Colony tries to disarm the Basotho, they resist and prevail. In 1884 Basutoland returns to direct British Crown rule, never being absorbed into South Africa.",
  },
  {
    year: "1950s – 1965",
    title: "The road to self-rule",
    text: "Political parties emerge and the Basutoland National Council pushes for reform. A new constitution in 1965 leads to the first general election and internal self-government.",
  },
  {
    year: "4 Oct 1966",
    title: "Independence",
    text: "Basutoland becomes the Kingdom of Lesotho. King Moshoeshoe II is head of state and Chief Leabua Jonathan is Prime Minister. The Union Jack is lowered and the new flag is raised.",
  },
  {
    year: "1993 – today",
    title: "Democracy and renewal",
    text: "After years of political turbulence, multiparty democracy returns in 1993. Lesotho remains a constitutional monarchy, with King Letsie III on the throne since 1996, and a people proud of their heritage and language.",
  },
];

const FACTS = [
  { label: "Capital", value: "Maseru" },
  { label: "Motto", value: "Khotso, Pula, Nala (Peace, Rain, Prosperity)" },
  { label: "Languages", value: "Sesotho, English" },
  { label: "Anthem", value: "Lesotho Fatše La Bo-ntata Rona" },
  { label: "Geography", value: "Entirely above 1,400 m, the \"Kingdom in the Sky\"" },
  { label: "Highest point", value: "Thabana Ntlenyana, 3,482 m" },
];

export function LesothoHistoryModal({ open, onClose, isDark }: LesothoHistoryModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }
    if (!open) document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="lesotho-history-title"
      onClose={onClose}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself) closes the modal
        if (e.target === dialogRef.current) onClose();
      }}
      className="m-auto w-[min(92vw,820px)] max-h-[88vh] p-0 rounded-3xl bg-transparent backdrop:bg-black/70 backdrop:backdrop-blur-sm open:animate-[lesothoPop_0.28s_ease-out]"
    >
      <style>{`@keyframes lesothoPop{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}`}</style>
      <div
        className={`flex flex-col max-h-[88vh] rounded-3xl border overflow-hidden shadow-2xl ${
          isDark ? "bg-[#070b1a] border-blue-900/60 text-slate-200" : "bg-white border-blue-200 text-slate-800"
        }`}
      >
        {/* Flag-coloured header */}
        <div className="relative shrink-0">
          <div className="flex h-1.5">
            <div className="flex-[3] bg-[#00209F]" />
            <div className="flex-[4] bg-white" />
            <div className="flex-[3] bg-[#009543]" />
          </div>
          <div className="px-6 sm:px-8 pt-6 pb-5 flex items-start justify-between gap-4">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-blue-500 font-bold">
                4 October 1966 · 60 Years Free
              </span>
              <h2
                id="lesotho-history-title"
                className={`text-2xl sm:text-3xl font-black tracking-tight mt-1 ${isDark ? "text-white" : "text-slate-950"}`}
              >
                The History of Lesotho
              </h2>
              <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                From Moshoeshoe I to the Kingdom in the Sky.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close history"
              className={`shrink-0 w-9 h-9 rounded-full border flex items-center justify-center text-lg leading-none transition-colors ${
                isDark
                  ? "border-blue-900 text-slate-300 hover:bg-blue-950"
                  : "border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-6 sm:px-8 pb-8 space-y-8">
          <p className={`text-sm sm:text-base leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Lesotho is a small mountain kingdom completely surrounded by South Africa, and one of only a few
            countries in the world to lie entirely at high altitude. Its story is one of resilience: a nation
            built by diplomacy, defended with courage, and independent since 1966.
          </p>

          <ol className={`relative border-l-2 ml-2 space-y-6 ${isDark ? "border-blue-900" : "border-blue-200"}`}>
            {TIMELINE.map((item) => (
              <li key={item.year} className="pl-6 relative">
                <span className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-gradient-to-br from-[#00209F] to-[#009543] ring-4 ring-[#070b1a]/0" />
                <span className="font-mono text-xs font-bold text-emerald-500">{item.year}</span>
                <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-950"}`}>{item.title}</h3>
                <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  {item.text}
                </p>
              </li>
            ))}
          </ol>

          <div>
            <h3 className={`font-mono text-xs uppercase tracking-widest font-bold mb-3 ${isDark ? "text-blue-400" : "text-blue-700"}`}>
              The flag &amp; the Mokorotlo
            </h3>
            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Blue stands for rain, white for peace and green for prosperity. The black Mokorotlo, the
              traditional conical Basotho hat, represents the Basotho people and their cultural identity.
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FACTS.map((f) => (
              <div
                key={f.label}
                className={`rounded-xl border p-3 ${isDark ? "border-blue-900/60 bg-blue-950/20" : "border-blue-100 bg-blue-50/50"}`}
              >
                <dt className="font-mono text-[10px] uppercase tracking-wider text-emerald-500 font-bold">{f.label}</dt>
                <dd className={`text-sm mt-0.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>{f.value}</dd>
              </div>
            ))}
          </dl>

          <p className={`text-center text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
            Khotso, Pula, Nala! 🇱🇸 Happy 60th Independence Day, Lesotho.
          </p>
        </div>
      </div>
    </dialog>
  );
}
