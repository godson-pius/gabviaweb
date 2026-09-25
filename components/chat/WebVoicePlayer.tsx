"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Play, Pause, Loader2, Volume2, Sparkles, AlertCircle } from "lucide-react";

interface WebVoicePlayerProps {
  uri: string;
  isMine: boolean;
  duration?: number;
  translatedUri?: string | null;
}

const WAVEFORM_BARS = [10, 16, 24, 14, 20, 28, 18, 22, 12, 26, 16, 20, 14, 28, 22, 16, 12, 18];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function WebVoicePlayer({
  uri,
  isMine,
  duration: presetDuration = 0,
  translatedUri,
}: WebVoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(presetDuration || 0);
  const [activeSource, setActiveSource] = useState<"original" | "translated">(
    translatedUri && !isMine ? "translated" : "original"
  );
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activeRawUri = activeSource === "translated" && translatedUri ? translatedUri : uri;

  // Resolve private Vercel blob URL through server proxy to provide authorization header
  const resolvedUrl = useMemo(() => {
    if (!activeRawUri) return "";
    if (activeRawUri.startsWith("blob:") || activeRawUri.startsWith("data:")) {
      return activeRawUri;
    }
    if (activeRawUri.includes("blob.vercel-storage.com")) {
      return `/api/audio?url=${encodeURIComponent(activeRawUri)}`;
    }
    return activeRawUri;
  }, [activeRawUri]);

  // Reset audio element when URL changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);
  }, [resolvedUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const initAudio = () => {
    if (audioRef.current) return audioRef.current;

    const audio = new Audio(resolvedUrl);
    audioRef.current = audio;

    audio.addEventListener("waiting", () => setIsLoading(true));
    audio.addEventListener("playing", () => {
      setIsLoading(false);
      setIsPlaying(true);
      setHasError(false);
    });
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
    });
    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration);
      }
      setIsLoading(false);
    });
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });
    audio.addEventListener("error", (e) => {
      console.warn("[WebVoicePlayer] Audio playback error:", e);
      setIsLoading(false);
      setIsPlaying(false);
      setHasError(true);
    });

    return audio;
  };

  const togglePlay = async () => {
    if (!resolvedUrl) return;
    setHasError(false);

    try {
      const audio = initAudio();
      if (isPlaying) {
        audio.pause();
      } else {
        setIsLoading(true);
        await audio.play();
      }
    } catch (err) {
      console.warn("[WebVoicePlayer] Failed to play audio:", err);
      setIsLoading(false);
      setIsPlaying(false);
      setHasError(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));

    const targetTime = ratio * (duration || presetDuration || 1);
    setCurrentTime(targetTime);

    const audio = initAudio();
    audio.currentTime = targetTime;
  };

  const progressRatio = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  return (
    <div className="flex flex-col gap-2 min-w-[240px] max-w-[300px] select-none py-1">
      {/* Audio Source Switcher (Original vs Translated) */}
      {translatedUri && (
        <div className="flex items-center gap-1.5 self-start bg-black/20 p-0.5 rounded-full text-[10px]">
          <button
            type="button"
            onClick={() => setActiveSource("original")}
            className={`px-2 py-0.5 rounded-full font-medium transition-colors ${
              activeSource === "original"
                ? "bg-white/20 text-white shadow-xs"
                : "text-white/60 hover:text-white"
            }`}
          >
            Original
          </button>
          <button
            type="button"
            onClick={() => setActiveSource("translated")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-medium transition-colors ${
              activeSource === "translated"
                ? "bg-emerald-500/30 text-emerald-200 shadow-xs"
                : "text-white/60 hover:text-white"
            }`}
          >
            <Sparkles className="w-2.5 h-2.5" /> Translated
          </button>
        </div>
      )}

      {/* Main Player Bar */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md ${
            isMine
              ? "bg-white text-emerald-700 hover:bg-white/90"
              : "bg-emerald-500 text-white hover:bg-emerald-400"
          }`}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 fill-current" />
          ) : (
            <Play className="w-4 h-4 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Visualization Bars */}
        <div
          onClick={handleSeek}
          className="flex-1 flex items-center gap-1 h-7 cursor-pointer group"
          title="Click to seek"
        >
          {WAVEFORM_BARS.map((height, idx) => {
            const barRatio = idx / WAVEFORM_BARS.length;
            const isFilled = barRatio <= progressRatio;
            return (
              <div
                key={idx}
                style={{ height: `${height}px` }}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isFilled
                    ? isMine
                      ? "bg-white"
                      : "bg-emerald-400"
                    : isMine
                    ? "bg-white/30 group-hover:bg-white/50"
                    : "bg-slate-600/60 group-hover:bg-slate-500/80"
                } ${isPlaying && isFilled ? "opacity-100" : "opacity-80"}`}
              />
            );
          })}
        </div>
      </div>

      {/* Footer Info: Duration and Error status */}
      <div className="flex items-center justify-between text-[11px] font-mono px-0.5">
        <span className={isMine ? "text-white/80" : "text-slate-400"}>
          {isPlaying || currentTime > 0
            ? `${formatTime(currentTime)} / ${formatTime(duration || presetDuration)}`
            : formatTime(duration || presetDuration)}
        </span>

        {hasError && (
          <span className="flex items-center gap-1 text-[10px] text-amber-300 font-sans">
            <AlertCircle className="w-3 h-3" /> Failed to load
          </span>
        )}
      </div>
    </div>
  );
}
