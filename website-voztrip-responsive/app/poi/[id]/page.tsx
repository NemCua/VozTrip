"use client";
import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, Heart, Images, Play, Pause, Music, Mic,
  Globe, HelpCircle, ChevronDown, ChevronUp,
} from "lucide-react";
import { getPoiDetail, getLanguages, getQuestions, Language, PoiDetail, Question } from "@/services/api";
import { useAudio } from "@/hooks/useAudio";
import { useLanguage } from "@/context/LanguageContext";
import { tr } from "@/lib/translations";

export default function PoiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: poiId } = use(params);
  const router = useRouter();
  const { lang, langId } = useLanguage();

  const [activeLangId, setActiveLangId] = useState(langId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [expandedQA, setExpandedQA] = useState<string | null>(null);
  const { play, currentId, playing } = useAudio();

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: getLanguages,
  });

  const activeLang = languages.find((l) => l.languageId === activeLangId);
  const activeLangCode = activeLang?.languageCode ?? lang;

  const { data: poi, isLoading } = useQuery<PoiDetail>({
    queryKey: ["poi", poiId, activeLangId],
    queryFn: () => getPoiDetail(poiId, activeLangId || undefined),
    enabled: !!poiId,
  });

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ["questions", poiId, activeLangId],
    queryFn: () => getQuestions(poiId, activeLangId || undefined),
    enabled: !!poiId,
  });

  const loc = poi?.localizations?.[0];
  const hasContent = !!(loc?.title || loc?.description);
  const isPoiPlaying = playing && currentId === `poi-${poiId}`;

  const handlePlayPOI = () => {
    play(`poi-${poiId}`, loc?.audioUrl, loc?.description ?? poi?.poiName, activeLangCode);
  };

  return (
    <div className="min-h-screen bg-[#fdfaf4]">

      {/* ── Hero image ── */}
      <div className="relative w-full h-64 bg-[#f5f0e8]">
        {poi?.media && poi.media.length > 0 ? (
          <Image
            src={poi.media[activeImageIndex]?.mediaUrl}
            alt={poi.poiName}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Images size={40} color="#d8cbb0" />
            <p className="text-xs text-[#b09878]">{tr("common_no_image", activeLangCode)}</p>
          </div>
        )}

        {/* Top bar: back + heart */}
        <div className="absolute top-3 left-0 right-0 flex justify-between px-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-[rgba(253,250,244,0.92)] flex items-center justify-center"
          >
            <ArrowLeft size={20} color="#2c2416" />
          </button>
          <button className="w-9 h-9 rounded-full bg-[rgba(253,250,244,0.92)] flex items-center justify-center">
            <Heart size={20} color="#2c2416" />
          </button>
        </div>

        {/* Image counter badge */}
        {poi?.media && poi.media.length > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[rgba(44,36,22,0.6)] rounded-xl px-2.5 py-1.5">
            <Images size={12} color="#f5f0e8" />
            <span className="text-[11px] text-[#f5f0e8] font-medium">
              {activeImageIndex + 1} / {poi.media.length}
            </span>
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {poi?.media && poi.media.length > 1 && (
        <div className="bg-[#fdfaf4] border-b border-[#e8dfc8] py-2.5">
          <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar">
            {poi.media.map((item, index) => (
              <button
                key={item.mediaId}
                onClick={() => setActiveImageIndex(index)}
                className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                  index === activeImageIndex ? "border-[#c8a96e]" : "border-transparent"
                }`}
              >
                <Image src={item.mediaUrl} alt="" fill className="object-cover" unoptimized />
                {item.mediaType === "video" && (
                  <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-[rgba(44,36,22,0.7)] flex items-center justify-center">
                    <Play size={9} color="#fff" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="p-5 flex flex-col gap-5 pb-10">

        {/* POI header */}
        <div className="flex flex-col gap-2">
          {poi?.zoneName && (
            <span className="self-start bg-[#fdf6e8] rounded-md px-2 py-0.5 text-[10px] text-[#c8a96e] tracking-widest uppercase">
              {poi.zoneName}
            </span>
          )}
          <h1 className="text-[22px] text-[#2c2416] font-normal leading-7">
            {isLoading
              ? tr("detail_loading", activeLangCode)
              : (loc?.title ?? poi?.poiName ?? "—")}
          </h1>
        </div>

        {/* Language selector */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
          {languages.map((l) => {
            const hasData = poi?.localizations?.some((loc) => loc.languageId === l.languageId);
            const isActive = activeLangId === l.languageId;
            return (
              <button
                key={l.languageId}
                onClick={() => setActiveLangId(l.languageId)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[#2c2416] border-[#2c2416] text-[#f5f0e8]"
                    : "border-[#d8cbb0] text-[#8c7a5e]"
                }`}
              >
                {l.languageCode.toUpperCase()}
                {!hasData && (
                  <span className="w-3.5 h-3.5 rounded-full bg-[#fdf6e8] flex items-center justify-center">
                    <Mic size={9} color="#c8a96e" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Audio player */}
        <div className="flex items-center justify-between bg-[#2c2416] rounded-2xl p-4 gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPOI}
              className="w-11 h-11 rounded-full bg-[#c8a96e] flex items-center justify-center shrink-0"
            >
              {isPoiPlaying ? (
                <Pause size={20} color="#fdfaf4" />
              ) : (
                <Play size={20} color="#fdfaf4" />
              )}
            </button>
            <div>
              <p className="text-sm text-[#f5f0e8] font-medium">
                {isPoiPlaying
                  ? tr("detail_pause", activeLangCode)
                  : tr("detail_listen", activeLangCode)}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                {loc?.audioUrl ? (
                  <><Music size={11} color="#c8a96e" /><span className="text-[11px] text-[#c8a96e]">Audio gốc</span></>
                ) : (
                  <><Mic size={11} color="#c8a96e" /><span className="text-[11px] text-[#c8a96e]">Text-to-Speech</span></>
                )}
              </div>
            </div>
          </div>
          {/* Waveform */}
          <div className="flex items-center gap-0.5 flex-1 justify-end">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-0.5 rounded-sm transition-opacity"
                style={{
                  height: `${6 + Math.sin(i * 0.8) * 10 + Math.cos(i * 1.3) * 6}px`,
                  opacity: isPoiPlaying ? 1 : 0.35,
                  backgroundColor: isPoiPlaying && i < 8 ? "#c8a96e" : "#d8cbb0",
                }}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-3">
          <p className="text-base font-medium text-[#2c2416]">{tr("detail_intro", activeLangCode)}</p>
          {isLoading ? (
            <p className="text-sm text-[#b09878]">{tr("detail_loading", activeLangCode)}</p>
          ) : hasContent ? (
            <p className="text-sm text-[#5a4a35] leading-relaxed">{loc?.description}</p>
          ) : (
            <div className="flex items-center gap-2.5 bg-[#fdf6e8] border border-[#e8dfc8] rounded-xl p-3.5">
              <Globe size={20} color="#c8a96e" className="shrink-0" />
              <p className="text-[13px] text-[#b09878] leading-snug">
                {tr("detail_no_content", activeLangCode)}
              </p>
            </div>
          )}
        </div>

        {/* Q&A */}
        {questions.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <p className="text-base font-medium text-[#2c2416]">{tr("detail_qa", activeLangCode)}</p>
              <span className="bg-[#f5f0e8] rounded-lg px-2 py-0.5 text-[11px] text-[#8c7a5e]">
                {questions.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {questions.map((qa) => {
                const isAnswerPlaying = playing && currentId === `qa-${qa.questionId}`;
                const isExpanded = expandedQA === qa.questionId;
                return (
                  <div key={qa.questionId}>
                    <button
                      onClick={() => setExpandedQA(isExpanded ? null : qa.questionId)}
                      className="w-full flex items-start gap-2 bg-[#f5f0e8] border border-[#e8dfc8] rounded-xl p-3.5 text-left"
                    >
                      <HelpCircle size={16} color="#8c7a5e" className="mt-0.5 shrink-0" />
                      <p className="flex-1 text-[13px] text-[#2c2416] leading-snug">{qa.questionText}</p>
                      {isExpanded ? (
                        <ChevronUp size={14} color="#b09878" className="shrink-0 mt-0.5" />
                      ) : (
                        <ChevronDown size={14} color="#b09878" className="shrink-0 mt-0.5" />
                      )}
                    </button>

                    {isExpanded && qa.answer && (
                      <div className="ml-4 mt-1 bg-white border border-[#e8dfc8] rounded-xl p-3.5 flex flex-col gap-2.5">
                        <p className="text-[13px] text-[#5a4a35] leading-snug">{qa.answer.answerText}</p>
                        <button
                          onClick={() =>
                            play(`qa-${qa.questionId}`, qa.answer!.audioUrl, qa.answer!.answerText, activeLangCode)
                          }
                          className="self-start flex items-center gap-1.5 border border-[#e0d5c0] rounded-full px-3 py-1.5"
                        >
                          {isAnswerPlaying ? (
                            <Pause size={13} color="#c8a96e" />
                          ) : qa.answer.audioUrl ? (
                            <Music size={13} color="#c8a96e" />
                          ) : (
                            <Mic size={13} color="#8c7a5e" />
                          )}
                          <span className="text-[11px] text-[#8c7a5e]">
                            {isAnswerPlaying
                              ? tr("detail_playing", activeLangCode)
                              : qa.answer.audioUrl
                              ? tr("detail_listen_ans", activeLangCode)
                              : tr("detail_tts", activeLangCode)}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
