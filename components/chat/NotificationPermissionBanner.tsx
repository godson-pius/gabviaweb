"use client";

import React, { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import {
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
  playMessageSound,
  showWebNotification,
} from "@/lib/webNotifications";

export function NotificationPermissionBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isNotificationSupported()) return;

    // Check if dismissed in this session
    const dismissed = sessionStorage.getItem("gabvia_notif_banner_dismissed");
    if (dismissed) return;

    const perm = getNotificationPermission();
    if (perm === "default") {
      // Delay showing banner slightly so initial chat interface settles
      const t = setTimeout(() => setShowBanner(true), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  const handleEnable = async () => {
    setIsRequesting(true);
    try {
      const res = await requestNotificationPermission();
      if (res === "granted") {
        setShowBanner(false);
        playMessageSound();
        showWebNotification({
          title: "Notifications Enabled! 🔔",
          body: "You will now receive alerts whenever you receive new messages on Gabvia.",
          tag: "welcome-notif",
        });
      } else {
        setShowBanner(false);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("gabvia_notif_banner_dismissed", "true");
    }
  };

  if (!showBanner) return null;

  return (
    <div className="mx-3 mt-3 p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
          <Bell className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-white truncate">
            Enable Message Notifications
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            Get instant alerts when you receive new messages
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleEnable}
          disabled={isRequesting}
          className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isRequesting ? "Enabling..." : "Enable"}
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
