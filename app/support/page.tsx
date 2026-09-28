"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  Mail,
  Copy,
  Check,
  Sparkles,
  Loader2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

const SUGGESTED_SUBJECTS = [
  "Translation Quality",
  "Bug Report",
  "Feature Suggestion",
  "Language Request",
  "Account & Security",
  "General Inquiry",
];

const FAQS = [
  {
    q: "How does real-time translation work on Gabvia?",
    a: "Gabvia translates incoming and outgoing messages in real-time using advanced neural models, while preserving your original meaning, tone, and formatting. In private chats, decryption happens on your device before translating.",
  },
  {
    q: "How do I recover my chat history on a new device?",
    a: "Your chats are protected with end-to-end encryption. When setting up a new device, you can restore your chat keys using the secure PIN you configured during backup.",
  },
  {
    q: "How fast does Gabvia support respond?",
    a: "Our support engineers review all incoming queries within 24 hours (and often much faster during business hours). You will receive updates via the email associated with your query or account.",
  },
  {
    q: "Can I request a new language to be added?",
    a: "Yes! We frequently expand our language coverage, with over 100 languages supported worldwide and across Africa. Select 'Language Request' as your subject and tell us which language you need.",
  },
];

function SupportForm() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();

  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");
  const [email, setEmail] = useState("");
  const [websiteHoneypot, setWebsiteHoneypot] = useState(""); // Bot honeypot

  useEffect(() => {
    const topicParam = searchParams.get("topic") || searchParams.get("subject");
    if (topicParam) {
      setSubject(topicParam);
    }
  }, [searchParams]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [copiedTicket, setCopiedTicket] = useState(false);

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleCopyTicket = () => {
    if (!ticketId) return;
    navigator.clipboard.writeText(ticketId);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanSubject = subject.trim();
    const cleanQuery = query.trim();

    if (!cleanSubject || cleanSubject.length < 3) {
      setErrorMessage("Please enter a subject (at least 3 characters).");
      return;
    }

    if (!cleanQuery || cleanQuery.length < 10) {
      setErrorMessage("Please write your query or feedback (at least 10 characters).");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: cleanSubject,
          query: cleanQuery,
          email: email.trim() || user?.email || "",
          name: profile?.full_name || profile?.username || "",
          userId: user?.uid || "",
          username: profile?.username || "",
          website: websiteHoneypot, // Honeypot check
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Unable to send your query. Please try again.");
      }

      setTicketId(data.ticketId || "GAB-RECEIVED");
      setSubject("");
      setQuery("");
      setEmail("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTicketId(null);
    setSubject("");
    setQuery("");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Glow Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-1/3 -right-32 w-[400px] h-[400px] bg-indigo-500/10 blur-3xl rounded-full" />
        <div className="absolute bottom-10 -left-32 w-[400px] h-[400px] bg-cyan-600/10 blur-3xl rounded-full" />
      </div>

      {/* Top Navigation */}
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium pr-2"
              title="Return to Gabvia"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/logo.png"
                alt="Gabvia Logo"
                width={26}
                height={26}
                className="object-contain"
              />
              <span className="font-bold text-base tracking-tight text-white">Gabvia</span>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {user ? (
              <Link
                href="/chat"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-all"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Go to Web Chat</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-full border border-white/10 text-zinc-300 hover:text-white hover:border-white/20 transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-medium tracking-wide uppercase mb-4">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Support & Inquiries</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Send Us a Query or Feedback
          </h1>
          <p className="mt-3 text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Have a question, encountered an issue, or want to share feedback? Send us a message and our team will get right back to you.
          </p>
        </div>

        {/* Support Form Card */}
        <div className="relative rounded-2xl border border-white/10 bg-zinc-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
          {ticketId ? (
            /* SUCCESS CONFIRMATION STATE */
            <div className="py-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Query Received!</h2>
              <p className="text-sm text-zinc-300 max-w-md mx-auto leading-relaxed mb-6">
                Thank you for reaching out. We have logged your submission and our support team will review it.
              </p>

              {/* Reference ID Pill */}
              <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-800/80 border border-white/10 text-sm font-mono mb-8">
                <span className="text-zinc-400">Reference:</span>
                <span className="font-semibold text-cyan-300 select-all">{ticketId}</span>
                <button
                  type="button"
                  onClick={handleCopyTicket}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                  title="Copy reference ID"
                >
                  {copiedTicket ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-sm font-medium text-zinc-200 transition-all"
                >
                  Send Another Query
                </button>

                <Link
                  href="/chat"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition-all text-center"
                >
                  Go to Gabvia Web
                </Link>
              </div>
            </div>
          ) : (
            /* SIMPLE SUPPORT FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Spambot Honeypot */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  type="text"
                  value={websiteHoneypot}
                  onChange={(e) => setWebsiteHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {/* Error Message Alert */}
              {errorMessage && (
                <div
                  role="alert"
                  className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm animate-in fade-in duration-200"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Quick Topic Chips */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                  Common Topics
                </label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_SUBJECTS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setSubject(item)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        subject === item
                          ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300 font-medium shadow-sm"
                          : "border-white/10 bg-white/5 text-zinc-400 hover:text-white hover:border-white/20"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Input */}
              <div>
                <label
                  htmlFor="support-subject"
                  className="block text-sm font-semibold text-zinc-200 mb-2"
                >
                  Subject <span className="text-cyan-400">*</span>
                </label>
                <input
                  id="support-subject"
                  type="text"
                  required
                  placeholder="e.g. Translation question or feedback on voice notes"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  maxLength={150}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950/70 border border-white/10 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-500 text-sm outline-none transition-all"
                />
              </div>

              {/* Feedback or Query Textarea */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="support-query"
                    className="text-sm font-semibold text-zinc-200"
                  >
                    Feedback or Query <span className="text-cyan-400">*</span>
                  </label>
                  <span className="text-xs font-mono text-zinc-500">
                    {query.length} / 3000
                  </span>
                </div>
                <textarea
                  id="support-query"
                  required
                  rows={5}
                  placeholder="Describe your question, issue, or feedback in detail..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  maxLength={3000}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-950/70 border border-white/10 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-500 text-sm outline-none transition-all resize-y min-h-[130px]"
                />
              </div>

              {/* User Email Identification */}
              {user ? (
                <div className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/5 flex items-center justify-between text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>
                      Submitting as <strong className="text-zinc-200">{user.email}</strong>
                      {profile?.username ? ` (@${profile.username})` : ""}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-cyan-400/80">Logged In</span>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="support-email"
                    className="block text-sm font-semibold text-zinc-200 mb-2"
                  >
                    Email Address <span className="text-zinc-500 font-normal text-xs">(optional, for replies)</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="support-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-950/70 border border-white/10 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 text-white placeholder-zinc-500 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Query...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Query</span>
                    </>
                  )}
                </button>
              </div>

              {/* Trust Footer */}
              <div className="flex items-center justify-center gap-2 pt-1 text-xs text-zinc-500">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Your query is transmitted securely to the Gabvia support team.</span>
              </div>
            </form>
          )}
        </div>

        {/* Quick Contact & Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="p-5 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-zinc-200 font-semibold text-sm mb-1.5">
              <Mail className="w-4 h-4 text-cyan-400" />
              <span>Direct Email</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Prefer writing an email directly? Reach our operations and technical desk at:
            </p>
            <a
              href="mailto:officialgabvia@gmail.com"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:underline"
            >
              <span>officialgabvia@gmail.com</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-5 rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-md">
            <div className="flex items-center gap-2.5 text-zinc-200 font-semibold text-sm mb-1.5">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Languages Supported</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              Need translation in your language? Gabvia supports over 100 world and African languages natively.
            </p>
            <Link
              href="/translator"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:underline"
            >
              <span>Explore Translator Web</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Quick FAQ Section */}
        <section className="mt-14 pt-10 border-t border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={faq.q}
                  className="rounded-xl border border-white/5 bg-zinc-900/40 overflow-hidden transition-colors hover:border-white/10"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-4 text-left text-sm font-medium text-zinc-200 hover:text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 pt-1 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-white/5 animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 mt-12 bg-[#09090b]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>
            © {new Date().getFullYear()} Gabvia Technologies Inc. Different languages. One conversation.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-zinc-300 transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-zinc-300 transition-colors">
              Terms
            </Link>
            <Link href="/chat" className="hover:text-cyan-400 transition-colors">
              Chat
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center text-zinc-400">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
            <span>Loading Support Desk...</span>
          </div>
        </div>
      }
    >
      <SupportForm />
    </Suspense>
  );
}

