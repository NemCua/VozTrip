"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Zone = { zoneId: string; zoneName: string; description: string | null };

export default function ZonesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ zoneName: "", description: "" });
  const [msg, setMsg] = useState("");

  const { data: zones = [], isLoading } = useQuery<Zone[]>({
    queryKey: ["admin-zones"],
    queryFn: () => api.get("/api/admin/zones", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/api/admin/zones", { zoneName: form.zoneName, description: form.description || null }, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-zones"] });
      setShowCreate(false); setForm({ zoneName: "", description: "" });
      flash("Đã tạo zone.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => api.put(`/api/admin/zones/${id}`,
      { zoneName: form.zoneName, description: form.description || null }, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-zones"] });
      setEditId(null); flash("Đã lưu.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/admin/zones/${id}`, { headers: authHeader }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-zones"] }),
  });

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2000); };

  const startEdit = (z: Zone) => {
    setEditId(z.zoneId); setShowCreate(false);
    setForm({ zoneName: z.zoneName, description: z.description ?? "" });
  };

  const startCreate = () => {
    setEditId(null); setShowCreate(true);
    setForm({ zoneName: "", description: "" });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Management</div>
          <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Zones</h1>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-xs" style={{ color: "#16a34a" }}>{msg}</span>}
          <button
            onClick={startCreate}
            className="px-5 py-2 text-xs tracking-widest uppercase"
            style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
            onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#c8a96e")}
            onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#2c2416")}
          >
            + Thêm Zone
          </button>
        </div>
      </div>

      {/* Inline create / edit form */}
      {(showCreate || editId) && (
        <div className="p-5 mb-5 space-y-3" style={{ border: "1px solid #c8a96e", backgroundColor: "#fdfaf4" }}>
          <div className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b09060" }}>
            {showCreate ? "Tạo zone mới" : "Chỉnh sửa zone"}
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Tên zone *</label>
            <input
              className="w-full max-w-sm px-3 py-2 text-sm outline-none"
              style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
              value={form.zoneName}
              onChange={e => setForm(f => ({ ...f, zoneName: e.target.value }))}
              placeholder="Vd: Phố cổ Hà Nội"
            />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Mô tả</label>
            <input
              className="w-full max-w-sm px-3 py-2 text-sm outline-none"
              style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Tùy chọn..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => showCreate ? createMutation.mutate() : updateMutation.mutate(editId!)}
              disabled={!form.zoneName.trim() || createMutation.isPending || updateMutation.isPending}
              className="px-5 py-2 text-xs tracking-widest uppercase"
              style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px", opacity: !form.zoneName.trim() ? 0.4 : 1 }}
            >
              {createMutation.isPending || updateMutation.isPending ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              onClick={() => { setShowCreate(false); setEditId(null); }}
              className="px-5 py-2 text-xs tracking-widest uppercase"
              style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Đang tải...</div>
      ) : zones.length === 0 ? (
        <div className="py-16 text-center text-xs tracking-widest uppercase" style={{ color: "#b09878" }}>
          Chưa có zone nào
        </div>
      ) : (
        <div className="space-y-2">
          {zones.map(zone => (
            <div
              key={zone.zoneId}
              className="px-5 py-4 flex items-center gap-4"
              style={{
                backgroundColor: editId === zone.zoneId ? "#fdf6e8" : "#fdfaf4",
                border: `1px solid ${editId === zone.zoneId ? "#c8a96e" : "#e8dfc8"}`,
                borderRadius: "2px",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: "#2c2416" }}>{zone.zoneName}</div>
                {zone.description && (
                  <div className="text-xs mt-0.5" style={{ color: "#8c7a5e" }}>{zone.description}</div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => startEdit(zone)}
                  className="px-4 py-2 text-xs tracking-widest uppercase"
                  style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "#c8a96e"; (e.target as HTMLElement).style.color = "#c8a96e"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "#d8cbb0"; (e.target as HTMLElement).style.color = "#8c7a5e"; }}
                >
                  Sửa
                </button>
                <button
                  onClick={() => { if (confirm(`Xóa zone "${zone.zoneName}"?`)) deleteMutation.mutate(zone.zoneId); }}
                  className="px-4 py-2 text-xs tracking-widest uppercase"
                  style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "#dc2626"; (e.target as HTMLElement).style.color = "#dc2626"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "#d8cbb0"; (e.target as HTMLElement).style.color = "#8c7a5e"; }}
                >
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
