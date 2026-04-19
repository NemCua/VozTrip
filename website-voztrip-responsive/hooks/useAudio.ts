"use client";
import { useState, useRef, useCallback } from "react";

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    setPlaying(false);
    setCurrentId(null);
  }, []);

  const play = useCallback((
    id: string,
    audioUrl: string | null | undefined,
    text: string | null | undefined,
    languageCode: string
  ) => {
    if (currentId === id && playing) { stop(); return; }
    stop();
    setCurrentId(id);
    setPlaying(true);

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play().catch(() => { setPlaying(false); setCurrentId(null); });
      audio.onended = () => { setPlaying(false); setCurrentId(null); };
      audio.onerror = () => { setPlaying(false); setCurrentId(null); };
    } else if (text && typeof window !== "undefined" && window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = languageCode;
      utter.onend = () => { setPlaying(false); setCurrentId(null); };
      utter.onerror = () => { setPlaying(false); setCurrentId(null); };
      utteranceRef.current = utter;
      window.speechSynthesis.speak(utter);
    } else {
      setPlaying(false);
      setCurrentId(null);
    }
  }, [currentId, playing, stop]);

  return { play, stop, playing, currentId };
}
