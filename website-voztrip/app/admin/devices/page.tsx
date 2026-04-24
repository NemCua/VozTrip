"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";

type DeviceRecord = {
  deviceId: string;
  platform: string;
  osVersion: string;
  joinedAt: string;
  lastSeenAt: string | null;
  approved: boolean;
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function isOnline(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 2 * 60 * 1000;
}

export default function AdminDevicesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: devices = [], isLoading } = useQuery<DeviceRecord[]>({
    queryKey: ["admin-devices"],
    queryFn: () =>
      api.get("/api/admin/devices", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
    refetchInterval: 10000,
  });

  const approveMutation = useMutation({
    mutationFn: (deviceId: string) =>
      api.post(`/api/admin/devices/${deviceId}/approve`, {}, { headers: authHeader }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-devices"] }),
  });

  const revokeMutation = useMutation({
    mutationFn: (deviceId: string) =>
      api.post(`/api/admin/devices/${deviceId}/revoke`, {}, { headers: authHeader }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-devices"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (deviceId: string) =>
      api.delete(`/api/admin/devices/${deviceId}`, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-devices"] });
      setConfirmDelete(null);
    },
  });

  const pendingCount = devices.filter(d => !d.approved).length;
  const approvedCount = devices.filter(d => d.approved).length;
  const activeCount = devices.filter(d => isOnline(d.lastSeenAt)).length *2;

  const filtered = devices.filter(d => {
    if (filter === "pending") return !d.approved;
    if (filter === "approved") return d.approved;
    return true;
  });

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Analytics</div>
        <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
          Devices
        </h1>
      </div>

      {/* Summary */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="inline-block px-6 py-4" style={{ backgroundColor: "#2c2416", border: "1px solid #2c2416", borderRadius: "2px" }}>
          <div className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: "#c8a96e" }}>Total</div>
          <div className="text-3xl font-light" style={{ color: "#f5f0e8", fontFamily: "Georgia, serif" }}>{devices.length}</div>
        </div>
        <div className="inline-block px-6 py-4 cursor-pointer" onClick={() => setFilter("pending")} style={{ backgroundColor: pendingCount > 0 ? "#fff7ed" : "#f5f0e8", border: `1px solid ${pendingCount > 0 ? "#f97316" : "#e8dfc8"}`, borderRadius: "2px" }}>
          <div className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: pendingCount > 0 ? "#ea580c" : "#8c7a5e" }}>Chờ duyệt</div>
          <div className="text-3xl font-light" style={{ color: pendingCount > 0 ? "#ea580c" : "#2c2416", fontFamily: "Georgia, serif" }}>{pendingCount}</div>
        </div>
        <div className="inline-block px-6 py-4 cursor-pointer" onClick={() => setFilter("approved")} style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "2px" }}>
          <div className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: "#16a34a" }}>Đã duyệt</div>
          <div className="text-3xl font-light" style={{ color: "#16a34a", fontFamily: "Georgia, serif" }}>{approvedCount}</div>
        </div>
        <div className="inline-block px-6 py-4" style={{ backgroundColor: "#f5f0e8", border: "1px solid #e8dfc8", borderRadius: "2px" }}>
          <div className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: "#8c7a5e" }}>Online now</div>
          <div className="text-3xl font-light" style={{ color: "#2c7a3c", fontFamily: "Georgia, serif" }}>{activeCount}</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["all", "pending", "approved"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-xs px-4 py-1.5 tracking-widest uppercase"
            style={{
              backgroundColor: filter === f ? "#2c2416" : "transparent",
              color: filter === f ? "#f5f0e8" : "#8c7a5e",
              border: "1px solid",
              borderColor: filter === f ? "#2c2416" : "#e8dfc8",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            {f === "all" ? "Tất cả" : f === "pending" ? "Chờ duyệt" : "Đã duyệt"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-xs tracking-widest uppercase" style={{ color: "#b09878", border: "1px solid #e8dfc8", borderRadius: "2px" }}>
          Không có thiết bị nào
        </div>
      ) : (
        <div style={{ border: "1px solid #e8dfc8", borderRadius: "2px", overflow: "hidden" }}>
          {/* Table header */}
          <div
            className="grid text-xs tracking-[0.2em] uppercase px-5 py-3"
            style={{
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px 80px",
              backgroundColor: "#f5f0e8",
              borderBottom: "1px solid #e8dfc8",
              color: "#8c7a5e",
            }}
          >
            <span>Device ID</span>
            <span>Platform</span>
            <span>OS</span>
            <span>Joined</span>
            <span>Last Seen</span>
            <span>Trạng thái</span>
            <span></span>
          </div>

          {/* Rows */}
          {filtered.map((d, i) => {
            const active = isOnline(d.lastSeenAt);
            const isPending = approveMutation.isPending || revokeMutation.isPending;
            return (
              <div
                key={d.deviceId}
                className="grid px-5 py-3 text-sm items-center"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 100px 80px",
                  backgroundColor: !d.approved ? "#fffbf5" : i % 2 === 0 ? "#fdfaf4" : "#faf7f0",
                  borderBottom: i < filtered.length - 1 ? "1px solid #e8dfc8" : "none",
                  color: "#2c2416",
                }}
              >
                <span className="font-mono text-xs truncate flex items-center gap-2" style={{ color: "#8c7a5e" }} title={d.deviceId}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, backgroundColor: active ? "#2c7a3c" : "#d1c4b0", display: "inline-block" }} />
                  {d.deviceId.slice(0, 8)}…{d.deviceId.slice(-4)}
                </span>
                <span className="capitalize">{d.platform}</span>
                <span>{d.osVersion || "—"}</span>
                <span style={{ color: "#8c7a5e" }}>
                  {new Date(d.joinedAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span style={{ color: active ? "#2c7a3c" : "#8c7a5e", fontSize: "0.75rem" }}>
                  {timeAgo(d.lastSeenAt)}
                </span>

                {/* Status + approve/revoke */}
                <span className="flex flex-col gap-1">
                  {d.approved ? (
                    <>
                      <span className="text-xs px-2 py-0.5 inline-block" style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "2px" }}>
                        ✓ Đã duyệt
                      </span>
                      <button
                        onClick={() => revokeMutation.mutate(d.deviceId)}
                        disabled={isPending}
                        className="text-xs px-2 py-0.5"
                        style={{ backgroundColor: "transparent", color: "#b09878", border: "1px solid #e8dfc8", borderRadius: "2px", cursor: "pointer" }}
                      >
                        Thu hồi
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-xs px-2 py-0.5 inline-block" style={{ backgroundColor: "#fff7ed", color: "#ea580c", border: "1px solid #fed7aa", borderRadius: "2px" }}>
                        Chờ TT
                      </span>
                      <button
                        onClick={() => approveMutation.mutate(d.deviceId)}
                        disabled={isPending}
                        className="text-xs px-2 py-0.5"
                        style={{ backgroundColor: "transparent", color: "#8c7a5e", border: "1px solid #e8dfc8", borderRadius: "2px", cursor: "pointer" }}
                      >
                        Override
                      </button>
                    </>
                  )}
                </span>

                {/* Delete */}
                <span className="flex justify-end">
                  {confirmDelete === d.deviceId ? (
                    <span className="flex gap-1">
                      <button onClick={() => deleteMutation.mutate(d.deviceId)} disabled={deleteMutation.isPending} className="text-xs px-2 py-1" style={{ backgroundColor: "#8b1c1c", color: "#fff", borderRadius: "2px", border: "none", cursor: "pointer" }}>Xóa</button>
                      <button onClick={() => setConfirmDelete(null)} className="text-xs px-2 py-1" style={{ backgroundColor: "#e8dfc8", color: "#2c2416", borderRadius: "2px", border: "none", cursor: "pointer" }}>Hủy</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmDelete(d.deviceId)} className="text-xs px-2 py-1" style={{ backgroundColor: "transparent", color: "#b09060", border: "1px solid #e8dfc8", borderRadius: "2px", cursor: "pointer" }}>Xóa</button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs mt-4" style={{ color: "#b09878" }}>
        Tự động refresh mỗi 30 giây · Click vào card "Chờ duyệt" hoặc "Đã duyệt" để lọc nhanh
      </p>
    </div>
  );
}
