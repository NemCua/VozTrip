"use client";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import dynamic from "next/dynamic";
import type { PoiMapItem } from "./MapView";

const MapView = dynamic(() => import("./MapView"), { ssr: false, loading: () => (
  <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#f0ebe0" }}>
    <div className="w-8 h-8 border-2 border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
  </div>
)});

const LEGEND = [
  { color: "#dc2626", label: "≥ 20 lượt — rất đông" },
  { color: "#ea580c", label: "10–19 lượt — đông" },
  { color: "#ca8a04", label: "5–9 lượt — bình thường" },
  { color: "#16a34a", label: "1–4 lượt — ít" },
  { color: "#94a3b8", label: "0 lượt — chưa có ai" },
];

export default function AdminMapPage() {
  const { data: session } = useSession();

  const { data: pois = [], isLoading } = useQuery<PoiMapItem[]>({
    queryKey: ["admin-map-pois"],
    queryFn: async () => {
      const res = await api.get("/api/admin/map/pois", {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      return res.data;
    },
    enabled: !!session?.accessToken,
    refetchInterval: 60_000,
  });

  const totalVisits = pois.reduce((s, p) => s + p.visits24h, 0);
  const hotPois = pois.filter(p => p.visits24h >= 10).length;

  return (
    <div className="flex flex-col gap-5 h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-light tracking-tight" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
          POI Map
        </h1>
        <p className="text-xs mt-1" style={{ color: "#8c7a5e" }}>
          Lượt visit 24h gần nhất — tự động refresh mỗi 60s
        </p>
      </div>

      {/* Stats row */}
      <div className="flex gap-4">
        {[
          { label: "Tổng POI", value: pois.length },
          { label: "Tổng visit 24h", value: totalVisits },
          { label: "POI đông người (≥10)", value: hotPois },
        ].map(s => (
          <div key={s.label} className="flex-1 rounded-lg px-4 py-3" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8" }}>
            <div className="text-xs tracking-wider uppercase mb-1" style={{ color: "#b09878" }}>{s.label}</div>
            <div className="text-2xl font-light" style={{ color: "#2c2416" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Map + legend */}
      <div className="flex gap-4 flex-1 min-h-0">
        <div className="flex-1 rounded-xl overflow-hidden" style={{ minHeight: 480, border: "1px solid #e8dfc8" }}>
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#f0ebe0" }}>
              <div className="w-8 h-8 border-2 border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <MapView pois={pois} />
          )}
        </div>

        {/* Legend + POI list */}
        <div className="w-60 flex flex-col gap-4">
          {/* Legend */}
          <div className="rounded-lg p-4" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8" }}>
            <div className="text-xs tracking-wider uppercase mb-3" style={{ color: "#b09878" }}>Chú thích</div>
            <div className="space-y-2">
              {LEGEND.map(l => (
                <div key={l.color} className="flex items-center gap-2">
                  <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: l.color, flexShrink: 0 }} />
                  <span className="text-xs" style={{ color: "#2c2416" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top POIs */}
          <div className="rounded-lg p-4 flex-1 overflow-auto" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8" }}>
            <div className="text-xs tracking-wider uppercase mb-3" style={{ color: "#b09878" }}>Top POIs</div>
            <div className="space-y-2">
              {[...pois]
                .sort((a, b) => b.visits24h - a.visits24h)
                .slice(0, 15)
                .map((p, i) => (
                  <div key={p.poiId} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs w-4 text-right flex-shrink-0" style={{ color: "#b09878" }}>{i + 1}.</span>
                      <span className="text-xs truncate" style={{ color: "#2c2416" }}>{p.poiName}</span>
                    </div>
                    <span
                      className="text-xs font-bold flex-shrink-0"
                      style={{ color: p.visits24h >= 10 ? "#dc2626" : p.visits24h >= 5 ? "#ca8a04" : "#8c7a5e" }}
                    >
                      {p.visits24h}
                    </span>
                  </div>
                ))}
              {pois.length === 0 && !isLoading && (
                <p className="text-xs" style={{ color: "#b09878" }}>Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
