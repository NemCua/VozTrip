"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Stats = {
  totalSellers: number;
  pendingSellers: number;
  totalPois: number;
  activePois: number;
  totalVisits: number;
  visitsToday: number;
  totalSessions: number;
  totalQrScans: number;
  totalAppOpens: number;
  totalDeviceJoins: number;
  topPois: { poiId: string; poiName: string; count: number }[] | null;
  visitsByDay: { date: string; count: number }[] | null;
  qrScansByDay: { date: string; count: number }[] | null;
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
        <div className="text-xs mt-1" style={{ color: accent ? "#b09878" : "#b09878" }}>{sub}</div>
      )}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: () =>
      api.get("/api/admin/stats", {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      }).then(r => r.data),
    enabled: !!session?.accessToken,
    refetchInterval: 30_000,
  });

  // Build 7-day chart data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const visitMap: Record<string, number> = {};
  stats?.visitsByDay?.forEach(v => { visitMap[v.date.slice(0, 10)] = v.count; });
  const chartData = last7Days.map(date => ({ date, count: visitMap[date] ?? 0 }));
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  const qrMap: Record<string, number> = {};
  stats?.qrScansByDay?.forEach(v => { qrMap[v.date.slice(0, 10)] = v.count; });
  const qrChartData = last7Days.map(date => ({ date, count: qrMap[date] ?? 0 }));
  const qrMaxCount = Math.max(...qrChartData.map(d => d.count), 1);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Overview</div>
        <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Dashboard</h1>
      </div>

      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Loading...</div>
      ) : !stats ? null : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
            <StatCard label="Total Sellers" value={stats.totalSellers} sub={`${stats.pendingSellers} pending`} accent />
            <StatCard label="Total POIs" value={stats.totalPois} sub={`${stats.activePois} active`} />
            <StatCard label="Total Visits" value={stats.totalVisits} sub="all time" />
            <StatCard label="Visits Today" value={stats.visitsToday} />
            <StatCard label="Device Joins" value={stats.totalDeviceJoins} sub="đã thanh toán" accent />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Visit chart — 7 ngày */}
            <div
              className="p-6"
              style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px" }}
            >
              <div className="text-xs tracking-[0.25em] uppercase mb-5" style={{ color: "#8c7a5e" }}>
                Visits — Last 7 Days
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
                      {new Date(date).toLocaleDateString("en", { weekday: "short" })}
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
                Top POIs by Visits
              </div>
              {!stats.topPois || stats.topPois.length === 0 ? (
                <div className="py-8 text-center text-xs tracking-widest uppercase" style={{ color: "#b09878" }}>
                  No visit data yet
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.topPois.map((poi, i) => (
                    <div key={poi.poiId} className="flex items-center gap-3">
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

          {/* Sessions note */}
          <div className="mt-4 text-xs" style={{ color: "#b09878" }}>
            {stats.totalSessions} guest sessions total
          </div>
        </>
      )}
    </div>
  );
}
