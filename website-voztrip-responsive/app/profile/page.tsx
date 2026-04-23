"use client";
import { useRouter } from "next/navigation";
import {
  User, Languages, ChevronRight, Map, Headphones,
  Radio, Globe, ShieldCheck, FileText, ExternalLink, CheckCircle, MessageSquarePlus,
} from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { tr } from "@/lib/translations";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { useFeatures } from "@/context/FeaturesContext";

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "zh", label: "中文",       flag: "🇨🇳" },
  { code: "ko", label: "한국어",     flag: "🇰🇷" },
  { code: "ja", label: "日本語",     flag: "🇯🇵" },
];

function SectionTitle({ label }: { label: string }) {
  return (
    <p className="text-[11px] text-[#b09060] tracking-[2px] uppercase mb-3">{label}</p>
  );
}

function IconBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-9 h-9 rounded-full bg-[#fdf6e8] flex items-center justify-center shrink-0">
      {children}
    </div>
  );
}

function Separator() {
  return <div className="h-px bg-[#f0e8d8] mx-3.5" />;
}

export default function ProfilePage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];
  const [showFeedback, setShowFeedback] = useState(false);
  const features = useFeatures();
  const feedbackEnabled  = features.pages.feedback.enabled;
  const langPickerEnabled = features.features.guest.languagePicker.enabled;

  return (
    <div className="min-h-screen bg-[#fdfaf4] overflow-y-auto pb-8">

      {/* Header */}
      <div className="px-5 pt-5 pb-3.5">
        <p className="text-[10px] text-[#b09060] tracking-[2px] uppercase">
          {tr("profile_guest", lang)}
        </p>
        <p className="text-2xl text-[#2c2416] font-light tracking-wide">
          {tr("tab_settings", lang)}
        </p>
      </div>
      <div className="h-px bg-[#e8dfc8] mx-5 mb-6" />

      {/* Avatar */}
      <div className="flex flex-col items-center gap-2 pb-7">
        <div className="w-20 h-20 rounded-full bg-[#f5f0e8] border-2 border-[#e8dfc8] flex items-center justify-center">
          <User size={36} color="#c8a96e" />
        </div>
        <p className="text-base font-medium text-[#2c2416]">{tr("profile_guest", lang)}</p>
        <p className="text-xs text-[#b09878]">{tr("profile_no_login", lang)}</p>
      </div>

      {/* Section: Language */}
      <div className="px-5 mb-6">
        <SectionTitle label={tr("profile_lang_title", lang)} />

        {/* Current lang row */}
        <button
          onClick={() => router.push("/language")}
          className="w-full flex items-center gap-3 bg-white border border-[#e8dfc8] rounded-2xl p-3.5 mb-3"
        >
          <IconBox><Languages size={20} color="#c8a96e" /></IconBox>
          <div className="flex-1 text-left">
            <p className="text-xs text-[#b09878]">{tr("profile_current_lang", lang)}</p>
            <p className="text-[15px] text-[#2c2416] font-medium mt-0.5">
              {currentLang.flag}&nbsp;&nbsp;{currentLang.label}
            </p>
          </div>
          <ChevronRight size={18} color="#d8cbb0" />
        </button>

        {/* Language grid */}
        <div className="flex flex-col gap-2">
          {LANGUAGES.map((l) => (
            <div
              key={l.code}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border ${
                l.code === lang
                  ? "border-[#c8a96e] bg-[#fdf6e8]"
                  : "border-[#e8dfc8] bg-white"
              }`}
            >
              <span className="text-xl">{l.flag}</span>
              <span className={`flex-1 text-sm ${l.code === lang ? "text-[#2c2416] font-medium" : "text-[#6b5c45]"}`}>
                {l.label}
              </span>
              {l.code === lang && <CheckCircle size={14} color="#c8a96e" />}
            </div>
          ))}
        </div>
      </div>

      {/* Section: About */}
      <div className="px-5 mb-6">
        <SectionTitle label={tr("profile_about", lang)} />
        <div className="bg-white border border-[#e8dfc8] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-3.5">
            <IconBox><Map size={20} color="#c8a96e" /></IconBox>
            <div className="flex-1">
              <p className="text-xs text-[#b09878]">VozTrip</p>
              <p className="text-[15px] text-[#2c2416] font-medium mt-0.5">Tourism Guide v1.0</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3 p-3.5">
            <IconBox><Headphones size={20} color="#c8a96e" /></IconBox>
            <div className="flex-1">
              <p className="text-xs text-[#b09878]">{tr("profile_audio", lang)}</p>
              <p className="text-[15px] text-[#2c2416] font-medium mt-0.5">{tr("profile_audio_sub", lang)}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3 p-3.5">
            <IconBox><Radio size={20} color="#c8a96e" /></IconBox>
            <div className="flex-1">
              <p className="text-xs text-[#b09878]">{tr("profile_gps", lang)}</p>
              <p className="text-[15px] text-[#2c2416] font-medium mt-0.5">{tr("profile_gps_sub", lang)}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3 p-3.5">
            <IconBox><Globe size={20} color="#c8a96e" /></IconBox>
            <div className="flex-1">
              <p className="text-xs text-[#b09878]">{tr("profile_support", lang)}</p>
              <p className="text-[15px] text-[#2c2416] font-medium mt-0.5">VI · EN · ZH · KO · JA</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Legal */}
      <div className="px-5 mb-6">
        <SectionTitle label={tr("profile_legal", lang)} />
        <div className="bg-white border border-[#e8dfc8] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-3 p-3.5">
            <IconBox><ShieldCheck size={20} color="#c8a96e" /></IconBox>
            <div className="flex-1">
              <p className="text-xs text-[#b09878]">{tr("profile_gps", lang)}</p>
              <p className="text-xs text-[#8c7a5e] mt-0.5 leading-snug">{tr("profile_no_gps_note", lang)}</p>
            </div>
          </div>
          <Separator />
          <button
            onClick={() => window.open("/privacy", "_blank")}
            className="w-full flex items-center gap-3 p-3.5"
          >
            <IconBox><FileText size={20} color="#c8a96e" /></IconBox>
            <div className="flex-1 text-left">
              <p className="text-xs text-[#b09878]">{tr("profile_privacy_sub", lang)}</p>
              <p className="text-[15px] text-[#2c2416] font-medium mt-0.5">{tr("profile_privacy", lang)}</p>
            </div>
            <ExternalLink size={18} color="#d8cbb0" />
          </button>
        </div>
      </div>

      {/* Section: Feedback */}
      {feedbackEnabled && (
        <div className="px-5 mb-6">
          <SectionTitle label={tr("profile_support_section", lang)} />
          <button
            onClick={() => setShowFeedback(true)}
            className="w-full flex items-center gap-3 bg-white border border-[#e8dfc8] rounded-2xl p-3.5"
          >
            <IconBox><MessageSquarePlus size={20} color="#c8a96e" /></IconBox>
            <div className="flex-1 text-left">
              <p className="text-xs text-[#b09878]">{tr("profile_feedback_sub", lang)}</p>
              <p className="text-[15px] text-[#2c2416] font-medium mt-0.5">
                {tr("profile_feedback_desc", lang)}
              </p>
            </div>
            <ChevronRight size={18} color="#d8cbb0" />
          </button>
        </div>
      )}

      {/* CTA button: đổi ngôn ngữ — chỉ hiện khi languagePicker bật */}
      {langPickerEnabled && (
        <div className="px-5">
          <button
            onClick={() => router.push("/language")}
            className="w-full flex items-center justify-center gap-2 bg-[#2c2416] rounded-2xl py-4"
          >
            <Languages size={18} color="#fdfaf4" />
            <span className="text-[15px] font-semibold text-[#fdfaf4]">
              {tr("profile_change_lang", lang)}
            </span>
          </button>
        </div>
      )}

      {feedbackEnabled && (
        <FeedbackModal open={showFeedback} onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
}
