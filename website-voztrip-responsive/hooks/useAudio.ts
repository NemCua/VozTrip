"use client";
import { useState, useRef, useCallback } from "react";

export function useAudio() {
  const audioRef      = useRef<HTMLAudioElement | null>(null);
  const currentIdRef  = useRef<string | null>(null);
  const isLoadingRef  = useRef(false);

  const [playing,   setPlaying]   = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    currentIdRef.current = null;
    setPlaying(false);
    setCurrentId(null);
  }, []);

  const play = useCallback((
    id: string,
    audioUrl: string | null | undefined,
    text: string | null | undefined,
    languageCode: string
  ) => {
    // Guard: bỏ qua nếu đang load — tránh spam tap
    if (isLoadingRef.current) return;

    // Toggle dừng nếu đang phát cùng id
    if (currentIdRef.current === id && playing) { stop(); return; }

    stop();
    currentIdRef.current = id;
    setCurrentId(id);
    setPlaying(true);

    if (audioUrl) {
      isLoadingRef.current = true;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play()
        .catch(() => { currentIdRef.current = null; setPlaying(false); setCurrentId(null); })
        .finally(() => { isLoadingRef.current = false; });
      audio.onended = () => { currentIdRef.current = null; setPlaying(false); setCurrentId(null); };
      audio.onerror = () => { currentIdRef.current = null; setPlaying(false); setCurrentId(null); };
    } else if (text && typeof window !== "undefined" && window.speechSynthesis) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = languageCode;
      utter.onend   = () => { currentIdRef.current = null; setPlaying(false); setCurrentId(null); };
      utter.onerror = () => { currentIdRef.current = null; setPlaying(false); setCurrentId(null); };
      window.speechSynthesis.speak(utter);
    } else {
      currentIdRef.current = null;
      setPlaying(false);
      setCurrentId(null);
    }
  }, [playing, stop]);

  return { play, stop, playing, currentId };
}
