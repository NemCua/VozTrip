"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { X, Play, Pause, BookOpen, Navigation, ImageIcon, Radio } from "lucide-react";
import { getPois, getPoiDetail, Poi, PoiDetail } from "@/services/api";
import { useGpsTriggerQueue } from "@/hooks/useGpsTriggerQueue";
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

  const [selectedPoi, setSelectedPoi] = useState<Poi | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<PoiDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelIn, setPanelIn] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [flyToTrigger, setFlyToTrigger] = useState(0);
  const [gpsStatus, setGpsStatus] = useState<"searching" | "active" | "denied">("searching");

  const sessionId =
    typeof window !== "undefined"
      ? (localStorage.getItem("voz_session") ?? "guest")
      : "guest";

  const { currentPoi, bannerVisible, queueCount, dismiss, play, stop, playing, currentId } =
    useGpsTriggerQueue(langId, lang, sessionId);

  const { data: pois = [] } = useQuery({
    queryKey: ["pois", langId],
    queryFn: () => getPois(langId || undefined),
  });

  // Watch GPS for showing user dot on map
  useEffect(() => {
    if (!navigator.geolocation) { setGpsStatus("denied"); return; }
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsStatus("active");
      },
      () => setGpsStatus("denied"),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 15_000 }
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
        flyToTrigger={flyToTrigger}
        onMarkerClick={handleMarkerClick}
      />

      {/* GPS status + Recenter button — outside MapContainer */}
      <div className="absolute right-4 bottom-36 z-1100 flex flex-col items-center gap-2">
        {/* Status chip */}
        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium shadow-sm border ${
          gpsStatus === "active"
            ? "bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]"
            : gpsStatus === "denied"
            ? "bg-[#fef2f2] border-[#fecaca] text-[#dc2626]"
            : "bg-white border-[#e8dfc8] text-[#8c7a5e]"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            gpsStatus === "active" ? "bg-[#16a34a]" :
            gpsStatus === "denied" ? "bg-[#dc2626]" :
            "bg-[#c8a96e] animate-pulse"
          }`} />
          {gpsStatus === "active" ? "GPS" : gpsStatus === "denied" ? "GPS tắt" : "Đang tìm..."}
        </div>

        {/* Recenter button */}
        <button
          onClick={() => {
            if (gpsStatus === "denied") {
              alert("Vui lòng bật GPS và cấp quyền vị trí cho trình duyệt.");
              return;
            }
            setFlyToTrigger(t => t + 1);
          }}
          className={`w-11 h-11 rounded-full bg-white border shadow-md flex items-center justify-center transition-opacity ${
            gpsStatus === "denied" ? "border-[#fecaca] opacity-50" : "border-[#e8dfc8]"
          }`}
          title="Về vị trí của tôi"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={gpsStatus === "denied" ? "#dc2626" : "#2c2416"}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
            <circle cx="12" cy="12" r="10" opacity=".15"
              fill={gpsStatus === "denied" ? "#dc2626" : "#2c2416"} stroke="none"/>
          </svg>
        </button>
      </div>

      {/* GPS Trigger Banner */}
      {currentPoi && (
        <div
          className={`absolute top-4 left-4 right-4 max-w-md mx-auto bg-[#2c2416] rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-xl transition-all duration-300 z-1100 ${
            bannerVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
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
              onClick={() => {
                dismiss();
                const poi = pois.find(p => p.poiId === currentPoi.poiId);
                if (poi) handleMarkerClick(poi);
                else router.push(`/poi/${currentPoi.poiId}`);
              }}
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

      {/* Slide-up panel */}
      {panelVisible && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-[#fdfaf4] rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
            panelIn ? "translate-y-0" : "translate-y-full"
          } z-1000`}
        >
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#d8cbb0]" />
          </div>

          <button onClick={hidePanel} className="absolute top-2.5 right-4 p-1">
            <X size={20} color="#b09878" />
          </button>

          {selectedPoi && (
            <div className="px-5 pt-2 pb-6 flex flex-col gap-3">
              <div className="flex gap-3.5 items-center">
                <div className="w-19 h-19 rounded-xl bg-[#f0e8d8] overflow-hidden shrink-0 flex items-center justify-center">
                  {loadingDetail ? (
                    <div className="w-5 h-5 border-2 border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
                  ) : thumbnail ? (
                    <Image src={thumbnail} alt="" width={76} height={76} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <ImageIcon size={28} color="#d8cbb0" />
                  )}
                </div>

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

              {!loadingDetail && localization?.description && (
                <p className="text-[13px] text-[#6b5c45] leading-snug line-clamp-2">
                  {localization.description}
                </p>
              )}

              <div className="flex gap-2.5">
                <button
                  disabled={loadingDetail}
                  onClick={() => play(
                    selectedPoi.poiId,
                    localization?.audioUrl,
                    localization?.description ?? selectedPoi.poiName,
                    lang
                  )}
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
