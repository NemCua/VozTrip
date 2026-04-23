"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { TriggerResult } from "@/services/api";
import { useAudio } from "@/hooks/useAudio";
import { useGPS } from "@/hooks/useGPS";

export function useGpsTriggerQueue(
  langId: string | null,
  lang: string,
  sessionId: string
) {
  const { play: _play, stop, playing, currentId } = useAudio();

  const [currentPoi, setCurrentPoi] = useState<TriggerResult | null>(null);
  const [bannerVisible, setBannerVisible] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  const queueRef        = useRef<TriggerResult[]>([]);
  const autoPlayRef     = useRef(false); // true when audio was started by GPS
  const prevPlayingRef  = useRef(false);
  const bannerTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef      = useRef(false);

  useEffect(() => { playingRef.current = playing; }, [playing]);

  const playGpsItem = useCallback((item: TriggerResult) => {
    autoPlayRef.current = true;
    setCurrentPoi(item);
    setBannerVisible(true);
    _play(item.poiId, item.audioUrl, item.poiName, lang);
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => setBannerVisible(false), 8_000);
  }, [_play, lang]);

  // Advance queue when GPS-triggered audio ends naturally
  useEffect(() => {
    const wasPlaying = prevPlayingRef.current;
    prevPlayingRef.current = playing;

    if (wasPlaying && !playing && autoPlayRef.current) {
      autoPlayRef.current = false;
      const next = queueRef.current.shift();
      if (next) {
        setQueueCount(queueRef.current.length);
        playGpsItem(next);
      } else {
        setCurrentPoi(null);
      }
    }
  }, [playing, playGpsItem]);

  // Dismiss banner + clear queue (user action)
  const dismiss = useCallback(() => {
    autoPlayRef.current = false;
    queueRef.current    = [];
    setQueueCount(0);
    stop();
    setBannerVisible(false);
    setTimeout(() => setCurrentPoi(null), 300);
  }, [stop]);

  // Manual play — user taps a play button directly; clears GPS queue
  const play = useCallback((
    id: string,
    audioUrl: string | null | undefined,
    text: string | null | undefined,
    language: string
  ) => {
    autoPlayRef.current = false;
    queueRef.current    = [];
    setQueueCount(0);
    setBannerVisible(false);
    setCurrentPoi(null);
    _play(id, audioUrl, text, language);
  }, [_play]);

  useGPS(langId, sessionId, (results) => {
    if (results.length === 0) return;
    const [first, ...rest] = results;

    if (!playingRef.current) {
      queueRef.current.push(...rest);
      setQueueCount(queueRef.current.length);
      playGpsItem(first);
    } else {
      queueRef.current.push(first, ...rest);
      setQueueCount(queueRef.current.length);
    }
  });

  useEffect(() => () => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
  }, []);

  return { currentPoi, bannerVisible, queueCount, dismiss, play, stop, playing, currentId };
}
