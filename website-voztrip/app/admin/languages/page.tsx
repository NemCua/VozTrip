"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type Language = { languageId: string; languageCode: string; languageName: string; isActive: boolean };

const FLAGS: Record<string, string> = {
  vi: "🇻🇳", en: "🇬🇧", zh: "🇨🇳", ko: "🇰🇷", ja: "🇯🇵",
  fr: "🇫🇷", de: "🇩🇪", es: "🇪🇸", it: "🇮🇹", pt: "🇵🇹",
  ru: "🇷🇺", ar: "🇸🇦", th: "🇹🇭", id: "🇮🇩", ms: "🇲🇾",
  nl: "🇳🇱", pl: "🇵🇱", tr: "🇹🇷", sv: "🇸🇪", hi: "🇮🇳",
};

// Preset list of common languages
const PRESET_LANGUAGES: { code: string; name: string }[] = [
  { code: "vi", name: "Tiếng Việt" },
  { code: "en", name: "English" },
  { code: "zh", name: "中文 (Chinese)" },
  { code: "ko", name: "한국어 (Korean)" },
  { code: "ja", name: "日本語 (Japanese)" },
  { code: "fr", name: "Français (French)" },
  { code: "de", name: "Deutsch (German)" },
  { code: "es", name: "Español (Spanish)" },
  { code: "it", name: "Italiano (Italian)" },
  { code: "pt", name: "Português (Portuguese)" },
  { code: "ru", name: "Русский (Russian)" },
  { code: "ar", name: "العربية (Arabic)" },
  { code: "th", name: "ภาษาไทย (Thai)" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "ms", name: "Bahasa Melayu (Malay)" },
  { code: "nl", name: "Nederlands (Dutch)" },
  { code: "pl", name: "Polski (Polish)" },
  { code: "tr", name: "Türkçe (Turkish)" },
  { code: "sv", name: "Svenska (Swedish)" },
  { code: "hi", name: "हिन्दी (Hindi)" },
];

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

          {/* Dropdown picker */}
          <div className="max-w-sm">
            <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Chọn ngôn ngữ</label>
            <select
              className="w-full px-3 py-2 text-sm outline-none appearance-none"
              style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: form.languageCode ? "#2c2416" : "#a09080", borderRadius: "1px", cursor: "pointer" }}
              value={form.languageCode}
              onChange={e => {
                const preset = PRESET_LANGUAGES.find(p => p.code === e.target.value);
                if (preset) setForm({ languageCode: preset.code, languageName: preset.name.split(" (")[0] });
                else setForm({ languageCode: "", languageName: "" });
              }}
            >
              <option value="">— Chọn từ danh sách —</option>
              {PRESET_LANGUAGES.filter(p => !languages.some(l => l.languageCode === p.code)).map(p => (
                <option key={p.code} value={p.code}>
                  {FLAGS[p.code] ?? "🌐"} {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Preview + name override */}
          {form.languageCode && (
            <div className="flex items-center gap-3 max-w-sm">
              <span className="text-2xl">{FLAGS[form.languageCode] ?? "🌐"}</span>
              <div className="flex-1">
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Tên hiển thị</label>
                <input
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416", borderRadius: "1px" }}
                  value={form.languageName}
                  onChange={e => setForm(f => ({ ...f, languageName: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Mã</label>
                <div className="px-3 py-2 text-sm font-mono" style={{ border: "1px solid #e8dfc8", backgroundColor: "#f5f0e8", color: "#8c7a5e", borderRadius: "1px" }}>
                  {form.languageCode}
                </div>
              </div>
            </div>
          )}

          <p className="text-[11px]" style={{ color: "#b09878" }}>
            Nội dung POI (tiêu đề, mô tả, audio) nhập riêng qua form localization của từng POI. UI app sẽ tự hiển thị tiếng Anh cho ngôn ngữ chưa có bản dịch giao diện.
          </p>

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
