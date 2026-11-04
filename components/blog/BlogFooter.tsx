import React from "react";
import Link from "next/link";
import Image from "next/image";
import { PLAY_STORE_URL } from "@/components/landing/shared";

interface BlogFooterProps {
  isDark?: boolean;
}

export function BlogFooter({ isDark = true }: BlogFooterProps) {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950 py-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-12 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Gabvia" width={30} height={30} className="object-contain" />
            <div>
              <span className="font-bold text-lg tracking-tight text-white">Gabvia</span>
              <span className="font-mono text-xs ml-2 text-zinc-400">
                / Different languages. One conversation.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/blog" className="text-sky-400 font-semibold hover:text-sky-300 transition-colors">
              Blog &amp; News
            </Link>
            <Link href="/translator" className="hover:text-white transition-colors">
              Translator
            </Link>
            <Link href="/support" className="hover:text-white transition-colors">
              Support
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/chat" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
              Web Chat (Live)
            </Link>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Google Play
            </a>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>© {new Date().getFullYear()} Gabvia Technologies Inc. All rights reserved.</div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>GABVIA WEB &amp; BLOG · LIVE &amp; INDEXED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

