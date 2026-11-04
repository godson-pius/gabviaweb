"use client";

import React, { useState, useEffect } from "react";
import { ListFilter } from "lucide-react";

interface TocProps {
  items: { id: string; label: string }[];
}

export function TableOfContents({ items }: TocProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id || "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "0px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <nav className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 backdrop-blur-sm sticky top-28">
      <div className="flex items-center gap-2 mb-3 text-xs font-mono text-zinc-400 uppercase tracking-wider">
        <ListFilter className="w-3.5 h-3.5 text-sky-400" />
        <span>Table of Contents</span>
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`text-left w-full transition-colors text-xs leading-snug py-1 block ${
                  isActive
                    ? "text-sky-400 font-semibold pl-2 border-l-2 border-sky-400"
                    : "text-zinc-400 hover:text-zinc-200 pl-2 border-l-2 border-transparent"
                }`}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

