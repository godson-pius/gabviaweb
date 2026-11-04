"use client";

import React, { useState, useEffect } from "react";
import { Share2, Copy, Check, MessageCircle } from "lucide-react";

interface ArticleShareBarProps {
  title: string;
  slug: string;
}

export function ArticleShareBar({ title, slug }: ArticleShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100));
        setReadingProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getArticleUrl = () => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/blog/${slug}`;
    }
    return `https://gabvia.app/blog/${slug}`;
  };

  const handleCopy = () => {
    const url = getArticleUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleShareTwitter = () => {
    const url = getArticleUrl();
    const text = encodeURIComponent(`${title} — via @GabviaApp\n\n${url}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(getArticleUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "noopener,noreferrer");
  };

  const handleShareWhatsApp = () => {
    const url = getArticleUrl();
    const text = encodeURIComponent(`Check out this article on Gabvia: "${title}"\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-800/40 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-sky-500 via-blue-500 to-emerald-400 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Share Buttons Strip */}
      <div className="flex flex-wrap items-center gap-2 pt-4 pb-4 text-xs font-mono">
        <span className="text-zinc-400 mr-1 flex items-center gap-1.5 font-sans font-semibold">
          <Share2 className="w-3.5 h-3.5 text-sky-400" />
          Share:
        </span>

        <button
          onClick={handleCopy}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
          title="Copy link to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied Link!" : "Copy Link"}</span>
        </button>

        <button
          onClick={handleShareTwitter}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-sky-400 transition-colors"
          title="Share on X / Twitter"
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span>X / Post</span>
        </button>

        <button
          onClick={handleShareLinkedIn}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-blue-400 transition-colors"
          title="Share on LinkedIn"
        >
          <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
          </svg>
          <span>LinkedIn</span>
        </button>

        <button
          onClick={handleShareWhatsApp}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-emerald-400 transition-colors"
          title="Share on WhatsApp"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp</span>
        </button>
      </div>
    </>
  );
}
