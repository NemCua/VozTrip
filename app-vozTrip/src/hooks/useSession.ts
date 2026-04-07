import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSession } from "../services/api";

const SESSION_KEY = "voztrip_session_id";
const LANGUAGE_KEY = "voztrip_language_id";

function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [languageId, setLanguageId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      let sid = await AsyncStorage.getItem(SESSION_KEY);
      if (!sid) {
        sid = generateUUID();
        await AsyncStorage.setItem(SESSION_KEY, sid);
      }
      const lid = await AsyncStorage.getItem(LANGUAGE_KEY);
      setSessionId(sid);
      setLanguageId(lid);
      setReady(true);
    })();
  }, []);

  const saveLanguage = async (langId: string) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, langId);
    setLanguageId(langId);
    if (sessionId) {
      try { await createSession(sessionId, langId); } catch {}
    }
  };

  return { sessionId, languageId, saveLanguage, ready };
}
