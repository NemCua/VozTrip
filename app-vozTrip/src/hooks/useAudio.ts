import { useState, useRef, useCallback } from "react";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";

export function useAudio() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const stop = useCallback(async () => {
    Speech.stop();
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setPlaying(false);
    setCurrentId(null);
  }, []);

  // id: unique identifier (poiId or questionId) để biết cái nào đang phát
  const play = useCallback(async (
    id: string,
    audioUrl: string | null | undefined,
    text: string | null | undefined,
    languageCode: string
  ) => {
    // Nếu đang phát cùng id thì dừng lại
    if (currentId === id && playing) {
      await stop();
      return;
    }

    await stop();
    setCurrentId(id);
    setPlaying(true);

    if (audioUrl) {
      // Phát file audio từ Cloudinary
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
        soundRef.current = sound;
        await sound.playAsync();
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlaying(false);
            setCurrentId(null);
          }
        });
      } catch {
        setPlaying(false);
        setCurrentId(null);
      }
    } else if (text) {
      // TTS fallback
      Speech.speak(text, {
        language: languageCode,
        onDone: () => { setPlaying(false); setCurrentId(null); },
        onError: () => { setPlaying(false); setCurrentId(null); },
      });
    } else {
      setPlaying(false);
      setCurrentId(null);
    }
  }, [currentId, playing, stop]);

  return { play, stop, playing, currentId };
}
