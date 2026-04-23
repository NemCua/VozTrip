"use client";
import { useState, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import BottomNav from "./BottomNav";
import EmergencyModal from "@/components/ui/EmergencyModal";
import FeedbackModal from "@/components/ui/FeedbackModal";
import { useFeatures } from "@/context/FeaturesContext";
import { useLanguage } from "@/context/LanguageContext";

export default function AppShell({ children }: { children: ReactNode }) {
  const [showSOS, setShowSOS] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const features = useFeatures();
  const { lang } = useLanguage();
  const sosEnabled      = features.pages.emergency.enabled;
  const feedbackEnabled = features.pages.feedback.enabled;

  return (
    <div className="min-h-screen bg-[#fdfaf4] max-w-md mx-auto relative">
      <main className="pb-16">{children}</main>
      <BottomNav />

      {/* SOS FAB */}
      {sosEnabled && (
        <button
          onClick={() => setShowSOS(true)}
          className="fixed right-4 bottom-20 z-50 flex items-center gap-1.5 bg-[#dc2626] px-3.5 py-2.5 rounded-full shadow-lg shadow-red-500/40"
        >
          <AlertTriangle size={16} color="#fff" />
          <span className="text-[13px] font-bold text-white tracking-widest">SOS</span>
        </button>
      )}

      <EmergencyModal open={showSOS} onClose={() => setShowSOS(false)} lang={lang} />
      {feedbackEnabled && (
        <FeedbackModal open={showFeedback} onClose={() => setShowFeedback(false)} />
      )}
    </div>
  );
}
