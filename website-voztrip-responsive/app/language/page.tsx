"use client";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Check } from "lucide-react";
import { getLanguages, Language } from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";
import { LangCode, tr } from "@/lib/translations";

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


  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  const handleSelect = (apiLang: Language) => {
    setLang(apiLang.languageCode as LangCode, apiLang.languageId);
    const redirect = localStorage.getItem("redirect_after");
    localStorage.removeItem("redirect_after");
    router.push(redirect && redirect !== "/payment" && redirect !== "/language" ? redirect : "/home");
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
        <p className="text-lg text-[#2c2416]">{tr("lang_title", lang)}</p>
        <p className="text-sm text-[#b09878] mt-1.5">{tr("lang_subtitle", lang)}</p>
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
                isActive
                  ? "bg-[#fdf6e8] border-[#c8a96e]"
                  : "bg-white border-[#e8dfc8] active:bg-[#f5f0e8]"
              }`}
            >
              <span className="text-3xl">{meta.flag}</span>
              <span className="flex-1 text-[17px] text-[#2c2416]">
                {meta.label}
              </span>
              {isActive
                ? <Check size={18} color="#c8a96e" />
                : <ChevronRight size={18} color="#d8cbb0" />
              }
            </button>
          );
        })}
      </div>

    </div>
  );
}
