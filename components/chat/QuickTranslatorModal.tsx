"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  LANGUAGES,
  POPULAR_LANGUAGES,
  getLanguageMetadata,
  MAX_MESSAGE_LENGTH,
} from "@/lib/constants";
import { translateText, transcribeAudio } from "@/lib/translation";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Languages,
  ArrowLeftRight,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Sparkles,
  Coins,
  Send,
  Loader2,
  ExternalLink,
  ChevronDown,
  Search,
} from "lucide-react";

interface QuickTranslatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertToChat?: (text: string) => void;
  initialText?: string;
  defaultTargetLanguage?: string;
}

export function QuickTranslatorModal({
  isOpen,
  onClose,
  onInsertToChat,
  initialText = "",
  defaultTargetLanguage,
}: QuickTranslatorModalProps) {
  const { user, profile, gabPoints, deductPoints } = useAuth();

  const [fromLang, setFromLang] = useState<string>("English");
  const [toLang, setToLang] = useState<string>("Kinyarwanda");
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Speech input & playback
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [copied, setCopied] = useState(false);

  // Language Picker dropdown
  const [activePicker, setActivePicker] = useState<"from" | "to" | null>(null);
  const [pickerSearch, setPickerSearch] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

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

  // Initialize languages & source text
  useEffect(() => {
    if (isOpen) {
      if (profile?.native_language && LANGUAGES.some((l) => l.value === profile.native_language)) {
        setFromLang(profile.native_language);
        if (profile.native_language === "Kinyarwanda" && !defaultTargetLanguage) {
          setToLang("English");
        }
      }
      if (defaultTargetLanguage && LANGUAGES.some((l) => l.value === defaultTargetLanguage)) {
        setToLang(defaultTargetLanguage);
      } else if (!defaultTargetLanguage && profile?.native_language !== "Kinyarwanda") {
        setToLang("Kinyarwanda");
      }
      if (initialText) {
        setSourceText(initialText);
      }
    }
  }, [isOpen, profile?.native_language, defaultTargetLanguage, initialText]);

  // Translate function
  const handleTranslate = useCallback(
    async (text?: string, force = false) => {
      const textToRun = (text !== undefined ? text : sourceText).trim();
      if (!textToRun) {
        setTranslatedText("");
        lastTranslatedKeyRef.current = "";
        return;
      }

      if (fromLang === toLang) {
        setTranslatedText(textToRun);
        lastTranslatedKeyRef.current = `${fromLang}->${toLang}:${textToRun}`;
        return;
      }

      const key = `${fromLang}->${toLang}:${textToRun}`;
      if (!force && lastTranslatedKeyRef.current === key) {
        return;
      }

      if (isTranslatingRef.current) return;

      if (userRef.current && gabPointsRef.current < 1) {
        setErrorMsg("You have 0 Gab Points remaining.");
        return;
      }

      isTranslatingRef.current = true;
      setIsTranslating(true);
      setErrorMsg("");

      try {
        const result = await translateText(textToRun, toLang, {
          sourceLanguage: fromLang,
        });

        if (result) {
          lastTranslatedKeyRef.current = key;
          setTranslatedText(result);
          if (userRef.current && deductPointsRef.current) {
            await deductPointsRef.current(1);
          }
        } else {
          setErrorMsg("Translation failed. Try again.");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Translation error.");
      } finally {
        isTranslatingRef.current = false;
        setIsTranslating(false);
      }
    },
    [sourceText, fromLang, toLang]
  );

  // Debounced auto-translate
  useEffect(() => {
    if (!isOpen) return;
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
  }, [sourceText, fromLang, toLang, isOpen, handleTranslate]);

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

  const speakText = () => {
    if (!translatedText || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
      return;
    }

    const meta = getLanguageMetadata(toLang);
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = meta.speechCode || "en-US";
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const matched = voices.find((v) => v.lang === meta.speechCode || v.lang.startsWith(meta.code));
    if (matched) utterance.voice = matched;

    utterance.onstart = () => setIsPlayingTTS(true);
    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);

    window.speechSynthesis.speak(utterance);
  };

  const startRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    setErrorMsg("");

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        const meta = getLanguageMetadata(fromLang);
        recognition.lang = meta.speechCode || "en-US";
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (e: any) => {
          let text = "";
          for (let i = e.resultIndex; i < e.results.length; ++i) {
            text += e.results[i][0].transcript;
          }
          if (text) setSourceText(text);
        };
        recognition.onerror = () => {
          setIsRecording(false);
          startMediaRecorder();
        };
        recognition.onend = () => setIsRecording(false);

        recognitionRef.current = recognition;
        recognition.start();
        return;
      } catch (e) {}
    }

    startMediaRecorder();
  };

  const startMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        setIsTranscribing(true);
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || "audio/webm",
        });

        const transcribed = await transcribeAudio(audioBlob, {
          language: fromLang,
          mimeType: mediaRecorder.mimeType || "audio/webm",
        });

        setIsTranscribing(false);
        stream.getTracks().forEach((track) => track.stop());

        if (transcribed) {
          setSourceText(transcribed);
          handleTranslate(transcribed);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(250);
      setIsRecording(true);
    } catch (err) {
      setIsRecording(false);
      setErrorMsg("Microphone permission denied.");
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

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (onInsertToChat && translatedText) {
      onInsertToChat(translatedText);
      onClose();
    }
  };

  const filteredLanguages = useMemo(() => {
    if (!pickerSearch.trim()) return LANGUAGES;
    const q = pickerSearch.toLowerCase();
    return LANGUAGES.filter((l) => l.label.toLowerCase().includes(q) || l.value.toLowerCase().includes(q));
  }, [pickerSearch]);

  if (!isOpen) return null;

  const fromMeta = getLanguageMetadata(fromLang);
  const toMeta = getLanguageMetadata(toLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                Quick Translator
                {user && (
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <Coins className="w-3 h-3" />
                    {gabPoints} pts
                  </span>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/translator"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
              title="Open full page translator"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Language selector bar */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-950/70 border border-slate-800">
          {/* Source selector */}
          <button
            type="button"
            onClick={() => {
              setPickerSearch("");
              setActivePicker("from");
            }}
            className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs sm:text-sm font-semibold text-white transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>{fromMeta.flag}</span>
              <span className="truncate">{fromLang}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>

          {/* Swap */}
          <button
            type="button"
            onClick={handleSwap}
            className="p-2 rounded-full bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 border border-slate-700 transition-all cursor-pointer shrink-0"
            title="Swap languages"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          {/* Target selector */}
          <button
            type="button"
            onClick={() => {
              setPickerSearch("");
              setActivePicker("to");
            }}
            className="flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-xs sm:text-sm font-semibold text-emerald-400 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <span>{toMeta.flag}</span>
              <span className="truncate">{toLang}</span>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Source Box */}
        <div className="flex flex-col rounded-2xl bg-slate-950/70 border border-slate-800 p-3 min-h-[110px] relative">
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
            placeholder={`Type or speak in ${fromLang}...`}
            className="w-full flex-1 bg-transparent resize-none text-white placeholder-slate-600 focus:outline-none text-sm"
            rows={3}
          />
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/40">
            <button
              type="button"
              onClick={startRecording}
              disabled={isTranscribing}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isRecording
                  ? "bg-rose-500 text-white animate-pulse"
                  : isTranscribing
                  ? "bg-slate-800 text-slate-500"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-emerald-400 border border-slate-700"
              }`}
            >
              {isRecording ? <MicOff className="w-3 h-3" /> : isTranscribing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mic className="w-3 h-3" />}
              <span>{isRecording ? "Listening..." : isTranscribing ? "Transcribing..." : "Voice"}</span>
            </button>

            {sourceText && (
              <button
                type="button"
                onClick={() => setSourceText("")}
                className="text-xs text-slate-500 hover:text-rose-400"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Target Translated Result Box */}
        <div className="flex flex-col rounded-2xl bg-slate-950/90 border border-slate-800 p-3 min-h-[110px] relative">
          <div className="flex items-center justify-between text-xs text-emerald-400 pb-1 mb-1 border-b border-slate-800/40">
            <span className="font-semibold flex items-center gap-1">
              <span>{toMeta.flag}</span>
              <span>{toLang}</span>
            </span>
            {isTranslating && (
              <span className="text-[11px] text-amber-400 flex items-center gap-1 animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                Translating...
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto text-sm text-white py-1">
            {translatedText ? (
              <p className="whitespace-pre-wrap select-text selection:bg-emerald-500/40 font-medium">
                {translatedText}
              </p>
            ) : isTranslating ? (
              <div className="space-y-1.5 py-2 animate-pulse">
                <div className="h-3.5 bg-slate-800 rounded w-3/4" />
                <div className="h-3.5 bg-slate-800 rounded w-1/2" />
              </div>
            ) : (
              <p className="text-slate-600 text-xs italic">Translation will appear here...</p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/40 mt-auto">
            <div className="flex items-center gap-1.5">
              {/* TTS */}
              <button
                type="button"
                onClick={speakText}
                disabled={!translatedText}
                className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  isPlayingTTS
                    ? "bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse"
                    : translatedText
                    ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                    : "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed"
                }`}
                title="Listen to translation"
              >
                {isPlayingTTS ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>

              {/* Copy */}
              <button
                type="button"
                onClick={handleCopy}
                disabled={!translatedText}
                className={`p-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                  copied
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                    : translatedText
                    ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                    : "bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed"
                }`}
                title="Copy translation"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Insert to Chat Action */}
            {onInsertToChat && translatedText && (
              <button
                type="button"
                onClick={handleInsert}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs hover:from-emerald-400 hover:to-teal-400 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Insert into Chat</span>
              </button>
            )}
          </div>
        </div>

        {errorMsg && <p className="text-xs text-rose-400">{errorMsg}</p>}

        {/* Embedded Language Picker Overlay */}
        {activePicker && (
          <div className="absolute inset-0 z-20 bg-slate-900 p-4 flex flex-col rounded-3xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-sm text-white">
                Choose {activePicker === "from" ? "Source" : "Target"} Language
              </span>
              <button
                onClick={() => setActivePicker(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-2">
              <div className="relative rounded-xl bg-slate-950 border border-slate-800">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search languages..."
                  autoFocus
                  className="w-full bg-transparent pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

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
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                        : "hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{meta.flag}</span>
                      <span>{lang.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
