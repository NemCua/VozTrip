"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Check } from "lucide-react";
import { getLanguages, Language } from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";
import { LangCode } from "@/lib/translations";

const LANG_META: Record<string, { flag: string; label: string }> = {
  vi: { flag: "🇻🇳", label: "Tiếng Việt" },
  en: { flag: "🇬🇧", label: "English"    },
  zh: { flag: "🇨🇳", label: "中文"       },
  ko: { flag: "🇰🇷", label: "한국어"     },
  ja: { flag: "🇯🇵", label: "日本語"     },
};

export default function LanguagePickerPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();

  const [isFirstTime, setIsFirstTime] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("voz_lang");
    if (!saved) {
      setIsFirstTime(true);
      setAgreed(false);
    }
  }, []);

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  const handleSelect = (apiLang: Language) => {
    if (!agreed) { setShowWarning(true); return; }
    setLang(apiLang.languageCode as LangCode, apiLang.languageId);
    router.push("/home");
  };

  // Merge API languages with local flag/label metadata; fall back to static list if API empty
  const displayList: Language[] =
    languages.length > 0
      ? languages
      : Object.entries(LANG_META).map(([code]) => ({
          languageId: code,
          languageCode: code,
          languageName: LANG_META[code]?.label ?? code,
        }));

  return (
    <div className="min-h-screen bg-[#fdfaf4] flex flex-col px-6">

      {/* Header */}
      <div className="flex flex-col items-center pt-12 pb-7">
        <p className="text-[10px] tracking-[3px] text-[#b09060] uppercase mb-1.5">Tourism Guide</p>
        <p className="text-4xl text-[#2c2416] font-light tracking-wide">VozTrip</p>
        <div className="w-10 h-px bg-[#c8a96e] my-5" />
        <p className="text-lg text-[#2c2416]">Chọn ngôn ngữ</p>
        <p className="text-sm text-[#b09878] mt-1.5">Select your language</p>
      </div>

      {/* Language list */}
      <div className="flex flex-col gap-2.5 flex-1">
        {displayList.map((l) => {
          const meta = LANG_META[l.languageCode] ?? { flag: "🌐", label: l.languageName };
          const isActive = lang === l.languageCode;
          return (
            <button
              key={l.languageId}
              onClick={() => handleSelect(l)}
              className={`flex items-center gap-4 rounded-2xl border px-4 py-4 transition-colors text-left ${
                agreed
                  ? isActive
                    ? "bg-[#fdf6e8] border-[#c8a96e]"
                    : "bg-white border-[#e8dfc8] active:bg-[#f5f0e8]"
                  : "bg-[#faf7f2] border-[#f0e8d8] cursor-not-allowed"
              }`}
            >
              <span className="text-3xl">{meta.flag}</span>
              <span className={`flex-1 text-[17px] ${agreed ? "text-[#2c2416]" : "text-[#b09878]"}`}>
                {meta.label}
              </span>
              {isActive && agreed ? (
                <Check size={18} color="#c8a96e" />
              ) : (
                <ChevronRight size={18} color={agreed ? "#d8cbb0" : "#e8dfc8"} />
              )}
            </button>
          );
        })}
      </div>

      {/* Consent — chỉ hiện lần đầu */}
      {isFirstTime && (
        <div className="border-t border-[#e8dfc8] py-5 flex flex-col gap-2.5">
          {showWarning && !agreed && (
            <p className="text-[11px] text-[#c0392b] bg-[#fdf2f2] border border-[#f5c6c6] rounded-lg px-3 py-2">
              Vui lòng đồng ý với chính sách bảo mật để tiếp tục.
            </p>
          )}

          <button
            onClick={() => { setAgreed((v) => !v); setShowWarning(false); }}
            className="flex items-start gap-3 text-left"
          >
            <div
              className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                agreed
                  ? "bg-[#2c2416] border-[#2c2416]"
                  : "bg-[#f5f0e8] border-[#d8cbb0]"
              }`}
            >
              {agreed && <Check size={13} color="#fdfaf4" />}
            </div>
            <p className="flex-1 text-[13px] text-[#5c4a30] leading-5">
              Tôi đã đọc và đồng ý với{" "}
              <a
                href="/privacy"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="text-[#c8a96e] underline"
              >
                Chính sách bảo mật
              </a>{" "}
              của VozTrip.
            </p>
          </button>

          <p className="text-[11px] text-[#b09878] pl-8">
            By continuing, you agree to VozTrip's Privacy Policy.
          </p>
        </div>
      )}
    </div>
  );
}
