"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Language = { languageId: string; languageCode: string; languageName: string; isActive: boolean };

const FLAGS: Record<string, string> = { vi: "🇻🇳", en: "🇬🇧", zh: "🇨🇳", ko: "🇰🇷", ja: "🇯🇵" };

export default function LanguagesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const [showCreate, setShowCreate] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ languageCode: "", languageName: "" });
  const [msg, setMsg] = useState("");

  const { data: languages = [], isLoading } = useQuery<Language[]>({
    queryKey: ["admin-languages"],
    queryFn: () => api.get("/api/admin/languages", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  const createMutation = useMutation({
    mutationFn: () => api.post("/api/admin/languages",
      { languageCode: form.languageCode.toLowerCase().trim(), languageName: form.languageName.trim() },
      { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-languages"] });
      setShowCreate(false); setForm({ languageCode: "", languageName: "" });
      flash("Đã thêm ngôn ngữ.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      api.put(`/api/admin/languages/${id}`, body, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-languages"] });
      setEditId(null); flash("Đã lưu.");
    },
  });

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 2000); };

  const startEdit = (l: Language) => {
    setEditId(l.languageId); setShowCreate(false);
    setForm({ languageCode: l.languageCode, languageName: l.languageName });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Management</div>
          <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Languages</h1>
        </div>
        <div className="flex items-center gap-3">
          {msg && <span className="text-xs" style={{ color: "#16a34a" }}>{msg}</span>}
          <button
            onClick={() => { setShowCreate(true); setEditId(null); setForm({ languageCode: "", languageName: "" }); }}
            className="px-5 py-2 text-xs tracking-widest uppercase"
            style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
            onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#c8a96e")}
            onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#2c2416")}
          >
            + Thêm ngôn ngữ
          </button>
        </div>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="p-5 mb-5 space-y-3" style={{ border: "1px solid #c8a96e", backgroundColor: "#fdfaf4" }}>
          <div className="text-xs tracking-widest uppercase mb-1" style={{ color: "#b09060" }}>Thêm ngôn ngữ mới</div>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            <div>
              <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Mã (ISO 639-1)</label>
              <input
                className="w-full px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                value={form.languageCode}
                onChange={e => setForm(f => ({ ...f, languageCode: e.target.value }))}
                placeholder="vd: fr"
                maxLength={5}
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Tên ngôn ngữ</label>
              <input
                className="w-full px-3 py-2 text-sm outline-none"
                style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                value={form.languageName}
                onChange={e => setForm(f => ({ ...f, languageName: e.target.value }))}
                placeholder="vd: Français"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => createMutation.mutate()}
              disabled={!form.languageCode.trim() || !form.languageName.trim() || createMutation.isPending}
              className="px-5 py-2 text-xs tracking-widest uppercase"
              style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px", opacity: (!form.languageCode.trim() || !form.languageName.trim()) ? 0.4 : 1 }}
            >
              {createMutation.isPending ? "Đang thêm..." : "Thêm"}
            </button>
            <button
              onClick={() => setShowCreate(false)}
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
      ) : (
        <div className="space-y-2">
          {languages.map(lang => (
            <div key={lang.languageId}>
              {/* View row */}
              {editId !== lang.languageId ? (
                <div
                  className="px-5 py-4 flex items-center gap-4"
                  style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px" }}
                >
                  <span className="text-xl">{FLAGS[lang.languageCode] ?? "🌐"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: "#2c2416" }}>{lang.languageName}</span>
                      <span className="text-xs px-1.5 py-0.5 font-mono" style={{ backgroundColor: "#f5f0e8", color: "#8c7a5e" }}>
                        {lang.languageCode}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5"
                        style={{
                          backgroundColor: lang.isActive ? "#f0fdf4" : "#f5f5f5",
                          color: lang.isActive ? "#16a34a" : "#6b7280",
                          border: `1px solid ${lang.isActive ? "#bbf7d0" : "#e5e7eb"}`,
                          borderRadius: "2px",
                        }}
                      >
                        {lang.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {/* Toggle active */}
                    <button
                      onClick={() => updateMutation.mutate({ id: lang.languageId, body: { languageCode: lang.languageCode, languageName: lang.languageName, isActive: !lang.isActive } })}
                      className="px-4 py-2 text-xs tracking-widest uppercase"
                      style={{ border: `1px solid ${lang.isActive ? "#d8cbb0" : "#c8a96e"}`, color: lang.isActive ? "#8c7a5e" : "#c8a96e", borderRadius: "1px" }}
                    >
                      {lang.isActive ? "Tắt" : "Bật"}
                    </button>
                    <button
                      onClick={() => startEdit(lang)}
                      className="px-4 py-2 text-xs tracking-widest uppercase"
                      style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
                      onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "#c8a96e"; (e.target as HTMLElement).style.color = "#c8a96e"; }}
                      onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "#d8cbb0"; (e.target as HTMLElement).style.color = "#8c7a5e"; }}
                    >
                      Sửa
                    </button>
                  </div>
                </div>
              ) : (
                /* Edit row */
                <div className="px-5 py-4 flex items-center gap-4"
                  style={{ backgroundColor: "#fdf6e8", border: "1px solid #c8a96e", borderRadius: "2px" }}
                >
                  <span className="text-xl">{FLAGS[form.languageCode] ?? "🌐"}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      className="px-3 py-1.5 text-sm outline-none w-20"
                      style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                      value={form.languageCode}
                      onChange={e => setForm(f => ({ ...f, languageCode: e.target.value }))}
                      maxLength={5}
                    />
                    <input
                      className="px-3 py-1.5 text-sm outline-none flex-1 max-w-xs"
                      style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                      value={form.languageName}
                      onChange={e => setForm(f => ({ ...f, languageName: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => updateMutation.mutate({ id: lang.languageId, body: { languageCode: form.languageCode.trim(), languageName: form.languageName.trim() } })}
                      disabled={updateMutation.isPending}
                      className="px-4 py-2 text-xs tracking-widest uppercase"
                      style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditId(null)}
                      className="px-4 py-2 text-xs tracking-widest uppercase"
                      style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
                    >
                      Hủy
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
