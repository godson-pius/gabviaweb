/**
 * Security and sanitization utilities for Gabvia Web
 */

import { USERNAME_REGEX, MAX_MESSAGE_LENGTH } from "./constants";

/**
 * Strips HTML tags and dangerous characters to prevent Stored & Reflected XSS
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  return input
    .replace(/[<>]/g, "") // Strip raw tags
    .trim();
}

/**
 * Validates username strictly against format and reserved words
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  const normalized = username.trim().toLowerCase();
  if (normalized.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters long." };
  }
  if (normalized.length > 30) {
    return { valid: false, error: "Username cannot exceed 30 characters." };
  }
  if (!USERNAME_REGEX.test(normalized)) {
    return { valid: false, error: "Username can only contain letters, numbers, and underscores." };
  }

  // Reserved prefixes and names
  const reserved = [
    "admin", "root", "system", "gabvia", "support", "help", "moderator",
    "security", "staff", "official", "billing", "api", "auth"
  ];
  if (reserved.includes(normalized)) {
    return { valid: false, error: "This username is reserved. Please pick another." };
  }

  return { valid: true };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long." };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  if (!hasUpper || !hasLower || !hasDigit) {
    return {
      valid: false,
      error: "Password must contain at least one uppercase letter, one lowercase letter, and one number.",
    };
  }
  return { valid: true };
}

/**
 * Validates and sanitizes message content
 */
export function validateMessage(content: string): { valid: boolean; sanitized: string; error?: string } {
  const trimmed = content.trim();
  if (!trimmed) {
    return { valid: false, sanitized: "", error: "Message cannot be empty." };
  }
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      sanitized: "",
      error: `Message is too long (maximum ${MAX_MESSAGE_LENGTH} characters).`,
    };
  }
  return { valid: true, sanitized: trimmed };
}

/**
 * Client-side rate limiter / brute-force lockout guard
 */
const ATTEMPTS_KEY = "gabvia_login_attempts";
const LOCKOUT_MS = 60 * 1000; // 1 minute lockout
const MAX_ATTEMPTS = 5;

export function checkLoginAttempts(): { allowed: boolean; remainingSeconds: number } {
  if (typeof window === "undefined") return { allowed: true, remainingSeconds: 0 };
  try {
    const raw = window.sessionStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return { allowed: true, remainingSeconds: 0 };
    const { count, timestamp } = JSON.parse(raw);
    const elapsed = Date.now() - timestamp;
    if (elapsed > LOCKOUT_MS) {
      window.sessionStorage.removeItem(ATTEMPTS_KEY);
      return { allowed: true, remainingSeconds: 0 };
    }
    if (count >= MAX_ATTEMPTS) {
      const remainingSeconds = Math.ceil((LOCKOUT_MS - elapsed) / 1000);
      return { allowed: false, remainingSeconds };
    }
  } catch {
    // Ignore parse error
  }
  return { allowed: true, remainingSeconds: 0 };
}

export function recordFailedLoginAttempt(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(ATTEMPTS_KEY);
    let count = 1;
    let timestamp = Date.now();
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.timestamp < LOCKOUT_MS) {
        count = parsed.count + 1;
        timestamp = parsed.timestamp;
      }
    }
    window.sessionStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count, timestamp }));
  } catch {
    // Ignore
  }
}

export function clearLoginAttempts(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ATTEMPTS_KEY);
  } catch {}
}
