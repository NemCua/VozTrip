"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type SellerStats = {
  totalPois: number;
  activePois: number;
  totalVisits: number;
  visitsToday: number;
  topPois: { poiId: string; poiName: string; count: number }[];
  visitsByDay: { date: string; count: number }[];
};

function StatCard({ label, value, sub, accent }: { label: string; value: number | string; sub?: string; accent?: boolean }) {
  return (
    <div
      className="px-6 py-5"
      style={{
        backgroundColor: accent ? "#2c2416" : "#fdfaf4",
        border: `1px solid ${accent ? "#2c2416" : "#e8dfc8"}`,
        borderRadius: "2px",
      }}
    >
      <div className="text-xs tracking-[0.25em] uppercase mb-2" style={{ color: accent ? "#c8a96e" : "#8c7a5e" }}>
        {label}
      </div>
      <div className="text-3xl font-light" style={{ color: accent ? "#f5f0e8" : "#2c2416", fontFamily: "Georgia, serif" }}>
        {value}
      </div>
      {sub && (
        <div className="text-xs mt-1" style={{ color: "#b09878" }}>{sub}</div>
      )}
    </div>
  );
}

export default function SellerDashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const { data: stats, isLoading } = useQuery<SellerStats>({
    queryKey: ["seller-stats"],
    queryFn: () =>
      api.get("/api/seller/stats", {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      }).then(r => r.data),
    enabled: !!session?.accessToken,
    refetchInterval: 30_000,
  });

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const visitMap: Record<string, number> = {};
  stats?.visitsByDay.forEach(v => {
    visitMap[v.date.slice(0, 10)] = v.count;
  });

  const chartData = last7Days.map(date => ({ date, count: visitMap[date] ?? 0 }));
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>
          {session?.shopName ?? "Shop"}
        </div>
        <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Đang tải...</div>
      ) : !stats ? null : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
            <StatCard label="Tổng POI" value={stats.totalPois} sub={`${stats.activePois} đang hoạt động`} accent />
            <StatCard label="POI active" value={stats.activePois} />
            <StatCard label="Tổng lượt ghé thăm" value={stats.totalVisits} sub="all time" />
            <StatCard label="Hôm nay" value={stats.visitsToday} sub="lượt ghé thăm" />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Visit chart */}
            <div
              className="p-6"
              style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px" }}
            >
              <div className="text-xs tracking-[0.25em] uppercase mb-5" style={{ color: "#8c7a5e" }}>
                Lượt ghé thăm — 7 ngày gần nhất
              </div>
              <div className="flex items-end gap-2 h-32">
                {chartData.map(({ date, count }) => (
                  <div key={date} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-xs" style={{ color: "#c8a96e" }}>{count > 0 ? count : ""}</div>
                    <div
                      style={{
                        width: "100%",
                        height: `${Math.max((count / maxCount) * 96, count > 0 ? 4 : 2)}px`,
                        backgroundColor: count > 0 ? "#c8a96e" : "#e8dfc8",
                        borderRadius: "1px",
                        transition: "height 0.3s",
                      }}
                    />
                    <div className="text-xs" style={{ color: "#b09878" }}>
                      {new Date(date).toLocaleDateString("vi", { weekday: "short" })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top POIs */}
            <div
              className="p-6"
              style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px" }}
            >
              <div className="text-xs tracking-[0.25em] uppercase mb-5" style={{ color: "#8c7a5e" }}>
                POI được ghé thăm nhiều nhất
              </div>
              {stats.topPois.length === 0 ? (
                <div className="py-8 text-center">
                  <div className="text-xs tracking-widest uppercase mb-3" style={{ color: "#b09878" }}>
                    Chưa có dữ liệu lượt thăm
                  </div>
                  <button
                    onClick={() => router.push("/seller/pois")}
                    className="text-xs tracking-widest uppercase"
                    style={{ color: "#c8a96e" }}
                  >
                    Thêm POI →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.topPois.map((poi, i) => (
                    <div
                      key={poi.poiId}
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => router.push(`/seller/pois/${poi.poiId}`)}
                    >
                      <div
                        className="w-6 h-6 flex items-center justify-center text-xs shrink-0"
                        style={{
                          backgroundColor: i === 0 ? "#c8a96e" : "#f0e8d8",
                          color: i === 0 ? "#fff" : "#8c7a5e",
                          borderRadius: "50%",
                          fontFamily: "Georgia, serif",
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate" style={{ color: "#2c2416" }}>{poi.poiName}</div>
                      </div>
                      <div className="text-sm font-medium shrink-0" style={{ color: "#c8a96e" }}>
                        {poi.count}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push("/seller/pois")}
              className="px-5 py-2 text-xs tracking-widest uppercase transition-all"
              style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
              onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#c8a96e")}
              onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#2c2416")}
            >
              Quản lý POI →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
