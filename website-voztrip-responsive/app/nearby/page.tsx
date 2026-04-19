"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Locate, MapPin, Play, Pause, Radio, ImageIcon, Navigation } from "lucide-react";
import { getPois, Poi } from "@/services/api";
import { useAudio } from "@/hooks/useAudio";
import { useLanguage } from "@/context/LanguageContext";
import { tr } from "@/lib/translations";

type PoiWithDist = Poi & { distance: number | null };

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

function formatDist(m: number) {
  return m < 1000 ? `${Math.round(m)}m` : `${(m / 1000).toFixed(1)}km`;
}

export default function NearbyPage() {
  const router = useRouter();
  const { lang, langId } = useLanguage();
  const { play, playing, currentId } = useAudio();

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locError, setLocError] = useState(false);

  const { data: pois = [], isLoading } = useQuery<Poi[]>({
    queryKey: ["pois", langId],
    queryFn: () => getPois(langId || undefined),
  });

  useEffect(() => {
    if (!navigator.geolocation) { setLocError(true); return; }
    const id = navigator.geolocation.watchPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocError(true),
      { enableHighAccuracy: true, maximumAge: 10000 }
    );
    return () => navigator.geolocation.clearWatch(id);
  }, []);

  const sorted: PoiWithDist[] = pois
    .map((p) => ({
      ...p,
      distance: userCoords
        ? haversine(userCoords.lat, userCoords.lng, p.latitude, p.longitude)
        : null,
    }))
    .sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;
      return a.distance - b.distance;
    });

  return (
    <div className="min-h-screen bg-[#fdfaf4]">

      {/* Header */}
      <div className="flex justify-between items-center px-5 pt-5 pb-3.5">
        <div>
          <p className="text-[10px] text-[#b09060] tracking-[2px] uppercase">{tr("nearby_sub", lang)}</p>
          <p className="text-2xl text-[#2c2416] font-light tracking-wide">{tr("tab_nearby", lang)}</p>
        </div>
        {locError ? (
          <div className="flex items-center gap-1.5 bg-[#fdf6e8] border border-[#e8d5a8] rounded-full px-3 py-1.5">
            <MapPin size={13} color="#c8a96e" />
            <span className="text-[11px] text-[#8c7a5e]">GPS off</span>
          </div>
        ) : userCoords ? (
          <div className="flex items-center gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-full px-3 py-1.5">
            <Locate size={13} color="#16a34a" />
            <span className="text-[11px] text-[#16a34a] font-medium">{tr("nearby_locating", lang)}</span>
          </div>
        ) : (
          <div className="w-5 h-5 border-2 border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <div className="h-px bg-[#e8dfc8] mx-5 mb-1" />

      {/* Location error banner */}
      {locError && (
        <div className="mx-5 mt-3 flex items-center gap-2.5 bg-[#fdf6e8] border border-[#e8d5a8] rounded-xl px-3.5 py-3">
          <MapPin size={18} color="#c8a96e" className="shrink-0" />
          <p className="text-[13px] text-[#8c7a5e]">{tr("nearby_no_perm", lang)}</p>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <div className="w-8 h-8 border-2 border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#b09878]">{tr("home_loading", lang)}</p>
        </div>
      ) : (
        <div className="px-5 pb-6">
          {/* List hint */}
          <p className="text-xs text-[#b09878] py-3">
            {sorted.length} · {tr("nearby_hint", lang)}
          </p>

          {/* POI list */}
          <div className="flex flex-col gap-2.5">
            {sorted.map((poi, index) => {
              const isPlaying = playing && currentId === poi.poiId;
              const isClose = poi.distance !== null && poi.distance <= poi.triggerRadius;

              return (
                <div
                  key={poi.poiId}
                  onClick={() => router.push(`/poi/${poi.poiId}`)}
                  className="flex items-center gap-3 bg-white border border-[#e8dfc8] rounded-2xl p-3 shadow-sm text-left w-full cursor-pointer"
                >
                  {/* Rank */}
                  <span className="w-6 text-center text-[13px] text-[#c8b898] font-semibold shrink-0">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Thumbnail */}
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f5f0e8] flex items-center justify-center">
                      {poi.thumbnailUrl ? (
                        <Image
                          src={poi.thumbnailUrl}
                          alt={poi.poiName}
                          width={64}
                          height={64}
                          className="object-cover w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <ImageIcon size={22} color="#d8cbb0" />
                      )}
                    </div>
                    {/* Close badge */}
                    {isClose && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#16a34a] border-2 border-white flex items-center justify-center">
                        <Radio size={8} color="#fff" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <p className="text-[15px] font-medium text-[#2c2416] truncate">
                      {poi.localizedName ?? poi.poiName}
                    </p>
                    <p className="text-xs text-[#b09878] truncate">{poi.shopName}</p>

                    {/* Distance chip */}
                    <div className="mt-1">
                      {poi.distance !== null ? (
                        <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                          isClose
                            ? "bg-[#f0fdf4] border border-[#bbf7d0]"
                            : "bg-[#fdf6e8]"
                        }`}>
                          <Navigation size={10} color={isClose ? "#16a34a" : "#b09060"} />
                          <span className={`text-[11px] font-medium ${isClose ? "text-[#16a34a]" : "text-[#b09060]"}`}>
                            {formatDist(poi.distance)} {tr("nearby_from_you", lang)}
                          </span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 bg-[#fdf6e8] rounded-full px-2 py-0.5">
                          <MapPin size={10} color="#b09060" />
                          <span className="text-[11px] text-[#b09060]">
                            {tr("nearby_locating_dist", lang)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Play button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      play(poi.poiId, null, poi.localizedName ?? poi.poiName, lang);
                    }}
                    className="w-9 h-9 rounded-full bg-[#f5f0e8] flex items-center justify-center shrink-0"
                  >
                    {isPlaying
                      ? <Pause size={15} color="#c8a96e" />
                      : <Play size={15} color="#8c7a5e" />
                    }
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
