"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { X, Play, Pause, BookOpen, Navigation, ImageIcon } from "lucide-react";
import { getPois, getPoiDetail, Poi, PoiDetail } from "@/services/api";
import { useAudio } from "@/hooks/useAudio";
import { useLanguage } from "@/context/LanguageContext";
import { tr } from "@/lib/translations";

const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), { ssr: false });

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function MapPage() {
  const router = useRouter();
  const { lang, langId } = useLanguage();
  const { play, stop, playing, currentId } = useAudio();

  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<PoiDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelIn, setPanelIn] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { data: pois = [] } = useQuery({
    queryKey: ["pois", langId],
    queryFn: () => getPois(langId || undefined),
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {},
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const showPanel = () => {
    setPanelVisible(true);
    requestAnimationFrame(() => setPanelIn(true));
  };

  const hidePanel = useCallback(() => {
    setPanelIn(false);
    setTimeout(() => {
      setPanelVisible(false);
      setSelectedPoi(null);
      setSelectedDetail(null);
      stop();
    }, 280);
  }, [stop]);

  const handleMarkerClick = async (poi: Poi) => {
    stop();
    setSelectedPoi(poi);
    setSelectedDetail(null);
    setLoadingDetail(true);
    showPanel();
    try {
      const detail = await getPoiDetail(poi.poiId, langId || undefined);
      setSelectedDetail(detail);
    } finally {
      setLoadingDetail(false);
    }
  };

  const localization = selectedDetail?.localizations?.[0];
  const thumbnail = selectedDetail?.media?.[0]?.mediaUrl ?? null;
  const distance =
    userCoords && selectedPoi
      ? haversine(userCoords.lat, userCoords.lng, selectedPoi.latitude, selectedPoi.longitude)
      : null;
  const isCurrentPlaying = playing && currentId === selectedPoi?.poiId;

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-[#f5f0e8]">
      {/* Map */}
      <LeafletMap
        pois={pois}
        selectedPoiId={selectedPoi?.poiId ?? null}
        userCoords={userCoords}
        onMarkerClick={handleMarkerClick}
      />

      {/* Slide-up panel */}
      {panelVisible && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#fdfaf4] rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
            panelIn ? "translate-y-0" : "translate-y-full"
          } z-1000`}
        >
          {/* Handle */}
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#d8cbb0]" />
          </div>

          {/* Close */}
          <button
            onClick={hidePanel}
            className="absolute top-2.5 right-4 p-1"
          >
            <X size={20} color="#b09878" />
          </button>

          {selectedPoi && (
            <div className="px-5 pt-2 pb-6 flex flex-col gap-3">
              {/* Info row */}
              <div className="flex gap-3.5 items-center">
                {/* Thumbnail */}
                <div className="w-19 h-19 rounded-xl bg-[#f0e8d8] overflow-hidden shrink-0 flex items-center justify-center">
                  {loadingDetail ? (
                    <div className="w-5 h-5 border-2 border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
                  ) : thumbnail ? (
                    <Image src={thumbnail} alt="" width={76} height={76} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <ImageIcon size={28} color="#d8cbb0" />
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <p className="text-base font-semibold text-[#2c2416] leading-snug line-clamp-2">
                    {localization?.title ?? selectedPoi.poiName}
                  </p>
                  <p className="text-xs text-[#b09878] truncate">{selectedPoi.shopName}</p>
                  {distance !== null && (
                    <div className="flex items-center gap-1 mt-1">
                      <Navigation size={12} color="#b09060" />
                      <span className="text-xs text-[#b09060]">
                        {distance < 1000
                          ? `~${Math.round(distance)}m ${tr("map_from_you", lang)}`
                          : `~${(distance / 1000).toFixed(1)}km ${tr("map_from_you", lang)}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description preview */}
              {!loadingDetail && localization?.description && (
                <p className="text-[13px] text-[#6b5c45] leading-snug line-clamp-2">
                  {localization.description}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2.5">
                <button
                  disabled={loadingDetail}
                  onClick={() =>
                    play(
                      selectedPoi.poiId,
                      localization?.audioUrl,
                      localization?.description ?? selectedPoi.poiName,
                      lang
                    )
                  }
                  className="flex-1 flex items-center justify-center gap-2 bg-[#c8a96e] rounded-xl py-3 disabled:opacity-50"
                >
                  {isCurrentPlaying ? <Pause size={18} color="#fff" /> : <Play size={18} color="#fff" />}
                  <span className="text-sm font-semibold text-white">
                    {isCurrentPlaying ? tr("map_pause", lang) : tr("map_listen", lang)}
                  </span>
                </button>

                <button
                  onClick={() => { stop(); hidePanel(); router.push(`/poi/${selectedPoi.poiId}`); }}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#f0e8d8] rounded-xl py-3"
                >
                  <BookOpen size={18} color="#2c2416" />
                  <span className="text-sm font-semibold text-[#2c2416]">{tr("map_detail", lang)}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
