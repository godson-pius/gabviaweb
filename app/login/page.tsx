"use client";

import { useAuth } from "@/context/AuthContext";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useRef, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signInWithOtp, loading: authLoading } = useAuth();

  const [step, setStep] = useState<"identifier" | "code">("identifier");
  const [identifier, setIdentifier] = useState("");
  const [resolvedEmail, setResolvedEmail] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [countdown, setCountdown] = useState(0);

  const otpInputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const redirectUrl = searchParams.get("redirect") || "/chat";

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(redirectUrl);
    }
  }, [user, authLoading, router, redirectUrl]);

  // Resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Step 1: Send OTP to Email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanInput = identifier.trim();
    if (!cleanInput) {
      setErrorMessage("Please enter your email or username.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", identifier: cleanInput }),
      });

      const data = (await res.json()) as { ok?: boolean; email?: string; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send login code. Please verify your email.");
      }

      setResolvedEmail(data.email || cleanInput);
      setStep("code");
      setCountdown(45);
      setOtpCode(["", "", "", "", "", ""]);

      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 150);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(errObj.message || "Failed to send code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Handle OTP input changes
  const handleOtpChange = (value: string, index: number) => {
    setErrorMessage("");
    // Handle paste
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const updated = [...otpCode];
      digits.forEach((d, i) => {
        if (i < 6) updated[i] = d;
      });
      setOtpCode(updated);
      if (digits.length === 6) {
        handleVerifyOtp(updated.join(""));
      } else {
        const next = Math.min(digits.length, 5);
        otpInputsRef.current[next]?.focus();
      }
      return;
    }

    const digit = value.replace(/\D/g, "");
    const updated = [...otpCode];
    updated[index] = digit;
    setOtpCode(updated);

    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    if (digit && index === 5) {
      const full = updated.join("");
      if (full.length === 6) {
        handleVerifyOtp(full);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const finalCode = (codeToVerify || otpCode.join("")).trim();
    setErrorMessage("");

    if (finalCode.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email: resolvedEmail, code: finalCode }),
      });

      const data = (await res.json()) as { ok?: boolean; custom_token?: string; error?: string };

      if (!res.ok || !data.ok || !data.custom_token) {
        throw new Error(data.error || "Invalid or expired login code. Please try again.");
      }

      await signInWithOtp(data.custom_token);
      router.replace(redirectUrl);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(errObj.message || "Failed to sign in. Please verify your code.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0 || isSubmitting) return;
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email: resolvedEmail }),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to resend login code.");
      }

      setCountdown(45);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(errObj.message || "Could not resend code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col justify-between selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Header */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-slate-700/50 bg-slate-900 group-hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Gabvia Logo" width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-400 transition-colors">
            Gabvia
          </span>
        </Link>
        <Link
          href="/register"
          className="text-xs sm:text-sm font-medium text-slate-400 hover:text-sky-400 transition-colors bg-slate-800/60 border border-slate-700/50 px-4 py-2 rounded-full backdrop-blur-md"
        >
          Create an account
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800/80 p-8 shadow-2xl backdrop-blur-xl">
            {/* Glow accent */}
            <div className="absolute -top-24 -left-20 w-52 h-52 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-20 w-52 h-52 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Step 1: Identifier */}
            {step === "identifier" && (
              <>
                <div className="relative text-center mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Welcome back
                  </h1>
                  <p className="text-sm text-slate-400 mt-2">
                    Enter your email or username to receive a secure login code.
                  </p>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSendCode} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Email or Username
                    </label>
                    <div className="relative rounded-2xl bg-slate-950/70 border border-slate-800 focus-within:border-sky-500/60 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="name@example.com or @username"
                        className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm text-white placeholder-slate-500 rounded-2xl focus:outline-none"
                        autoComplete="username"
                        autoCapitalize="none"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !identifier.trim()}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending code...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Login Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}

            {/* Step 2: Code Verification */}
            {step === "code" && (
              <>
                <div className="relative text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Check your email
                  </h1>
                  <p className="text-sm text-slate-400 mt-2">
                    We sent a 6-digit login code to
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-200">
                    <span className="font-semibold truncate max-w-[200px]">{resolvedEmail}</span>
                    <button
                      type="button"
                      onClick={() => setStep("identifier")}
                      className="text-sky-400 hover:text-sky-300 font-bold ml-1 cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{errorMessage}</span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* 6-digit boxes */}
                  <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                    {otpCode.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputsRef.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(e.target.value, idx)}
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        className="w-full aspect-square text-center text-xl font-bold bg-slate-950/80 border border-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 rounded-xl text-white outline-none transition-all"
                        autoFocus={idx === 0}
                      />
                    ))}
                  </div>

                  {/* Resend button */}
                  <div className="text-center">
                    {countdown > 0 ? (
                      <p className="text-xs text-slate-400">
                        Resend code in{" "}
                        <span className="font-semibold text-sky-400">{countdown}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Resend Verification Code</span>
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={isSubmitting || otpCode.join("").length < 6}
                    className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:scale-[0.99] text-white font-bold text-sm tracking-wide shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying code...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("identifier")}
                    className="w-full flex items-center justify-center gap-2 text-xs text-slate-400 hover:text-slate-300 transition-colors py-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to sign in</span>
                  </button>
                </div>
              </>
            )}

            {/* Bottom info */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Gabvia. Different languages. One conversation.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0b111e] flex items-center justify-center text-sky-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
