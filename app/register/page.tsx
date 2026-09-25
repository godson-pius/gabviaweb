"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { LANGUAGES } from "@/lib/constants";
import { validateUsername, validatePassword } from "@/lib/security";
import {
  Lock,
  Mail,
  User,
  AtSign,
  Globe,
  Tag,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { user, signUp, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [language, setLanguage] = useState("English");
  const [referralCode, setReferralCode] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/chat");
    }
  }, [user, authLoading, router]);

  // Auto-generate username from full name if username is empty
  const handleFullNameChange = (val: string) => {
    setFullName(val);
    if (!username || username === fullName.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20)) {
      const generated = val.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 20);
      setUsername(generated);
    }
  };

  // Password rules validation
  const pwdLengthValid = password.length >= 8;
  const pwdUpperValid = /[A-Z]/.test(password);
  const pwdLowerValid = /[a-z]/.test(password);
  const pwdDigitValid = /[0-9]/.test(password);
  const pwdMatches = password && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedName = fullName.trim();
    const trimmedUsername = username.trim().toLowerCase().replace(/^@/, "");
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const usernameVal = validateUsername(trimmedUsername);
    if (!usernameVal.valid) {
      setErrorMessage(usernameVal.error || "Invalid username.");
      return;
    }

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const passwordVal = validatePassword(password);
    if (!passwordVal.valid) {
      setErrorMessage(passwordVal.error || "Password does not meet security requirements.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({
        fullName: trimmedName,
        username: trimmedUsername,
        email: trimmedEmail,
        password,
        language,
        referralCode: referralCode.trim() || undefined,
      });

      router.replace("/chat");
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(errObj.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b111e] text-slate-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Header */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-slate-700/50 bg-slate-900 group-hover:scale-105 transition-transform">
            <Image src="/logo.png" alt="Gabvia Logo" width={40} height={40} className="w-full h-full object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            Gabvia
          </span>
        </Link>
        <Link
          href="/login"
          className="text-xs sm:text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors bg-slate-800/60 border border-slate-700/50 px-4 py-2 rounded-full backdrop-blur-md"
        >
          Sign In
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-lg">
          {/* Card */}
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800/80 p-8 shadow-2xl backdrop-blur-xl">
            {/* Glow accent */}
            <div className="absolute -top-24 -right-20 w-52 h-52 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-20 w-52 h-52 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Title section */}
            <div className="relative text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
                <ShieldCheck className="w-3.5 h-3.5" /> 500 GAB POINTS BONUS
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Join Gabvia on web and chat across languages with zero friction.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <div className="relative rounded-2xl bg-slate-950/70 border border-slate-800 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => handleFullNameChange(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-transparent pl-10 pr-3 py-3 text-sm text-white placeholder-slate-500 rounded-2xl focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Username
                  </label>
                  <div className="relative rounded-2xl bg-slate-950/70 border border-slate-800 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <AtSign className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                      placeholder="janedoe"
                      className="w-full bg-transparent pl-10 pr-3 py-3 text-sm text-white placeholder-slate-500 rounded-2xl focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative rounded-2xl bg-slate-950/70 border border-slate-800 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 rounded-2xl focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Native Language */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Native Language
                </label>
                <div className="relative rounded-2xl bg-slate-950/70 border border-slate-800 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Globe className="w-4 h-4" />
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white rounded-2xl focus:outline-none appearance-none cursor-pointer"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.value} value={l.value} className="bg-slate-900 text-white">
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Incoming messages will automatically be understood in this language.
                </p>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative rounded-2xl bg-slate-950/70 border border-slate-800 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 rounded-2xl focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative rounded-2xl bg-slate-950/70 border border-slate-800 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-transparent pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 rounded-2xl focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength indicators */}
              <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className={`flex items-center gap-1.5 ${pwdLengthValid ? "text-emerald-400" : "text-slate-500"}`}>
                  <Check className="w-3.5 h-3.5" /> 8+ chars
                </div>
                <div className={`flex items-center gap-1.5 ${pwdUpperValid ? "text-emerald-400" : "text-slate-500"}`}>
                  <Check className="w-3.5 h-3.5" /> Uppercase
                </div>
                <div className={`flex items-center gap-1.5 ${pwdLowerValid ? "text-emerald-400" : "text-slate-500"}`}>
                  <Check className="w-3.5 h-3.5" /> Lowercase
                </div>
                <div className={`flex items-center gap-1.5 ${pwdDigitValid ? "text-emerald-400" : "text-slate-500"}`}>
                  <Check className="w-3.5 h-3.5" /> Number
                </div>
                <div className={`flex items-center gap-1.5 col-span-2 sm:col-span-2 ${pwdMatches ? "text-emerald-400" : "text-slate-500"}`}>
                  <Check className="w-3.5 h-3.5" /> Passwords match
                </div>
              </div>

              {/* Optional Referral Code */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Referral Code (Optional)
                </label>
                <div className="relative rounded-2xl bg-slate-950/70 border border-slate-800 focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Friend's username"
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 rounded-2xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating E2EE keys & setting up...</span>
                  </>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
              <p className="text-xs sm:text-sm text-slate-400">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-500">
        By registering, you agree to Gabvia&apos;s{" "}
        <Link href="/terms" className="text-slate-400 underline hover:text-white">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-slate-400 underline hover:text-white">
          Privacy Policy
        </Link>
        .
      </footer>
    </div>
  );
}
