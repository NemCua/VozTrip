"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type MediaItem = {
  mediaId: string;
  mediaType: string;
  mediaUrl: string;
  sortOrder: number;
  poi: {
    poiId: string;
    poiName: string;
    isActive: boolean;
    createdAt: string;
  };
  owner: {
    userId: string;
    username: string;
    fullName: string | null;
    isActive: boolean;
    shopName: string;
    plan: string;
  };
};

type PoiDetail = {
  poiId: string;
  poiName: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  createdAt: string;
  zone: { zoneId: string; zoneName: string } | null;
  owner: {
    userId: string;
    username: string;
    fullName: string | null;
    email: string | null;
    isActive: boolean;
    createdAt: string;
    shopName: string;
    contactPhone: string | null;
    plan: string;
    approvedAt: string | null;
  };
  media: { mediaId: string; mediaType: string; mediaUrl: string; sortOrder: number }[];
  localizations: { languageCode: string; languageName: string; title: string | null; description: string | null }[];
};

export default function AdminMediaPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<"all" | "image" | "video">("all");
  const [selectedPoi, setSelectedPoi] = useState<string | null>(null);
  const [confirmDeleteMedia, setConfirmDeleteMedia] = useState<string | null>(null);

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: mediaList = [], isLoading } = useQuery<MediaItem[]>({
    queryKey: ["admin-media"],
    queryFn: () => api.get("/api/admin/media", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  const { data: poiDetail, isLoading: isLoadingPoi } = useQuery<PoiDetail>({
    queryKey: ["admin-poi-detail", selectedPoi],
    queryFn: () => api.get(`/api/admin/pois/${selectedPoi}`, { headers: authHeader }).then(r => r.data),
    enabled: !!selectedPoi && !!session?.accessToken,
  });

  const deleteMediaMutation = useMutation({
    mutationFn: (mediaId: string) =>
      api.delete(`/api/admin/media/${mediaId}`, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      if (selectedPoi) queryClient.invalidateQueries({ queryKey: ["admin-poi-detail", selectedPoi] });
      setConfirmDeleteMedia(null);
    },
  });

  const toggleUserMutation = useMutation({
    mutationFn: (userId: string) =>
      api.put(`/api/admin/users/${userId}/toggle`, null, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      if (selectedPoi) queryClient.invalidateQueries({ queryKey: ["admin-poi-detail", selectedPoi] });
    },
  });

  const togglePoiMutation = useMutation({
    mutationFn: (poiId: string) =>
      api.put(`/api/admin/pois/${poiId}/toggle`, null, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-media"] });
      if (selectedPoi) queryClient.invalidateQueries({ queryKey: ["admin-poi-detail", selectedPoi] });
    },
  });

  const filtered = mediaList.filter(m =>
    typeFilter === "all" || m.mediaType === typeFilter
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Moderation</div>
        <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Media</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex" style={{ border: "1px solid #d8cbb0", borderRadius: "2px" }}>
          {(["all", "image", "video"] as const).map(opt => (
            <button
              key={opt}
              onClick={() => setTypeFilter(opt)}
              className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
              style={{
                backgroundColor: typeFilter === opt ? "#2c2416" : "#fdfaf4",
                color: typeFilter === opt ? "#f5f0e8" : "#8c7a5e",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
        <span className="text-xs ml-auto" style={{ color: "#8c7a5e" }}>
          {filtered.length} files
        </span>
      </div>

      {/* Gallery grid */}
      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-xs tracking-widest uppercase" style={{ color: "#b09878" }}>
          No media found
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
          {filtered.map(item => (
            <div
              key={item.mediaId}
              className="group relative cursor-pointer"
              style={{ border: "1px solid #e8dfc8", borderRadius: "2px", overflow: "hidden", backgroundColor: "#fdfaf4" }}
              onClick={() => setSelectedPoi(item.poi.poiId)}
            >
              {/* Thumbnail */}
              <div className="relative" style={{ paddingTop: "75%", backgroundColor: "#f0e8d8" }}>
                {item.mediaType === "video" ? (
                  <video
                    src={item.mediaUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    muted
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.mediaUrl}
                    alt={item.poi.poiName}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Overlay on hover */}
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ backgroundColor: "rgba(44,36,22,0.6)" }}
                >
                  <span className="text-xs tracking-widest uppercase" style={{ color: "#f5f0e8" }}>View Details</span>
                </div>

                {/* Video badge */}
                {item.mediaType === "video" && (
                  <div
                    className="absolute top-2 left-2 text-xs px-2 py-0.5"
                    style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", borderRadius: "2px" }}
                  >
                    Video
                  </div>
                )}

                {/* Inactive POI badge */}
                {!item.poi.isActive && (
                  <div
                    className="absolute top-2 right-2 text-xs px-2 py-0.5"
                    style={{ backgroundColor: "#dc2626", color: "#fff", borderRadius: "2px" }}
                  >
                    POI Off
                  </div>
                )}

                {/* Locked owner badge */}
                {!item.owner.isActive && (
                  <div
                    className="absolute bottom-2 left-2 text-xs px-2 py-0.5"
                    style={{ backgroundColor: "#dc2626", color: "#fff", borderRadius: "2px" }}
                  >
                    Locked
                  </div>
                )}
              </div>

              {/* Info footer */}
              <div className="px-3 py-2">
                <div className="text-xs font-medium truncate" style={{ color: "#2c2416" }}>{item.poi.poiName}</div>
                <div className="text-xs truncate mt-0.5" style={{ color: "#8c7a5e" }}>{item.owner.shopName}</div>
              </div>

              {/* Quick delete button */}
              <button
                className="absolute top-2 right-2 w-6 h-6 hidden group-hover:flex items-center justify-center text-xs transition-all z-10"
                style={{ backgroundColor: "#dc2626", color: "#fff", borderRadius: "50%" }}
                onClick={e => {
                  e.stopPropagation();
                  setConfirmDeleteMedia(item.mediaId);
                }}
                title="Delete this media"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* POI Detail modal */}
      {selectedPoi && (
        <div
          className="fixed inset-0 flex items-start justify-end z-50 p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSelectedPoi(null)}
        >
          <div
            className="w-full max-w-lg h-full overflow-y-auto"
            style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8" }}
            onClick={e => e.stopPropagation()}
          >
            {isLoadingPoi || !poiDetail ? (
              <div className="p-8 text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Loading...</div>
            ) : (
              <div className="p-6 space-y-5">
                {/* Close */}
                <div className="flex items-center justify-between">
                  <div className="text-xs tracking-[0.25em] uppercase" style={{ color: "#b09060" }}>POI Detail</div>
                  <button
                    onClick={() => setSelectedPoi(null)}
                    className="text-sm"
                    style={{ color: "#8c7a5e" }}
                  >
                    ✕
                  </button>
                </div>

                {/* POI info */}
                <div style={{ borderBottom: "1px solid #e8dfc8", paddingBottom: "16px" }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h2 className="text-lg font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
                      {poiDetail.poiName}
                    </h2>
                    <span
                      className="text-xs px-2 py-1 shrink-0"
                      style={{
                        backgroundColor: poiDetail.isActive ? "#f0fdf4" : "#fee2e2",
                        color: poiDetail.isActive ? "#16a34a" : "#991b1b",
                        borderRadius: "2px",
                      }}
                    >
                      {poiDetail.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="text-xs space-y-1" style={{ color: "#8c7a5e" }}>
                    <div>{poiDetail.latitude.toFixed(5)}, {poiDetail.longitude.toFixed(5)}</div>
                    {poiDetail.zone && <div>Zone: {poiDetail.zone.zoneName}</div>}
                    <div>Created: {new Date(poiDetail.createdAt).toLocaleDateString("vi-VN")}</div>
                    <div>{poiDetail.localizations.length} language(s) · {poiDetail.media.length} media file(s)</div>
                  </div>

                  <button
                    onClick={() => togglePoiMutation.mutate(poiDetail.poiId)}
                    disabled={togglePoiMutation.isPending}
                    className="mt-3 px-4 py-2 text-xs tracking-widest uppercase transition-all"
                    style={{
                      border: `1px solid ${poiDetail.isActive ? "#dc2626" : "#c8a96e"}`,
                      color: poiDetail.isActive ? "#dc2626" : "#c8a96e",
                      borderRadius: "1px",
                    }}
                  >
                    {poiDetail.isActive ? "Deactivate POI" : "Activate POI"}
                  </button>
                </div>

                {/* Owner info */}
                <div style={{ borderBottom: "1px solid #e8dfc8", paddingBottom: "16px" }}>
                  <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "#b09878" }}>Owner</div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="text-sm font-medium" style={{ color: "#2c2416" }}>
                        {poiDetail.owner.shopName}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#8c7a5e" }}>
                        @{poiDetail.owner.username}
                        {poiDetail.owner.fullName && ` · ${poiDetail.owner.fullName}`}
                      </div>
                      <div className="text-xs mt-0.5" style={{ color: "#b09878" }}>
                        {poiDetail.owner.email ?? "—"}
                        {poiDetail.owner.contactPhone && ` · ${poiDetail.owner.contactPhone}`}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className="text-xs px-2 py-0.5"
                        style={{
                          backgroundColor: poiDetail.owner.isActive ? "#f0fdf4" : "#fee2e2",
                          color: poiDetail.owner.isActive ? "#16a34a" : "#991b1b",
                          borderRadius: "2px",
                        }}
                      >
                        {poiDetail.owner.isActive ? "Active" : "Locked"}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5"
                        style={{
                          backgroundColor: poiDetail.owner.plan === "vip" ? "#fef3c7" : "#f5f5f5",
                          color: poiDetail.owner.plan === "vip" ? "#92400e" : "#6b7280",
                          borderRadius: "2px",
                        }}
                      >
                        {poiDetail.owner.plan === "vip" ? "VIP" : "Free"}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleUserMutation.mutate(poiDetail.owner.userId)}
                    disabled={toggleUserMutation.isPending}
                    className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
                    style={{
                      border: `1px solid ${poiDetail.owner.isActive ? "#dc2626" : "#c8a96e"}`,
                      color: poiDetail.owner.isActive ? "#dc2626" : "#c8a96e",
                      borderRadius: "1px",
                    }}
                  >
                    {poiDetail.owner.isActive ? "Lock Account" : "Unlock Account"}
                  </button>
                </div>

                {/* Languages */}
                {poiDetail.localizations.length > 0 && (
                  <div style={{ borderBottom: "1px solid #e8dfc8", paddingBottom: "16px" }}>
                    <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "#b09878" }}>Languages</div>
                    <div className="flex flex-wrap gap-2">
                      {poiDetail.localizations.map(l => (
                        <span
                          key={l.languageCode}
                          className="text-xs px-2 py-1"
                          style={{ backgroundColor: "#f0e8d8", color: "#8c7a5e", borderRadius: "2px" }}
                        >
                          {l.languageCode.toUpperCase()} · {l.title ?? "—"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* All media of this POI */}
                <div>
                  <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "#b09878" }}>
                    All Media ({poiDetail.media.length})
                  </div>
                  <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                    {poiDetail.media.map(m => (
                      <div key={m.mediaId} className="group relative" style={{ paddingTop: "75%", backgroundColor: "#f0e8d8", borderRadius: "2px", overflow: "hidden" }}>
                        {m.mediaType === "video" ? (
                          <video src={m.mediaUrl} className="absolute inset-0 w-full h-full object-cover" muted />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={m.mediaUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                        )}
                        <button
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs tracking-widest uppercase"
                          style={{ backgroundColor: "rgba(220,38,38,0.7)", color: "#fff" }}
                          onClick={() => setConfirmDeleteMedia(m.mediaId)}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm delete media modal */}
      {confirmDeleteMedia && (
        <div className="fixed inset-0 flex items-center justify-center z-[60]" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="p-8 w-full max-w-sm" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8" }}>
            <div className="text-sm font-medium mb-2" style={{ color: "#2c2416" }}>Xóa ảnh/video này?</div>
            <div className="text-xs mb-6" style={{ color: "#8c7a5e" }}>
              File sẽ bị xóa khỏi Cloudinary và không thể khôi phục.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMediaMutation.mutate(confirmDeleteMedia)}
                disabled={deleteMediaMutation.isPending}
                className="flex-1 py-2 text-xs tracking-widest uppercase"
                style={{ backgroundColor: "#dc2626", color: "#fff", borderRadius: "1px" }}
              >
                {deleteMediaMutation.isPending ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                onClick={() => setConfirmDeleteMedia(null)}
                className="flex-1 py-2 text-xs tracking-widest uppercase"
                style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
