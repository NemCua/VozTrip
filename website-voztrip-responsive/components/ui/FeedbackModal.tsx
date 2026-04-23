"use client";
import { X, Bug, Lightbulb, FileText, HelpCircle, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { submitFeedback } from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";
import { tr } from "@/lib/translations";

type FeedbackType = "bug" | "suggestion" | "content" | "other";

const TYPES: { key: FeedbackType; trKey: string; icon: React.ReactNode; color: string }[] = [
  { key: "bug",        trKey: "feedback_type_bug",     icon: <Bug size={16} />,        color: "#dc2626" },
  { key: "suggestion", trKey: "feedback_type_suggest", icon: <Lightbulb size={16} />,  color: "#c8a96e" },
  { key: "content",    trKey: "feedback_type_content", icon: <FileText size={16} />,   color: "#0891b2" },
  { key: "other",      trKey: "feedback_type_other",   icon: <HelpCircle size={16} />, color: "#8c7a5e" },
];

type Props = { open: boolean; onClose: () => void; poiId?: string };

export default function FeedbackModal({ open, onClose, poiId }: Props) {
  const { lang } = useLanguage();
  const [type, setType] = useState<FeedbackType>("suggestion");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!message.trim() || message.length > 1000) return;
    setSubmitting(true);
    try {
      const sessionId = localStorage.getItem("voz_session") ?? undefined;
      const deviceId  = localStorage.getItem("voz_session") ?? undefined;
      await submitFeedback({ sessionId, deviceId, type, message: message.trim(), poiId, platform: "web", lang });
      setDone(true);
      setTimeout(() => { setDone(false); setMessage(""); onClose(); }, 2000);
    } catch {
      // fail silently — feedback is non-critical
    } finally {
      setSubmitting(false);
    }
  };

  const selectedType = TYPES.find(t => t.key === type)!;

  return (
    <div className="fixed inset-0 z-9999 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#fdfaf4] rounded-t-3xl pt-2 pb-8 shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center mb-1">
          <div className="w-10 h-1 rounded-full bg-[#d8cbb0]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8dfc8]">
          <div>
            <p className="text-base font-semibold text-[#2c2416]">{tr("feedback_title", lang)}</p>
            <p className="text-[11px] text-[#b09878] mt-0.5">{tr("feedback_subtitle", lang)}</p>
          </div>
          <button onClick={onClose} className="p-1">
            <X size={22} color="#8c7a5e" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <CheckCircle size={48} color="#16a34a" />
            <p className="text-base font-medium text-[#2c2416]">{tr("feedback_done_title", lang)}</p>
            <p className="text-sm text-[#8c7a5e]">{tr("feedback_done_sub", lang)}</p>
          </div>
        ) : (
          <div className="px-5 pt-5 flex flex-col gap-4">
            {/* Type selector */}
            <div>
              <p className="text-[11px] text-[#b09060] tracking-wider uppercase mb-2">
                {tr("feedback_type_label", lang)}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {TYPES.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setType(t.key)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-colors"
                    style={{
                      backgroundColor: type === t.key ? t.color + "15" : "#fff",
                      borderColor:     type === t.key ? t.color : "#e8dfc8",
                      color:           type === t.key ? t.color : "#6b5c45",
                    }}
                  >
                    <span style={{ color: type === t.key ? t.color : "#b09878" }}>{t.icon}</span>
                    <span className="text-[13px] font-medium">{tr(t.trKey, lang)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <p className="text-[11px] text-[#b09060] tracking-wider uppercase mb-2">
                {tr("feedback_msg_label", lang)}
              </p>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder={tr("feedback_placeholder", lang)}
                rows={4}
                maxLength={1000}
                className="w-full bg-white border border-[#e8dfc8] rounded-xl px-3.5 py-3 text-sm text-[#2c2416] placeholder:text-[#b09878] outline-none resize-none focus:border-[#c8a96e]"
              />
              <p className="text-right text-[11px] text-[#b09878] mt-1">{message.length}/1000</p>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || submitting}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full transition-opacity disabled:opacity-50"
              style={{ backgroundColor: selectedType.color }}
            >
              <Send size={16} color="#fff" />
              <span className="text-[15px] font-semibold text-white">
                {submitting ? tr("feedback_sending", lang) : tr("feedback_send", lang)}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
