"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    BrevoConversationsID?: string;
    BrevoConversations?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

function isExcludedRoute(pathname: string | null): boolean {
  if (!pathname) return true;
  return (
    pathname === "/chat" ||
    pathname.startsWith("/chat/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

/**
 * Loads and displays the Brevo Conversations widget only on public website routes,
 * keeping it hidden and unloaded on `/chat` and `/admin` routes.
 */
export function BrevoChat() {
  const pathname = usePathname();
  const excluded = isExcludedRoute(pathname);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.BrevoConversations !== "function") {
      return;
    }
    window.BrevoConversations(excluded ? "hide" : "show");
  }, [excluded]);

  if (excluded) {
    return null;
  }

  return (
    <Script
      id="brevo-conversations"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(d, w, c) {
            w.BrevoConversationsID = '6ace4f9e409bb929bd07422b';
            w[c] = w[c] || function() {
              (w[c].q = w[c].q || []).push(arguments);
            };
            var s = d.createElement('script');
            s.async = true;
            s.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
            if (d.head) d.head.appendChild(s);
          })(document, window, 'BrevoConversations');
        `,
      }}
    />
  );
}
