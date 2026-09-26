"use client";

import React, { useEffect, useState } from "react";
import { MessageSquare, X, ArrowRight } from "lucide-react";
import { InAppMessageToast } from "@/lib/webNotifications";

interface NotificationToastProps {
  toast: InAppMessageToast | null;
  onOpenConversation: (conversationId: string) => void;
  onClose: () => void;
}

export function NotificationToast({
  toast,
  onOpenConversation,
  onClose,
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 250);
      }, 5500);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <aside
      aria-label="New message notification"
      className={`fixed top-4 right-4 z-50 transition-all duration-300 transform max-w-sm w-[calc(100vw-2rem)] sm:w-96 ${
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
      }`}
    >
      <div className="bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl p-3.5 shadow-2xl shadow-emerald-950/40 flex items-start gap-3 relative overflow-hidden group">
        {/* Subtle accent highlight bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-teal-500" />

        {/* Sender Avatar / Icon */}
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center font-bold text-emerald-400 text-sm shrink-0">
          {toast.senderName.charAt(0).toUpperCase() || <MessageSquare className="w-4 h-4" />}
        </div>

        {/* Message Content */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => {
            onOpenConversation(toast.conversationId);
            onClose();
          }}
        >
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <h4 className="font-bold text-white text-xs sm:text-sm truncate">
              {toast.senderName}
            </h4>
            <span className="text-[10px] text-slate-500 shrink-0 font-medium">
              Just now
            </span>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {toast.messageText}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold mt-1.5 hover:underline">
            <span>Open chat</span>
            <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsVisible(false);
            setTimeout(onClose, 250);
          }}
          className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Dismiss notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
