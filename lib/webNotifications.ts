"use client";

// Web Notification & Audio Chime Service for Gabvia Web

export type WebNotificationOptions = {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
};

export type InAppMessageToast = {
  id: string;
  conversationId: string;
  senderName: string;
  messageText: string;
  timestamp: number;
};

const SOUND_PREF_KEY = "gabvia_web_sound_enabled";
const NOTIF_PREF_KEY = "gabvia_web_notif_enabled";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isNotificationSupported()) return "unsupported";
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
    }
    return permission;
  } catch (err) {
    console.warn("[WebNotifications] Error requesting notification permission:", err);
    return Notification.permission;
  }
}

export function areNotificationsEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const val = localStorage.getItem(NOTIF_PREF_KEY);
  return val === null ? true : val === "true";
}

export function setNotificationsEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIF_PREF_KEY, String(enabled));
}

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const val = localStorage.getItem(SOUND_PREF_KEY);
  return val === null ? true : val === "true";
}

export function setSoundEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SOUND_PREF_KEY, String(enabled));
}

// ----------------------------------------------------
// Web Audio API Synthesizer (Instant, 0-network, reliable chime)
// ----------------------------------------------------
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;

    if (!audioContext) {
      audioContext = new AudioContextClass();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(() => {});
    }
    return audioContext;
  } catch {
    return null;
  }
}

// User-gesture unlocker for mobile Safari & Chrome autoplay restrictions
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    try {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
    } catch {}
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("touchstart", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  };
  window.addEventListener("click", unlockAudio, { once: true, passive: true });
  window.addEventListener("touchstart", unlockAudio, { once: true, passive: true });
  window.addEventListener("keydown", unlockAudio, { once: true, passive: true });
}

export function playMessageSound(): void {
  if (!isSoundEnabled()) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Harmonic two-tone chime (F#5: 739.99 Hz -> B5: 987.77 Hz)
    // Note 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(740, now);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.18, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.26);

    // Note 2 - Higher pitch slightly overlapping for a bright chime
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(988, now + 0.07);

    gain2.gain.setValueAtTime(0, now + 0.07);
    gain2.gain.linearRampToValueAtTime(0.22, now + 0.085);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc2.start(now + 0.07);
    osc2.stop(now + 0.46);
  } catch (err) {
    console.debug("[Audio] Notification sound skipped:", err);
  }
}

// ----------------------------------------------------
// System Browser Notification
// ----------------------------------------------------
export function showWebNotification({
  title,
  body,
  icon = "/logo.png",
  tag,
  onClick,
}: WebNotificationOptions): Notification | null {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== "granted") return null;
  if (!areNotificationsEnabled()) return null;

  try {
    const notification = new Notification(title, {
      body,
      icon,
      badge: icon,
      tag: tag || "gabvia-message",
      silent: true, // We trigger custom chime via Web Audio to prevent discordant browser double-beeps
    });

    if (onClick) {
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        onClick();
        notification.close();
      };
    }

    // Auto-close notification after 6s
    setTimeout(() => {
      try {
        notification.close();
      } catch {}
    }, 6000);

    return notification;
  } catch (err) {
    console.warn("[WebNotifications] Failed to display notification:", err);
    return null;
  }
}

// ----------------------------------------------------
// Tab Title Unread Counter
// ----------------------------------------------------
let baseDocumentTitle = "Gabvia - Multilingual Chat";

export function setBaseDocumentTitle(title: string): void {
  baseDocumentTitle = title;
}

export function updateTabUnreadCount(unreadCount: number): void {
  if (typeof document === "undefined") return;
  if (unreadCount > 0) {
    document.title = `(${unreadCount > 99 ? "99+" : unreadCount}) ${baseDocumentTitle}`;
  } else {
    document.title = baseDocumentTitle;
  }
}
