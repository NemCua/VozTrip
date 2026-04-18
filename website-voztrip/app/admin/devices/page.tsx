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

function isRecentlyActive(lastSeenAt: string | null): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < 60 * 60 * 1000; // 1 hour
}

export default function AdminDevicesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: devices = [], isLoading } = useQuery<DeviceRecord[]>({
    queryKey: ["admin-devices"],
    queryFn: () =>
      api.get("/api/admin/devices", {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  const deleteMutation = useMutation({
    mutationFn: (deviceId: string) =>
      api.delete(`/api/admin/devices/${deviceId}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-devices"] });
      setConfirmDelete(null);
    },
  });

  const activeCount = devices.filter(d => isRecentlyActive(d.lastSeenAt)).length;

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Analytics</div>
        <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
          Devices
        </h1>
      </div>

      {/* Summary */}
      <div className="flex gap-4 mb-6">
        <div
          className="inline-block px-6 py-4"
          style={{ backgroundColor: "#2c2416", border: "1px solid #2c2416", borderRadius: "2px" }}
        >
          <div className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: "#c8a96e" }}>Total Devices</div>
          <div className="text-3xl font-light" style={{ color: "#f5f0e8", fontFamily: "Georgia, serif" }}>
            {devices.length}
          </div>
        </div>
        <div
          className="inline-block px-6 py-4"
          style={{ backgroundColor: "#f5f0e8", border: "1px solid #e8dfc8", borderRadius: "2px" }}
        >
          <div className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: "#8c7a5e" }}>Active (1h)</div>
          <div className="text-3xl font-light" style={{ color: "#2c7a3c", fontFamily: "Georgia, serif" }}>
            {activeCount}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Loading...</div>
      ) : devices.length === 0 ? (
        <div
          className="py-16 text-center text-xs tracking-widest uppercase"
          style={{ color: "#b09878", border: "1px solid #e8dfc8", borderRadius: "2px" }}
        >
          Chưa có thiết bị nào tham gia
        </div>
      ) : (
        <div style={{ border: "1px solid #e8dfc8", borderRadius: "2px", overflow: "hidden" }}>
          {/* Table header */}
          <div
            className="grid text-xs tracking-[0.2em] uppercase px-5 py-3"
            style={{
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 60px",
              backgroundColor: "#f5f0e8",
              borderBottom: "1px solid #e8dfc8",
              color: "#8c7a5e",
            }}
          >
            <span>Device ID</span>
            <span>Platform</span>
            <span>OS Version</span>
            <span>Joined At</span>
            <span>Last Seen</span>
            <span></span>
          </div>

          {/* Rows */}
          {devices.map((d, i) => {
            const active = isRecentlyActive(d.lastSeenAt);
            return (
              <div
                key={d.deviceId}
                className="grid px-5 py-3 text-sm items-center"
                style={{
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 60px",
                  backgroundColor: i % 2 === 0 ? "#fdfaf4" : "#faf7f0",
                  borderBottom: i < devices.length - 1 ? "1px solid #e8dfc8" : "none",
                  color: "#2c2416",
                }}
              >
                <span className="font-mono text-xs truncate flex items-center gap-2" style={{ color: "#8c7a5e" }} title={d.deviceId}>
                  <span
                    style={{
                      width: 7, height: 7, borderRadius: "50%", flexShrink: 0,
                      backgroundColor: active ? "#2c7a3c" : "#d1c4b0",
                      display: "inline-block",
                    }}
                  />
                  {d.deviceId.slice(0, 8)}…{d.deviceId.slice(-4)}
                </span>
                <span className="capitalize">{d.platform}</span>
                <span>{d.osVersion || "—"}</span>
                <span style={{ color: "#8c7a5e" }}>
                  {new Date(d.joinedAt).toLocaleString("vi-VN", {
                    day: "2-digit", month: "2-digit", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </span>
                <span style={{ color: active ? "#2c7a3c" : "#8c7a5e", fontSize: "0.75rem" }}>
                  {timeAgo(d.lastSeenAt)}
                </span>
                <span className="flex justify-end">
                  {confirmDelete === d.deviceId ? (
                    <span className="flex gap-1">
                      <button
                        onClick={() => deleteMutation.mutate(d.deviceId)}
                        disabled={deleteMutation.isPending}
                        className="text-xs px-2 py-1"
                        style={{ backgroundColor: "#8b1c1c", color: "#fff", borderRadius: "2px", border: "none", cursor: "pointer" }}
                      >
                        Xóa
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className="text-xs px-2 py-1"
                        style={{ backgroundColor: "#e8dfc8", color: "#2c2416", borderRadius: "2px", border: "none", cursor: "pointer" }}
                      >
                        Hủy
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(d.deviceId)}
                      className="text-xs px-2 py-1"
                      style={{ backgroundColor: "transparent", color: "#b09060", border: "1px solid #e8dfc8", borderRadius: "2px", cursor: "pointer" }}
                    >
                      Xóa
                    </button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
