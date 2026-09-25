"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LANGUAGES,
  LANGUAGE_METADATA,
  POPULAR_LANGUAGES,
  getLanguageMetadata,
  MAX_MESSAGE_LENGTH,
} from "@/lib/constants";
import { translateText, transcribeAudio } from "@/lib/translation";
import {
  Globe,
  ArrowLeftRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Trash2,
  X,
  Search,
  Sparkles,
  Coins,
  MessageSquare,
  ArrowLeft,
  Share2,
  History,
  RotateCcw,
  Loader2,
  ChevronDown,
  Gift,
  ExternalLink,
} from "lucide-react";

interface TranslationHistoryItem {
  id: string;
  sourceText: string;
  translatedText: string;
  fromLang: string;
  toLang: string;
  timestamp: number;
}

export default function TranslatorPage() {
  const router = useRouter();
  const { user, profile, gabPoints, deductPoints } = useAuth();

  const [fromLang, setFromLang] = useState<string>("English");
  const [toLang, setToLang] = useState<string>("Kinyarwanda");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState("");

  // Recording & Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  // Audio Playback / TTS State
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [isPlayingSourceTTS, setIsPlayingSourceTTS] = useState(false);

  // UI / Modal States
  const [activePicker, setActivePicker] = useState<"from" | "to" | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");
  const [copiedTarget, setCopiedTarget] = useState(false);
  const [copiedSource, setCopiedSource] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(true);

  // History State
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Audio waveform animation
  const [audioLevel, setAudioLevel] = useState<number[]>([30, 60, 40, 80, 50, 70, 35]);

  // Anti-loop refs
  const lastTranslatedKeyRef = useRef<string>("");
  const isTranslatingRef = useRef(false);
  const userRef = useRef(user);
  const gabPointsRef = useRef(gabPoints);
  const deductPointsRef = useRef(deductPoints);

  useEffect(() => {
    userRef.current = user;
    gabPointsRef.current = gabPoints;
    deductPointsRef.current = deductPoints;
  }, [user, gabPoints, deductPoints]);

  // Set default source language to user's native language if available
  useEffect(() => {
    if (profile?.native_language && LANGUAGES.some((l) => l.value === profile.native_language)) {
      setFromLang(profile.native_language);
      if (profile.native_language === "Kinyarwanda") {
        setToLang("English");
      } else {
        setToLang("Kinyarwanda");
      }
    }
  }, [profile?.native_language]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gabvia_translator_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load translator history:", e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = useCallback((item: TranslationHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((h) => h.sourceText !== item.sourceText).slice(0, 24)];
      try {
        localStorage.setItem("gabvia_translator_history", JSON.stringify(updated));
      } catch (e) {
        console.warn("Failed to save history:", e);
      }
      return updated;
    });
  }, []);

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem("gabvia_translator_history");
    } catch (e) {}
  };

  // Perform translation
  const handleTranslate = useCallback(
    async (textToTranslate?: string, force = false) => {
      const text = (textToTranslate !== undefined ? textToTranslate : sourceText).trim();
      if (!text) {
        setTranslatedText("");
        lastTranslatedKeyRef.current = "";
        return;
      }

      if (fromLang === toLang) {
        setTranslatedText(text);
        lastTranslatedKeyRef.current = `${fromLang}->${toLang}:${text}`;
        return;
      }

      const key = `${fromLang}->${toLang}:${text}`;
      if (!force && lastTranslatedKeyRef.current === key) {
        // Already translated this exact text for these languages
        return;
      }

      if (isTranslatingRef.current) return;

      if (userRef.current && gabPointsRef.current < 1) {
        setTranslationError("You have 0 Gab Points remaining for translations.");
        return;
      }

      isTranslatingRef.current = true;
      setIsTranslating(true);
      setTranslationError("");

      try {
        const result = await translateText(text, toLang, {
          sourceLanguage: fromLang,
        });

        if (result) {
          lastTranslatedKeyRef.current = key;
          setTranslatedText(result);
          // Deduct point if user is logged in
          if (userRef.current && deductPointsRef.current) {
            await deductPointsRef.current(1);
          }

          // Save to history
          saveToHistory({
            id: Date.now().toString(),
            sourceText: text,
            translatedText: result,
            fromLang,
            toLang,
            timestamp: Date.now(),
          });
        } else {
          setTranslationError("Translation failed. Please try again.");
        }
      } catch (err: any) {
        console.error("Translation error:", err);
        setTranslationError(err?.message || "Translation failed. Check your network.");
      } finally {
        isTranslatingRef.current = false;
        setIsTranslating(false);
      }
    },
    [sourceText, fromLang, toLang, saveToHistory]
  );

  // Debounced auto-translate on source text change
  useEffect(() => {
    if (!autoTranslate) return;
    const trimmed = sourceText.trim();
    if (!trimmed) {
      setTranslatedText("");
      lastTranslatedKeyRef.current = "";
      return;
    }

    const key = `${fromLang}->${toLang}:${trimmed}`;
    if (lastTranslatedKeyRef.current === key) return;

    const timer = setTimeout(() => {
      handleTranslate(trimmed);
    }, 600);

    return () => clearTimeout(timer);
  }, [sourceText, fromLang, toLang, autoTranslate, handleTranslate]);

  // Swap Languages
  const handleSwap = () => {
    const prevFrom = fromLang;
    const prevTo = toLang;
    const prevSource = sourceText;
    const prevTarget = translatedText;

    setFromLang(prevTo);
    setToLang(prevFrom);
    setSourceText(prevTarget);
    setTranslatedText(prevSource);

    if (prevTarget.trim()) {
      lastTranslatedKeyRef.current = `${prevTo}->${prevFrom}:${prevTarget.trim()}`;
    }
  };

  // Text to Speech
  const speakText = (text: string, langName: string, isSource: boolean = false) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (isSource) setIsPlayingSourceTTS(false);
      else setIsPlayingTTS(false);
      return;
    }

    const meta = getLanguageMetadata(langName);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = meta.speechCode || "en-US";
    utterance.rate = 0.95;

    // Try finding matching voice
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(
      (v) =>
        v.lang === meta.speechCode ||
        v.lang.startsWith(meta.code) ||
        v.name.toLowerCase().includes(langName.toLowerCase())
    );
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      if (isSource) setIsPlayingSourceTTS(true);
      else setIsPlayingTTS(true);
    };

    utterance.onend = () => {
      if (isSource) setIsPlayingSourceTTS(false);
      else setIsPlayingTTS(false);
    };

    utterance.onerror = () => {
      if (isSource) setIsPlayingSourceTTS(false);
      else setIsPlayingTTS(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Voice Speech-to-Text Recording
  const startRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    setTranslationError("");

    // Try Web Speech API SpeechRecognition first for instantaneous response
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        const meta = getLanguageMetadata(fromLang);
        recognition.lang = meta.speechCode || "en-US";
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          const text = final || interim;
          if (text) {
            setSourceText(text);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn("Speech recognition error:", e);
          setIsRecording(false);
          // Fall back to MediaRecorder upload
          startMediaRecorderRecording();
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (e) {
        console.warn("Web Speech API failed, falling back to MediaRecorder:", e);
      }
    }

    // Fallback: MediaRecorder sending to Gemini Multimodal Audio
    startMediaRecorderRecording();
  };

  const startMediaRecorderRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        // Transcribe with Gemini backend
        const transcribed = await transcribeAudio(audioBlob, {
          language: fromLang,
          mimeType: mediaRecorder.mimeType || "audio/webm",
        });

        setIsTranscribing(false);
        stream.getTracks().forEach((track) => track.stop());

        if (transcribed) {
          setSourceText(transcribed);
          handleTranslate(transcribed);
        } else {
          setTranslationError("Could not recognize speech. Please try speaking closer to the microphone.");
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setIsRecording(false);
      setTranslationError("Microphone access denied. Please enable mic permissions in your browser.");
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    setIsRecording(false);
  };

  // Copy helpers
  const handleCopyTarget = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopiedTarget(true);
    setTimeout(() => setCopiedTarget(false), 2000);
  };

  const handleCopySource = () => {
    if (!sourceText) return;
    navigator.clipboard.writeText(sourceText);
    setCopiedSource(true);
    setTimeout(() => setCopiedSource(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceText(text);
      }
    } catch (e) {
      console.warn("Clipboard paste permission denied:", e);
    }
  };

  // Filtered languages for modal picker
  const filteredLanguages = useMemo(() => {
    if (!pickerSearch.trim()) return LANGUAGES;
    const q = pickerSearch.toLowerCase();
    return LANGUAGES.filter((l) => l.label.toLowerCase().includes(q) || l.value.toLowerCase().includes(q));
  }, [pickerSearch]);

  const fromMeta = getLanguageMetadata(fromLang);
  const toMeta = getLanguageMetadata(toLang);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[500px] bg-amber-500/5 rounded-full blur-[150px]" />
      </div>

      {/* TOP HEADER */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl px-4 lg:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-md">
              <Image src="/logo.png" alt="Gabvia" width={36} height={36} className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                Gabvia
                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Translator
                </span>
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* User Points Badge */}
          {user && (
            <div
              title="Your available Gab Points"
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold shadow-inner"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>{gabPoints} GAB Points</span>
            </div>
          )}

          {/* History Toggle */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              showHistory
                ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300"
                : "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
            title="Translation History"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
            {history.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-[10px] flex items-center justify-center text-emerald-400">
                {history.length}
              </span>
            )}
          </button>

          {/* Back to Chat button */}
          <Link
            href="/chat"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm hover:from-emerald-400 hover:to-teal-400 transition-all shadow-md shadow-emerald-500/20"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Open Chat</span>
          </Link>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
        {/* Banner info */}
        <div className="text-center md:text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center md:justify-start gap-2.5">
              <span>Instant Multilingual Translator</span>
              <span className="inline-flex p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Translate text and voice across 40+ global & African languages powered by Gabvia AI neural models.
            </p>
          </div>

          {/* Quick popular language chips */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-1.5">
            <span className="text-xs font-semibold text-slate-500 mr-1">Popular:</span>
            {POPULAR_LANGUAGES.slice(0, 6).map((lang) => {
              const meta = getLanguageMetadata(lang);
              return (
                <button
                  key={lang}
                  onClick={() => {
                    if (fromLang === lang) {
                      setFromLang(toLang);
                      setToLang(lang);
                    } else {
                      setToLang(lang);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                    toLang === lang
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-semibold"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                  }`}
                >
                  <span className="mr-1">{meta.flag}</span>
                  {meta.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* TRANSLATOR BOX */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-2xl flex flex-col gap-4">
          {/* LANGUAGE SELECTOR BAR */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            {/* SOURCE LANGUAGE SELECTOR */}
            <div className="flex-1 w-full flex items-center justify-between sm:justify-start gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 pl-2">From</span>
              <button
                type="button"
                onClick={() => {
                  setPickerSearch("");
                  setActivePicker("from");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800/80 text-white font-semibold text-sm transition-all cursor-pointer shadow-sm group"
              >
                <span className="text-lg">{fromMeta.flag}</span>
                <span>{fromLang}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </button>
            </div>

            {/* SWAP BUTTON */}
            <button
              type="button"
              onClick={handleSwap}
              title="Swap languages"
              className="p-2.5 rounded-full bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 border border-slate-700 hover:border-emerald-400 transition-all shadow-md active:scale-95 cursor-pointer group"
            >
              <ArrowLeftRight className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </button>

            {/* TARGET LANGUAGE SELECTOR */}
            <div className="flex-1 w-full flex items-center justify-between sm:justify-end gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">To</span>
              <button
                type="button"
                onClick={() => {
                  setPickerSearch("");
                  setActivePicker("to");
                }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 hover:bg-slate-800/80 text-emerald-400 font-semibold text-sm transition-all cursor-pointer shadow-sm group"
              >
                <span className="text-lg">{toMeta.flag}</span>
                <span>{toLang}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* DUAL WORKSPACE: SOURCE & TARGET */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* SOURCE TEXT PANEL */}
            <div className="flex flex-col rounded-2xl bg-slate-950/70 border border-slate-800 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all p-4 min-h-[260px] relative">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-800/40 mb-2">
                <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                  <span>{fromMeta.flag}</span>
                  <span>{fromLang}</span>
                </span>
                <div className="flex items-center gap-2">
                  {sourceText && (
                    <button
                      onClick={() => setSourceText("")}
                      className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Clear text"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span>
                    {sourceText.length} / {MAX_MESSAGE_LENGTH}
                  </span>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                placeholder={`Type, paste, or tap the microphone to translate from ${fromLang}...`}
                className="w-full flex-1 bg-transparent resize-none text-white placeholder-slate-600 focus:outline-none text-base leading-relaxed"
                rows={6}
              />

              {/* Source Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/40 mt-auto">
                <div className="flex items-center gap-2">
                  {/* Microphone / Speech Input */}
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={isTranscribing}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isRecording
                        ? "bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30"
                        : isTranscribing
                        ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                        : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700/60"
                    }`}
                    title={isRecording ? "Stop recording" : "Voice input"}
                  >
                    {isRecording ? (
                      <>
                        <MicOff className="w-3.5 h-3.5" />
                        <span>Listening...</span>
                      </>
                    ) : isTranscribing ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Transcribing...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Voice</span>
                      </>
                    )}
                  </button>

                  {/* Paste button */}
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/40 text-xs transition-colors cursor-pointer"
                    title="Paste from clipboard"
                  >
                    Paste
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Listen Source Audio */}
                  {sourceText && (
                    <button
                      type="button"
                      onClick={() => speakText(sourceText, fromLang, true)}
                      className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        isPlayingSourceTTS
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse"
                          : "bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-700/40"
                      }`}
                      title={isPlayingSourceTTS ? "Stop voice" : "Listen to source"}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}

                  {/* Copy Source */}
                  {sourceText && (
                    <button
                      type="button"
                      onClick={handleCopySource}
                      className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/40 text-xs transition-colors cursor-pointer"
                      title="Copy source text"
                    >
                      {copiedSource ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* TARGET TRANSLATED PANEL */}
            <div className="flex flex-col rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800 p-4 min-h-[260px] relative shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-800/40 mb-2">
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                  <span>{toMeta.flag}</span>
                  <span>{toLang}</span>
                  {isTranslating && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-normal ml-2 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Translating...
                    </span>
                  )}
                </span>
                <span className="text-slate-500">{translatedText.length} characters</span>
              </div>

              {/* Target Text Result */}
              <div className="flex-1 w-full overflow-y-auto text-base leading-relaxed text-white">
                {translatedText ? (
                  <p className="whitespace-pre-wrap select-text selection:bg-emerald-500/40 font-medium">
                    {translatedText}
                  </p>
                ) : isTranslating ? (
                  <div className="space-y-2 py-4 animate-pulse">
                    <div className="h-4 bg-slate-800 rounded-md w-3/4" />
                    <div className="h-4 bg-slate-800 rounded-md w-1/2" />
                    <div className="h-4 bg-slate-800 rounded-md w-5/6" />
                  </div>
                ) : (
                  <p className="text-slate-600 italic select-none">
                    Translation will appear here in real-time...
                  </p>
                )}
              </div>

              {/* Target Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/40 mt-auto">
                <div className="flex items-center gap-2">
                  {/* Listen Translation Audio */}
                  <button
                    type="button"
                    onClick={() => speakText(translatedText, toLang, false)}
                    disabled={!translatedText}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      isPlayingTTS
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse font-bold"
                        : translatedText
                        ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                        : "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed"
                    }`}
                    title={isPlayingTTS ? "Stop voice" : "Listen to translation"}
                  >
                    {isPlayingTTS ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{isPlayingTTS ? "Stop" : "Listen"}</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    type="button"
                    onClick={handleCopyTarget}
                    disabled={!translatedText}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      copiedTarget
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : translatedText
                        ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                        : "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed"
                    }`}
                    title="Copy translated text"
                  >
                    {copiedTarget ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Send to Chat */}
                {translatedText && (
                  <Link
                    href={`/chat?insert=${encodeURIComponent(translatedText)}`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all cursor-pointer"
                    title="Take this translation into Chat"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send to Chat</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Action Row: Manual Translate & Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoTranslate}
                  onChange={(e) => setAutoTranslate(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                />
                <span>Auto-translate while typing</span>
              </label>

              {user && (
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" />1 point per translation
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {translationError && (
                <span className="text-xs text-rose-400 font-medium mr-2">{translationError}</span>
              )}

              <button
                type="button"
                onClick={() => handleTranslate(undefined, true)}
                disabled={isTranslating || !sourceText.trim()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-extrabold text-sm hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Translating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Translate Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* TRANSLATION HISTORY SECTION */}
        {showHistory && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-sm text-white">Recent Translations</h3>
                <span className="text-xs text-slate-500">({history.length})</span>
              </div>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center italic">No translation history yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[350px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setFromLang(item.fromLang);
                      setToLang(item.toLang);
                      setSourceText(item.sourceText);
                      setTranslatedText(item.translatedText);
                    }}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all cursor-pointer group flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 font-semibold text-slate-400">
                        <span>{getLanguageMetadata(item.fromLang).flag}</span>
                        <span>{item.fromLang}</span>
                        <span>→</span>
                        <span>{getLanguageMetadata(item.toLang).flag}</span>
                        <span className="text-emerald-400">{item.toLang}</span>
                      </div>
                      <span className="text-[10px] text-slate-600">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">{item.sourceText}</p>
                    <p className="text-xs text-emerald-300 font-medium line-clamp-2 bg-emerald-500/5 p-1.5 rounded-lg border border-emerald-500/10">
                      {item.translatedText}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* LANGUAGE PICKER MODAL */}
      {activePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">
                  Select {activePicker === "from" ? "Source" : "Target"} Language
                </h3>
              </div>
              <button
                onClick={() => setActivePicker(null)}
                className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="pt-3 pb-2">
              <div className="relative rounded-xl bg-slate-950 border border-slate-800 focus-within:border-emerald-500/50">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search language..."
                  autoFocus
                  className="w-full bg-transparent pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Popular Languages pills */}
            <div className="py-2 flex flex-wrap gap-1.5 border-b border-slate-800/60 mb-2">
              {POPULAR_LANGUAGES.map((lang) => {
                const meta = getLanguageMetadata(lang);
                const isSelected = activePicker === "from" ? fromLang === lang : toLang === lang;
                return (
                  <button
                    key={lang}
                    onClick={() => {
                      if (activePicker === "from") setFromLang(lang);
                      else setToLang(lang);
                      setActivePicker(null);
                    }}
                    className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950 font-bold border-emerald-400"
                        : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className="mr-1">{meta.flag}</span>
                    {lang}
                  </button>
                );
              })}
            </div>

            {/* Language list */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {filteredLanguages.map((lang) => {
                const meta = getLanguageMetadata(lang.value);
                const isSelected =
                  activePicker === "from" ? fromLang === lang.value : toLang === lang.value;

                return (
                  <button
                    key={lang.value}
                    onClick={() => {
                      if (activePicker === "from") setFromLang(lang.value);
                      else setToLang(lang.value);
                      setActivePicker(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "hover:bg-slate-800/60 text-slate-300 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{meta.flag}</span>
                      <span>{lang.label}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
