"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LangCode } from "@/lib/translations";

type LanguageCtx = {
  lang: LangCode;
  langId: string;
  setLang: (code: LangCode, id: string) => void;
};

const LanguageContext = createContext<LanguageCtx>({
  lang: "vi",
  langId: "",
  setLang: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangCode] = useState<LangCode>("vi");
  const [langId, setLangId] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("voz_lang");
    const savedId = localStorage.getItem("voz_lang_id");
    if (saved) setLangCode(saved as LangCode);
    if (savedId) setLangId(savedId);
  }, []);

  const setLang = (code: LangCode, id: string) => {
    setLangCode(code);
    setLangId(id);
    localStorage.setItem("voz_lang", code);
    localStorage.setItem("voz_lang_id", id);
  };

  return (
    <LanguageContext.Provider value={{ lang, langId, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
