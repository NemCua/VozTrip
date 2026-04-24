import { useState, useRef, useCallback } from "react";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";

export function useAudio() {
  const soundRef    = useRef<Audio.Sound | null>(null);
  const currentIdRef = useRef<string | null>(null);
  const isLoadingRef = useRef(false);

  const [playing,   setPlaying]   = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const stop = useCallback(async () => {
    Speech.stop();
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch {
        // sound đã bị unload trước đó, bỏ qua
      }
      soundRef.current = null;
    }
    currentIdRef.current = null;
    setPlaying(false);
    setCurrentId(null);
  }, []);

  const play = useCallback(async (
    id: string,
    audioUrl: string | null | undefined,
    text: string | null | undefined,
    languageCode: string
  ) => {
    // Guard: bỏ qua nếu đang trong quá trình load — tránh race condition khi spam tap
    if (isLoadingRef.current) return;

    // Nếu đang phát cùng id thì toggle dừng
    if (currentIdRef.current === id && playing) {
      await stop();
      return;
    }

    isLoadingRef.current = true;
    try {
      await stop();
      currentIdRef.current = id;
      setCurrentId(id);
      setPlaying(true);

      if (audioUrl) {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });

        // Nếu bị cancel trong lúc load (user tap stop) thì unload ngay
        if (currentIdRef.current !== id) {
          await sound.unloadAsync();
          return;
        }

        soundRef.current = sound;
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            soundRef.current = null;
            currentIdRef.current = null;
            setPlaying(false);
            setCurrentId(null);
          }
        });
      } else if (text) {
        Speech.speak(text, {
          language: languageCode,
          onDone:  () => { currentIdRef.current = null; setPlaying(false); setCurrentId(null); },
          onError: () => { currentIdRef.current = null; setPlaying(false); setCurrentId(null); },
        });
      } else {
        currentIdRef.current = null;
        setPlaying(false);
        setCurrentId(null);
      }
    } catch {
      currentIdRef.current = null;
      setPlaying(false);
      setCurrentId(null);
    } finally {
      isLoadingRef.current = false;
    }
  }, [playing, stop]);

  return { play, stop, playing, currentId };
}
