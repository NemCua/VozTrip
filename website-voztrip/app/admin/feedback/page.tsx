"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";

type FeedbackRecord = {
  reportId: string;
  type: string;
  message: string;
  poiId: string | null;
  sessionId: string | null;
  deviceId: string | null;
  platform: string;
  lang: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  reviewedAt: string | null;
};

const TYPE_COLOR: Record<string, string> = {
  bug:        "#dc2626",
  suggestion: "#c8a96e",
  content:    "#0891b2",
  other:      "#8c7a5e",
};

const TYPE_LABEL: Record<string, string> = {
  bug: "Lỗi", suggestion: "Góp ý", content: "Nội dung", other: "Khác",
};

const STATUS_COLOR: Record<string, string> = {
  pending:  "#ea580c",
  reviewed: "#0891b2",
  resolved: "#16a34a",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.floor(hours / 24)} ngày trước`;
}

export default function AdminFeedbackPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState<Record<string, string>>({});

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: reports = [], isLoading } = useQuery<FeedbackRecord[]>({
    queryKey: ["admin-feedback", filterStatus],
    queryFn: () =>
      api.get("/api/admin/feedback", {
        headers: authHeader,
        params: filterStatus !== "all" ? { status: filterStatus } : {},
      }).then(r => r.data),
    enabled: !!session?.accessToken,
    refetchInterval: 60000,
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status, adminNote }: { id: string; status?: string; adminNote?: string }) =>
      api.patch(`/api/admin/feedback/${id}`, { status, adminNote }, { headers: authHeader }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-feedback"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/admin/feedback/${id}`, { headers: authHeader }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-feedback"] }),
  });

  const pendingCount  = reports.filter(r => r.status === "pending").length;
  const resolvedCount = reports.filter(r => r.status === "resolved").length;

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Support</div>
        <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
          Feedback & Reports
        </h1>
      </div>

      {/* Summary */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="inline-block px-6 py-4" style={{ backgroundColor: "#2c2416", borderRadius: "2px" }}>
          <div className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: "#c8a96e" }}>Total</div>
          <div className="text-3xl font-light" style={{ color: "#f5f0e8", fontFamily: "Georgia, serif" }}>{reports.length}</div>
        </div>
        <div className="inline-block px-6 py-4 cursor-pointer" onClick={() => setFilterStatus("pending")}
          style={{ backgroundColor: pendingCount > 0 ? "#fff7ed" : "#f5f0e8", border: `1px solid ${pendingCount > 0 ? "#f97316" : "#e8dfc8"}`, borderRadius: "2px" }}>
          <div className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: pendingCount > 0 ? "#ea580c" : "#8c7a5e" }}>Chờ xử lý</div>
          <div className="text-3xl font-light" style={{ color: pendingCount > 0 ? "#ea580c" : "#2c2416", fontFamily: "Georgia, serif" }}>{pendingCount}</div>
        </div>
        <div className="inline-block px-6 py-4 cursor-pointer" onClick={() => setFilterStatus("resolved")}
          style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "2px" }}>
          <div className="text-xs tracking-[0.25em] uppercase mb-1" style={{ color: "#16a34a" }}>Đã xử lý</div>
          <div className="text-3xl font-light" style={{ color: "#16a34a", fontFamily: "Georgia, serif" }}>{resolvedCount}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {["all", "pending", "reviewed", "resolved"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className="text-xs px-4 py-1.5 tracking-widest uppercase"
            style={{
              backgroundColor: filterStatus === s ? "#2c2416" : "transparent",
              color: filterStatus === s ? "#f5f0e8" : "#8c7a5e",
              border: "1px solid", borderColor: filterStatus === s ? "#2c2416" : "#e8dfc8",
              borderRadius: "2px", cursor: "pointer",
            }}>
            {s === "all" ? "Tất cả" : s === "pending" ? "Chờ" : s === "reviewed" ? "Đang xem" : "Xong"}
          </button>
        ))}
        {["bug", "suggestion", "content", "other"].map(t => (
          <button key={t} onClick={() => setFilterStatus(t)}
            className="text-xs px-3 py-1.5"
            style={{
              backgroundColor: filterStatus === t ? TYPE_COLOR[t] + "15" : "transparent",
              color: TYPE_COLOR[t],
              border: `1px solid ${filterStatus === t ? TYPE_COLOR[t] : "#e8dfc8"}`,
              borderRadius: "2px", cursor: "pointer",
            }}>
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Loading...</div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center text-xs tracking-widest uppercase"
          style={{ color: "#b09878", border: "1px solid #e8dfc8", borderRadius: "2px" }}>
          Không có phản hồi nào
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map(r => (
            <div key={r.reportId} style={{ border: "1px solid #e8dfc8", borderRadius: "4px", backgroundColor: r.status === "pending" ? "#fffbf5" : "#fdfaf4" }}>
              {/* Row header */}
              <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={() => setExpanded(expanded === r.reportId ? null : r.reportId)}>
                {/* Type badge */}
                <span className="text-xs px-2.5 py-1 shrink-0 mt-0.5"
                  style={{ backgroundColor: TYPE_COLOR[r.type] + "15", color: TYPE_COLOR[r.type], borderRadius: "2px" }}>
                  {TYPE_LABEL[r.type] ?? r.type}
                </span>

                {/* Message preview */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#2c2416] leading-snug line-clamp-2">{r.message}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-[11px]" style={{ color: "#b09878" }}>{timeAgo(r.createdAt)}</span>
                    <span className="text-[11px]" style={{ color: "#b09878" }}>{r.platform} · {r.lang.toUpperCase()}</span>
                    {r.poiId && <span className="text-[11px]" style={{ color: "#0891b2" }}>POI: {r.poiId.slice(0, 8)}</span>}
                  </div>
                </div>

                {/* Status */}
                <span className="text-xs px-2.5 py-1 shrink-0"
                  style={{ backgroundColor: STATUS_COLOR[r.status] + "18", color: STATUS_COLOR[r.status], borderRadius: "2px" }}>
                  {r.status}
                </span>
              </div>

              {/* Expanded detail */}
              {expanded === r.reportId && (
                <div className="px-4 pb-4 border-t border-[#e8dfc8] pt-3 flex flex-col gap-3">
                  <p className="text-sm text-[#2c2416] leading-relaxed">{r.message}</p>

                  {r.adminNote && (
                    <div className="bg-[#fdf6e8] border border-[#e8d5a8] rounded px-3 py-2 text-xs text-[#8c7a5e]">
                      <span className="font-medium text-[#c8a96e]">Admin note: </span>{r.adminNote}
                    </div>
                  )}

                  {/* Admin note input */}
                  <textarea
                    placeholder="Ghi chú admin..."
                    rows={2}
                    value={noteInput[r.reportId] ?? r.adminNote ?? ""}
                    onChange={e => setNoteInput(prev => ({ ...prev, [r.reportId]: e.target.value }))}
                    className="w-full border border-[#e8dfc8] rounded px-3 py-2 text-xs text-[#2c2416] outline-none resize-none"
                    style={{ backgroundColor: "#fff" }}
                  />

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    {["reviewed", "resolved"].map(s => (
                      <button key={s} onClick={() => reviewMutation.mutate({
                        id: r.reportId, status: s,
                        adminNote: noteInput[r.reportId] ?? r.adminNote ?? undefined,
                      })}
                        className="text-xs px-3 py-1.5"
                        style={{ backgroundColor: STATUS_COLOR[s], color: "#fff", borderRadius: "2px", border: "none", cursor: "pointer" }}>
                        → {s === "reviewed" ? "Đang xem" : "Đã xử lý"}
                      </button>
                    ))}
                    <button onClick={() => reviewMutation.mutate({
                      id: r.reportId,
                      adminNote: noteInput[r.reportId] ?? undefined,
                    })}
                      className="text-xs px-3 py-1.5"
                      style={{ backgroundColor: "#f5f0e8", color: "#6b5c45", border: "1px solid #e8dfc8", borderRadius: "2px", cursor: "pointer" }}>
                      Lưu ghi chú
                    </button>
                    <button onClick={() => deleteMutation.mutate(r.reportId)}
                      className="text-xs px-3 py-1.5 ml-auto"
                      style={{ backgroundColor: "transparent", color: "#b09060", border: "1px solid #e8dfc8", borderRadius: "2px", cursor: "pointer" }}>
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
