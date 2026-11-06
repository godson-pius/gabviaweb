"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { createUserWithEmailAndPassword, User } from "firebase/auth";
import { getOrGenerateKeyPair } from "@/lib/e2ee";
import { COUNTRY_CODES, CountryCode } from "@/lib/countryCodes";
import {
  LANGUAGES,
  POPULAR_LANGUAGES,
  getLanguageMetadata,
  EARLY_ADOPTER_LIMIT,
  EARLY_ADOPTER_PLAN,
  STANDARD_PLAN,
} from "@/lib/constants";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Lock,
  Mail,
  Phone,
  Search,
  Sparkles,
  ShieldCheck,
  User as UserIcon,
  AlertCircle,
  X,
} from "lucide-react";

type OnboardingStep = "input" | "otp" | "language";
type AuthMethod = "phone" | "email";

export default function SimplifiedOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/chat";
  const refCode = searchParams.get("ref") || "";

  const { user, signInWithOtp, loading: authLoading } = useAuth();

  const [step, setStep] = useState<OnboardingStep>("input");
  const [authMethod, setAuthMethod] = useState<AuthMethod>("phone");

  // Phone states
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]); // Default Nigeria
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  // Email states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP states (for Phone)
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Language states
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [languageSearch, setLanguageSearch] = useState("");

  // Status & loading
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // If already logged in, redirect to chat
  useEffect(() => {
    if (!authLoading && user && step !== "language") {
      router.replace(redirectUrl);
    }
  }, [user, authLoading, router, redirectUrl, step]);

  // Countdown timer for Phone OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const cleanPhoneDigits = phoneNumber.replace(/[^0-9]/g, "");
  const normalizedPhoneDigits = cleanPhoneDigits.startsWith("0") ? cleanPhoneDigits.slice(1) : cleanPhoneDigits;
  const fullPhoneNumber = `${selectedCountry.dialCode}${normalizedPhoneDigits}`;

  // Unique username generator helper
  const generateUniqueUsername = async (baseName: string) => {
    const clean =
      baseName
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 15) || "user";
    const profilesRef = collection(db, "profiles");

    let candidate = clean;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      const testName = attempts === 0 ? candidate : `${clean}_${Math.floor(1000 + Math.random() * 9000)}`;
      const [lowerSnap, exactSnap] = await Promise.all([
        getDocs(query(profilesRef, where("username_lower", "==", testName), limit(1))),
        getDocs(query(profilesRef, where("username", "==", testName), limit(1))),
      ]);
      if (lowerSnap.empty && exactSnap.empty) {
        candidate = testName;
        isUnique = true;
      } else {
        attempts++;
      }
    }
    return isUnique ? candidate : `${clean}_${Date.now().toString().slice(-4)}`;
  };

  // Step 1: Send Phone OTP via SMS
  const handleSendPhoneOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    if (!cleanPhoneDigits || cleanPhoneDigits.length < 7) {
      setErrorMessage("Please enter a valid phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: fullPhoneNumber }),
      });

      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to dispatch verification code via SMS.");
      }

      setStep("otp");
      setCountdown(60);
      setCanResend(false);
      setOtpCode(["", "", "", "", "", ""]);
      setInfoMessage(`We sent a 6-digit verification code to ${fullPhoneNumber}`);

      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(errObj.message || "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Validate Email input and advance to Language selection
  const handleContinueWithEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setStep("language");
  };

  // Step 2: Handle individual OTP digit change
  const handleOtpChange = (value: string, index: number) => {
    setErrorMessage("");
    const cleanValue = value.replace(/\D/g, "");

    // Handle full paste
    if (cleanValue.length >= 6) {
      const digits = cleanValue.slice(0, 6).split("");
      setOtpCode(digits);
      otpInputRefs.current[5]?.focus();
      handleVerifyOtp(digits.join(""));
      return;
    }

    const updated = [...otpCode];
    updated[index] = cleanValue.slice(-1);
    setOtpCode(updated);

    if (cleanValue && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits entered
    if (cleanValue && index === 5 && updated.every((d) => d !== "")) {
      handleVerifyOtp(updated.join(""));
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Step 2: Verify Phone OTP
  const handleVerifyOtp = async (codeToVerify?: string) => {
    setErrorMessage("");
    const code = (codeToVerify || otpCode.join("")).trim();

    if (code.length < 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone: fullPhoneNumber, code }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        custom_token?: string;
        user_id?: string;
        is_new_user?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok || !data.custom_token) {
        throw new Error(data.error || "Incorrect or expired verification code.");
      }

      // Authenticate Firebase with custom token
      await signInWithOtp(data.custom_token);

      // Check if user already has a profile in Firestore
      const uid = data.user_id || auth.currentUser?.uid;
      if (uid) {
        const snap = await getDoc(doc(db, "profiles", uid));
        if (snap.exists() && !data.is_new_user) {
          // Returning user: Onboarding completed!
          if (typeof window !== "undefined") {
            localStorage.setItem("hasSeenOnboarding", "true");
          }
          router.replace(redirectUrl);
          return;
        }
      }

      // New user: proceed to Language selection
      setStep("language");
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(errObj.message || "Failed to verify code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Complete Registration (Phone or Email)
  const handleCompleteRegistration = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      let currentUser = auth.currentUser || authenticatedUser;

      // If Email method and user not created yet, create in Firebase Auth
      if (authMethod === "email" && !currentUser) {
        const trimmedEmail = email.trim().toLowerCase();
        try {
          const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
          currentUser = cred.user;
          setAuthenticatedUser(currentUser);
        } catch (emailErr: any) {
          if (emailErr?.code === "auth/email-already-in-use") {
            throw new Error("This email is already registered. Please sign in instead.");
          } else if (emailErr?.code === "auth/weak-password") {
            throw new Error("Password is too weak. Please use a stronger password.");
          } else {
            throw new Error(emailErr?.message || "Failed to create account with email.");
          }
        }
      }

      if (!currentUser) {
        throw new Error("Authentication session expired. Please start registration again.");
      }

      const profilesRef = collection(db, "profiles");

      // Check early adopter position
      let signupPosition = 1;
      try {
        const countSnap = await getCountFromServer(profilesRef);
        signupPosition = countSnap.data().count + 1;
      } catch {
        // Fallback default
      }
      const isEarlyAdopter = signupPosition <= EARLY_ADOPTER_LIMIT;

      // Generate username
      let initialUsername = "";
      if (authMethod === "phone") {
        const phoneDigits = cleanPhoneDigits.slice(-4) || `${Math.floor(1000 + Math.random() * 9000)}`;
        initialUsername = `user_${phoneDigits}`;
      } else {
        const base = fullName.trim() || email.split("@")[0];
        initialUsername = await generateUniqueUsername(base);
      }

      // Generate E2EE encryption keypair
      let initialPublicKey = "";
      try {
        const kp = await getOrGenerateKeyPair(currentUser.uid);
        initialPublicKey = kp.publicKeyBase64;
      } catch (keyErr) {
        console.warn("Could not generate keypair during registration:", keyErr);
      }

      // Check for referral credit if provided
      let referredBy: string | null = null;
      if (refCode.trim()) {
        try {
          const cleanRef = refCode.trim().toLowerCase().replace(/^@/, "");
          const [refLowerSnap, refExactSnap] = await Promise.all([
            getDocs(query(profilesRef, where("username_lower", "==", cleanRef), limit(1))),
            getDocs(query(profilesRef, where("username", "==", refCode.trim()), limit(1))),
          ]);
          const refDoc = !refLowerSnap.empty ? refLowerSnap.docs[0] : (!refExactSnap.empty ? refExactSnap.docs[0] : null);
          if (refDoc) {
            referredBy = refDoc.id;
          }
        } catch {
          // Non-critical referral lookup
        }
      }

      // Write complete user profile to Firestore
      await setDoc(
        doc(db, "profiles", currentUser.uid),
        {
          id: currentUser.uid,
          phone_number: authMethod === "phone" ? fullPhoneNumber : "",
          email: currentUser.email || (authMethod === "email" ? email.trim().toLowerCase() : ""),
          full_name: fullName.trim() || "",
          username: initialUsername,
          username_lower: initialUsername.toLowerCase(),
          native_language: selectedLanguage,
          native_language_updated_at: new Date().toISOString(),
          gab_points: 500,
          bonus_plan: isEarlyAdopter ? EARLY_ADOPTER_PLAN : STANDARD_PLAN,
          bonus_claims: isEarlyAdopter ? { signup_bonus: true } : {},
          signup_position: signupPosition,
          needs_username_setup: authMethod === "phone",
          show_start_chat_guide_modal: true,
          referred_by: referredBy,
          public_key: initialPublicKey || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { merge: true }
      );

      // Trigger onboarding email notification asynchronously if email exists
      if (currentUser.email || (authMethod === "email" && email)) {
        fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: currentUser.email || email.trim().toLowerCase(),
            full_name: fullName.trim(),
            user_id: currentUser.uid,
          }),
        }).catch(() => {});
      }

      // Mark onboarding as complete in browser local storage
      if (typeof window !== "undefined") {
        localStorage.setItem("hasSeenOnboarding", "true");
      }

      router.replace(redirectUrl);
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setErrorMessage(errObj.message || "Failed to finalize registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = useMemo(() => {
    const q = countrySearch.trim().toLowerCase();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [countrySearch]);

  const filteredLanguages = useMemo(() => {
    const q = languageSearch.trim().toLowerCase();
    if (!q) return LANGUAGES;
    return LANGUAGES.filter((l) => l.label.toLowerCase().includes(q) || l.value.toLowerCase().includes(q));
  }, [languageSearch]);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between selection:bg-sky-500/30 selection:text-sky-200 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-sky-500/10 via-blue-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="p-6 max-w-6xl mx-auto w-full flex items-center justify-between relative z-10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-slate-700/50 bg-slate-900 group-hover:scale-105 transition-transform flex items-center justify-center">
            <Image src="/logo.png" alt="Gabvia" width={32} height={32} className="object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-400 transition-colors">
            Gabvia
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 hidden sm:inline">Already have an account?</span>
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-sky-400 hover:text-sky-300 transition-colors bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 px-4 py-2 rounded-full backdrop-blur-md"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Card Section */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4 relative z-10">
        <div className="w-full max-w-xl">
          {/* Main Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative">
            {/* Step Navigation & Indicators */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
              {step !== "input" ? (
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage("");
                    if (step === "otp") setStep("input");
                    if (step === "language") {
                      if (authMethod === "phone") setStep("otp");
                      else setStep("input");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60"
                  disabled={loading}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : (
                <div className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-sky-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simplified Onboarding</span>
                </div>
              )}

              {/* Step Dots */}
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === "input" ? "w-6 bg-sky-500" : "w-2 bg-slate-700"
                  }`}
                />
                {authMethod === "phone" && (
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      step === "otp" ? "w-6 bg-sky-500" : step === "language" ? "w-2 bg-slate-600" : "w-2 bg-slate-700"
                    }`}
                  />
                )}
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    step === "language" ? "w-6 bg-sky-500" : "w-2 bg-slate-700"
                  }`}
                />
              </div>

              <span className="text-xs font-mono text-slate-500">
                {step === "input" ? "1 / 3" : step === "otp" ? "2 / 3" : "3 / 3"}
              </span>
            </div>

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage("")}
                  className="text-rose-400 hover:text-rose-200"
                  aria-label="Dismiss error"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Info Notification */}
            {infoMessage && (
              <div className="mb-6 p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-sky-400 flex-shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 1: INPUT (PHONE OR EMAIL)                                            */}
            {/* ========================================================================= */}
            {step === "input" && (
              <div>
                <div className="text-center mb-6">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                    Create Your Gabvia Account
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    Real-time AI translation across 40+ languages. Fast, private, and zero downloads required.
                  </p>
                </div>

                {/* Auth Method Switcher Tabs */}
                <div className="grid grid-cols-2 p-1 bg-slate-950/70 rounded-2xl border border-slate-800 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod("phone");
                      setErrorMessage("");
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      authMethod === "phone"
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Phone Number</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMethod("email");
                      setErrorMessage("");
                    }}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      authMethod === "email"
                        ? "bg-sky-500 text-white shadow-md shadow-sky-500/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Email Address</span>
                  </button>
                </div>

                {/* 1A. PHONE METHOD */}
                {authMethod === "phone" && (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <div className="flex items-center rounded-2xl border border-slate-700/80 bg-slate-950/60 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 transition-all overflow-hidden">
                        {/* Country Picker Trigger */}
                        <button
                          type="button"
                          onClick={() => setCountryPickerOpen(true)}
                          className="flex items-center gap-1.5 px-3.5 py-3 border-r border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-xs font-semibold text-white transition-colors"
                        >
                          <span className="text-base">{selectedCountry.flag}</span>
                          <span className="font-mono text-slate-200">{selectedCountry.dialCode}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                        </button>

                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="801 234 5678"
                          className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                          autoFocus
                          required
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-2">
                        We will send a 6-digit SMS verification code to verify your phone number.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !cleanPhoneDigits}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Code via SMS…</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification Code</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* 1B. EMAIL METHOD */}
                {authMethod === "email" && (
                  <form onSubmit={handleContinueWithEmail} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Jean Paul"
                          className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/60 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all"
                          autoFocus
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/60 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 chars"
                            className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/60 pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/60 pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !fullName || !email || !password || !confirmPassword}
                      className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
                    >
                      <span>Continue to Language Selection</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 2: PHONE OTP VERIFICATION                                            */}
            {/* ========================================================================= */}
            {step === "otp" && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mx-auto mb-3">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                    Enter Verification Code
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                    We sent a 6-digit SMS verification code to{" "}
                    <span className="font-mono text-sky-400 font-semibold">{fullPhoneNumber}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("input");
                      setErrorMessage("");
                    }}
                    className="mt-2 text-xs text-slate-400 hover:text-sky-400 underline underline-offset-4"
                  >
                    Change phone number
                  </button>
                </div>

                {/* 6 Digit Input Boxes */}
                <div className="flex justify-center items-center gap-2 sm:gap-3 my-6">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="w-11 h-14 sm:w-13 sm:h-16 text-center text-xl sm:text-2xl font-mono font-bold rounded-2xl border border-slate-700 bg-slate-950 text-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all"
                    />
                  ))}
                </div>

                {/* Resend Timer */}
                <div className="text-center mb-6 text-xs font-mono">
                  {countdown > 0 ? (
                    <span className="text-slate-500">
                      Resend code in <strong className="text-slate-300">{countdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendPhoneOtp()}
                      disabled={loading}
                      className="text-sky-400 hover:text-sky-300 font-semibold hover:underline"
                    >
                      Resend Verification Code via SMS
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={loading || otpCode.some((d) => !d)}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white shadow-lg shadow-sky-500/25 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Code…</span>
                    </>
                  ) : (
                    <>
                      <span>Verify &amp; Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ========================================================================= */}
            {/* STEP 3: NATIVE LANGUAGE SELECTION                                         */}
            {/* ========================================================================= */}
            {step === "language" && (
              <div>
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
                    Choose Your Native Language
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto">
                    Gabvia will automatically translate incoming messages and audio notes into this language.
                  </p>
                </div>

                {/* Popular Language Quick Chips */}
                <div className="mb-4">
                  <span className="block text-xs font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider">
                    Popular Languages
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_LANGUAGES.slice(0, 8).map((lang) => {
                      const meta = getLanguageMetadata(lang);
                      const isSelected = selectedLanguage === lang;
                      return (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setSelectedLanguage(lang)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                            isSelected
                              ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20"
                              : "bg-slate-950/70 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                          }`}
                        >
                          <span>{meta.flag}</span>
                          <span>{lang}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 ml-0.5" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language Search */}
                <div className="relative mb-3">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={languageSearch}
                    onChange={(e) => setLanguageSearch(e.target.value)}
                    placeholder="Search 40+ world & African languages…"
                    className="w-full rounded-2xl border border-slate-700/80 bg-slate-950/60 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none transition-all"
                  />
                </div>

                {/* Scrollable Language List */}
                <div className="max-h-52 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/70 p-2 space-y-1 divide-y divide-slate-800/40">
                  {filteredLanguages.map((l) => {
                    const isSelected = selectedLanguage === l.value;
                    const meta = getLanguageMetadata(l.value);
                    return (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() => setSelectedLanguage(l.value)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs sm:text-sm transition-all ${
                          isSelected
                            ? "bg-sky-500/20 text-sky-200 border border-sky-500/40 font-semibold"
                            : "text-slate-300 hover:bg-slate-900 hover:text-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{meta.flag}</span>
                          <span>{l.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>

                {/* Selected Summary Pill */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{getLanguageMetadata(selectedLanguage).flag}</span>
                    <div>
                      <span className="block text-xs font-semibold text-white">{selectedLanguage}</span>
                      <span className="block text-[10px] text-slate-400">Native Translation Target</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    SELECTED
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteRegistration}
                  disabled={loading}
                  className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.99] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Setting up your private account…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Complete &amp; Start Chatting</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Privacy & Terms Note */}
          <p className="mt-6 text-center text-xs text-slate-500">
            By creating an account, you agree to Gabvia&apos;s{" "}
            <Link href="/terms" className="text-slate-400 hover:text-sky-400 underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-slate-400 hover:text-sky-400 underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </main>

      {/* Country Picker Modal */}
      {countryPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-400" />
                <span>Select Your Country</span>
              </h2>
              <button
                type="button"
                onClick={() => setCountryPickerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search country or dial code (e.g. +234, Nigeria)..."
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div className="max-h-72 overflow-y-auto space-y-1 divide-y divide-slate-800/40 pr-1">
              {filteredCountries.map((c) => (
                <button
                  key={`${c.code}-${c.dialCode}`}
                  type="button"
                  onClick={() => {
                    setSelectedCountry(c);
                    setCountryPickerOpen(false);
                    setCountrySearch("");
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-xs sm:text-sm transition-colors ${
                    selectedCountry.dialCode === c.dialCode && selectedCountry.code === c.code
                      ? "bg-sky-500/20 text-sky-300 font-semibold border border-sky-500/40"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.flag}</span>
                    <span>{c.name}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-xs">{c.dialCode}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Minimal Footer */}
      <footer className="p-4 text-center text-xs font-mono text-slate-500">
        © {new Date().getFullYear()} Gabvia Technologies Inc. · End-to-End Encrypted Multilingual Communication
      </footer>
    </div>
  );
}

