"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type AdminPoi = {
  poiId: string;
  poiName: string;
  latitude: number;
  longitude: number;
  triggerRadius: number;
  isActive: boolean;
  createdAt: string;
  zoneName: string | null;
  shopName: string;
  sellerId: string;
  localizationCount: number;
  visitCount: number;
};

export default function AdminPoisPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: pois = [], isLoading } = useQuery<AdminPoi[]>({
    queryKey: ["admin-pois"],
    queryFn: () => api.get("/api/admin/pois", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const toggleMutation = useMutation({
    mutationFn: (poiId: string) =>
      api.put(`/api/admin/pois/${poiId}/toggle`, null, { headers: authHeader }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-pois"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (poiId: string) =>
      api.delete(`/api/admin/pois/${poiId}`, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pois"] });
      setConfirmDelete(null);
    },
  });

  const filtered = pois.filter(p => {
    const matchSearch =
      p.poiName.toLowerCase().includes(search.toLowerCase()) ||
      p.shopName.toLowerCase().includes(search.toLowerCase()) ||
      (p.zoneName ?? "").toLowerCase().includes(search.toLowerCase());
    const matchActive =
      filterActive === "all" ||
      (filterActive === "active" && p.isActive) ||
      (filterActive === "inactive" && !p.isActive);
    return matchSearch && matchActive;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Management</div>
        <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
          All POIs
        </h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input
          className="px-3 py-2 text-sm outline-none"
          style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416", minWidth: "220px" }}
          placeholder="Search by name, shop, zone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="flex" style={{ border: "1px solid #d8cbb0", borderRadius: "2px" }}>
          {(["all", "active", "inactive"] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setFilterActive(opt)}
              className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
              style={{
                backgroundColor: filterActive === opt ? "#2c2416" : "#fdfaf4",
                color: filterActive === opt ? "#f5f0e8" : "#8c7a5e",
              }}
            >
              {opt}
            </button>
          ))}
        </div>

        <span className="text-xs ml-auto" style={{ color: "#8c7a5e" }}>
          {filtered.length} / {pois.length} POIs
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-xs tracking-widest uppercase" style={{ color: "#b09878" }}>
          No POIs found
        </div>
      ) : (
        <div className="space-y-2">
          {/* Column header */}
          <div
            className="px-5 py-2 grid items-center text-xs tracking-widest uppercase"
            style={{ color: "#b09878", gridTemplateColumns: "1fr 1fr 80px 60px 80px 160px" }}
          >
            <span>POI</span>
            <span>Seller / Zone</span>
            <span>Languages</span>
            <span>Visits</span>
            <span>Status</span>
            <span></span>
          </div>

          {filtered.map(poi => (
            <div
              key={poi.poiId}
              className="px-5 py-4 grid items-center gap-2"
              style={{
                backgroundColor: "#fdfaf4",
                border: "1px solid #e8dfc8",
                borderRadius: "2px",
                gridTemplateColumns: "1fr 1fr 80px 60px 80px 160px",
              }}
            >
              {/* POI name */}
              <div>
                <div className="text-sm font-medium truncate" style={{ color: "#2c2416" }}>{poi.poiName}</div>
                <div className="text-xs mt-0.5" style={{ color: "#b09878" }}>
                  {poi.latitude.toFixed(4)}, {poi.longitude.toFixed(4)} · GPS {poi.triggerRadius}m
                </div>
              </div>

              {/* Seller / Zone */}
              <div>
                <div className="text-xs truncate" style={{ color: "#2c2416" }}>{poi.shopName}</div>
                {poi.zoneName && (
                  <div
                    className="inline-block text-xs px-2 py-0.5 mt-1"
                    style={{ backgroundColor: "#fdf6e8", color: "#c8a96e", border: "1px solid #e8d5a8", borderRadius: "2px" }}
                  >
                    {poi.zoneName}
                  </div>
                )}
              </div>

              {/* Localizations */}
              <div
                className="text-sm text-center"
                style={{ color: poi.localizationCount > 0 ? "#16a34a" : "#b09878" }}
              >
                {poi.localizationCount}
              </div>

              {/* Visits */}
              <div className="text-sm text-center" style={{ color: "#c8a96e", fontFamily: "Georgia, serif" }}>
                {poi.visitCount}
              </div>

              {/* Status badge */}
              <div>
                <span
                  className="text-xs px-2 py-1"
                  style={{
                    backgroundColor: poi.isActive ? "#f0fdf4" : "#f5f5f5",
                    color: poi.isActive ? "#16a34a" : "#6b7280",
                    border: `1px solid ${poi.isActive ? "#bbf7d0" : "#e5e7eb"}`,
                    borderRadius: "2px",
                  }}
                >
                  {poi.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleMutation.mutate(poi.poiId)}
                  disabled={toggleMutation.isPending}
                  className="px-3 py-1.5 text-xs tracking-widest uppercase transition-all"
                  style={{
                    border: `1px solid ${poi.isActive ? "#d8cbb0" : "#c8a96e"}`,
                    color: poi.isActive ? "#8c7a5e" : "#c8a96e",
                    borderRadius: "1px",
                  }}
                  onMouseEnter={e => {
                    (e.target as HTMLElement).style.borderColor = poi.isActive ? "#dc2626" : "#2c2416";
                    (e.target as HTMLElement).style.color = poi.isActive ? "#dc2626" : "#2c2416";
                  }}
                  onMouseLeave={e => {
                    (e.target as HTMLElement).style.borderColor = poi.isActive ? "#d8cbb0" : "#c8a96e";
                    (e.target as HTMLElement).style.color = poi.isActive ? "#8c7a5e" : "#c8a96e";
                  }}
                >
                  {poi.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => setConfirmDelete(poi.poiId)}
                  className="px-3 py-1.5 text-xs tracking-widest uppercase transition-all"
                  style={{ border: "1px solid #fecaca", color: "#dc2626", borderRadius: "1px" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (() => {
        const poi = pois.find(p => p.poiId === confirmDelete);
        return (
          <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="p-8 w-full max-w-sm" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8" }}>
              <div className="text-sm font-medium mb-2" style={{ color: "#2c2416" }}>Xóa POI này?</div>
              <div className="text-xs mb-6" style={{ color: "#8c7a5e" }}>
                Xóa <strong>{poi?.poiName}</strong> sẽ xóa toàn bộ media, nội dung và Q&A. Không thể hoàn tác.
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => deleteMutation.mutate(confirmDelete)}
                  disabled={deleteMutation.isPending}
                  className="flex-1 py-2 text-xs tracking-widest uppercase"
                  style={{ backgroundColor: "#dc2626", color: "#fff", borderRadius: "1px" }}
                >
                  {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2 text-xs tracking-widest uppercase"
                  style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
