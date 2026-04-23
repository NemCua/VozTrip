"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Languages, MapPin, Play, Pause, Radio, ChevronRight } from "lucide-react";
import { getPois, Poi } from "@/services/api";
import { useGpsTriggerQueue } from "@/hooks/useGpsTriggerQueue";
import { useLanguage } from "@/context/LanguageContext";
import { tr } from "@/lib/translations";

const FILTERS = ["all", "near", "popular"] as const;

export default function HomePage() {
  const router = useRouter();
  const { lang, langId } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const sessionId =
    typeof window !== "undefined"
      ? (localStorage.getItem("voz_session") ?? "guest")
      : "guest";

  const { currentPoi, bannerVisible, queueCount, dismiss, play, playing, currentId } =
    useGpsTriggerQueue(langId, lang, sessionId);

  const { data: pois = [], isLoading } = useQuery<Poi[]>({
    queryKey: ["pois", langId],
    queryFn: () => getPois(langId || undefined),
  });

  const filtered = pois.filter((p) =>
    search.length === 0 ||
    (p.localizedName ?? p.poiName).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfaf4]">
      <div className="overflow-y-auto">

        {/* ── Header ── */}
        <div className="flex justify-between items-center px-5 pt-5 pb-3">
          <div>
            <p className="text-[10px] tracking-[2px] text-[#b09060] uppercase">Tourism Guide</p>
            <p className="text-2xl text-[#2c2416] font-light tracking-wide">VozTrip</p>
          </div>
          <button
            onClick={() => router.push("/language")}
            className="w-9 h-9 rounded-full bg-[#f5f0e8] border border-[#e8dfc8] flex items-center justify-center"
          >
            <Languages size={18} color="#6b5c45" />
          </button>
        </div>

        {/* ── Search bar ── */}
        <div className="mx-5 mb-4 flex items-center gap-2 bg-[#f5f0e8] border border-[#e8dfc8] rounded-xl px-3.5 py-2.5">
          <Search size={16} color="#b09878" />
          <input
            className="flex-1 bg-transparent text-sm text-[#2c2416] outline-none placeholder:text-[#b09878]"
            placeholder={tr("home_search", lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search.length > 0 && (
            <button onClick={() => setSearch("")}>
              <X size={16} color="#b09878" />
            </button>
          )}
        </div>

        {/* ── Hero ── */}
        <div className="mx-5 mb-5 rounded-2xl overflow-hidden relative h-48">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.vietnamtourism.gov.vn/vn/images/2019/Hoiantown.jpg"
            alt="hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[rgba(44,36,22,0.42)] p-5 flex flex-col justify-end">
            <p className="text-[10px] text-[#c8a96e] tracking-[2px] mb-1">
              {tr("home_hero_label", lang)}
            </p>
            <p className="text-2xl text-white font-light leading-tight mb-2.5">
              {tr("home_hero_title", lang)}
            </p>
            <div className="flex items-center gap-1 self-start bg-[rgba(200,169,110,0.2)] border border-[rgba(200,169,110,0.6)] rounded-full px-3 py-1">
              <MapPin size={12} color="#f5f0e8" />
              <span className="text-xs text-[#f5f0e8]">
                {filtered.length} {tr("home_places", lang)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex gap-2 px-5 mb-5 overflow-x-auto no-scrollbar">
          {FILTERS.map((key) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`shrink-0 px-4 py-2 rounded-full text-[13px] border transition-colors ${
                activeFilter === key
                  ? "bg-[#2c2416] border-[#2c2416] text-[#f5f0e8]"
                  : "border-[#d8cbb0] text-[#8c7a5e]"
              }`}
            >
              {tr(`home_filter_${key}`, lang)}
            </button>
          ))}
        </div>

        {/* ── List header ── */}
        <div className="flex justify-between items-center px-5 mb-3">
          <p className="text-base font-medium text-[#2c2416]">{tr("home_list_title", lang)}</p>
          <span className="text-xs text-[#b09878]">{filtered.length}</span>
        </div>

        {/* ── POI List ── */}
        <div className="px-5 flex flex-col gap-3.5 pb-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <MapPin size={28} color="#c8a96e" />
              <p className="text-sm text-[#b09878]">{tr("home_loading", lang)}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-10 gap-2">
              <Search size={28} color="#c8a96e" />
              <p className="text-sm text-[#b09878]">{tr("home_empty", lang)}</p>
            </div>
          ) : (
            filtered.map((poi, index) => {
              const isThisPlaying = playing && currentId === poi.poiId;
              return (
                <div
                  key={poi.poiId}
                  onClick={() => router.push(`/poi/${poi.poiId}`)}
                  className="bg-white rounded-2xl overflow-hidden border border-[#e8dfc8] shadow-sm text-left w-full cursor-pointer"
                >
                  {/* Card image */}
                  <div className="relative h-36 bg-[#f5f0e8]">
                    {poi.thumbnailUrl ? (
                      <Image
                        src={poi.thumbnailUrl}
                        alt={poi.poiName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MapPin size={32} color="#d8cbb0" />
                      </div>
                    )}
                    {/* Play button */}
                    <button
                      className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-[#2c2416] flex items-center justify-center shadow-md"
                      onClick={(e) => {
                        e.stopPropagation();
                        play(poi.poiId, null, poi.localizedName ?? poi.poiName, lang);
                      }}
                    >
                      {isThisPlaying ? (
                        <Pause size={16} color="#fdfaf4" />
                      ) : (
                        <Play size={16} color="#fdfaf4" />
                      )}
                    </button>
                  </div>

                  {/* Card body */}
                  <div className="p-3.5">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#fdf6e8] rounded-md px-2 py-0.5 text-[10px] text-[#c8a96e] tracking-wider uppercase">
                          POI
                        </span>
                        <div className="flex items-center gap-1">
                          <MapPin size={11} color="#b09878" />
                          <span className="text-[11px] text-[#b09878]">{poi.triggerRadius}m</span>
                        </div>
                      </div>
                      <span className="text-xs text-[#c8b898] font-medium">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <p className="text-base font-medium text-[#2c2416] mb-0.5">
                      {poi.localizedName ?? poi.poiName}
                    </p>
                    <p className="text-xs text-[#b09878] mb-2.5 truncate">{poi.shopName}</p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1 bg-[#f0fdf4] border border-[#bbf7d0] rounded-full px-2.5 py-1">
                        <Radio size={11} color="#16a34a" />
                        <span className="text-[10px] text-[#16a34a] font-medium">
                          {tr("common_gps_chip", lang)}
                        </span>
                      </div>
                      <ChevronRight size={16} color="#d8cbb0" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── GPS Trigger Banner ── */}
      {currentPoi && (
        <div
          className={`fixed bottom-20 left-4 right-4 max-w-md mx-auto bg-[#2c2416] rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-xl transition-all duration-300 z-40 ${
            bannerVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-9 h-9 rounded-full bg-[rgba(200,169,110,0.15)] border border-[rgba(200,169,110,0.4)] flex items-center justify-center shrink-0">
              <Radio size={18} color="#c8a96e" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#b09878] tracking-wide">{tr("banner_near", lang)}</p>
              <p className="text-sm text-[#f5f0e8] font-medium truncate">{currentPoi.poiName}</p>
              {queueCount > 0 && (
                <p className="text-[10px] text-[#8c7a5e]">+{queueCount} {tr("banner_queued", lang)}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 ml-3 shrink-0">
            <button
              onClick={() => { dismiss(); router.push(`/poi/${currentPoi.poiId}`); }}
              className="bg-[#c8a96e] rounded-lg px-3.5 py-1.5 text-xs font-semibold text-[#2c2416]"
            >
              {tr("banner_view", lang)}
            </button>
            <button onClick={dismiss}>
              <X size={18} color="#8c7a5e" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
