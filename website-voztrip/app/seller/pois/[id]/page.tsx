"use client";

import { useState, useRef, use } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import QRCode from "react-qr-code";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

// ── Types ────────────────────────────────────────────────────────────────────

type Poi = {
  poiId: string; poiName: string; latitude: number; longitude: number;
  triggerRadius: number; isActive: boolean; zoneName: string | null; localizationCount: number;
  zoneId: string | null;
};

type Localization = {
  localizationId: string; languageId: string; languageCode: string; languageName: string;
  title: string | null; description: string | null;
  audioUrl: string | null; audioDuration: number | null; isAutoTranslated: boolean;
};

type Language = { languageId: string; languageCode: string; languageName: string };

type Media = { mediaId: string; mediaType: string; mediaUrl: string; sortOrder: number; publicId: string };

type Question = {
  questionId: string; languageId: string; languageCode: string;
  questionText: string; sortOrder: number; isActive: boolean;
  answer: { answerId: string; answerText: string; audioUrl: string | null } | null;
};

type Zone = { zoneId: string; zoneName: string };

type Tab = "info" | "localizations" | "media" | "qa";

// ── Helpers ──────────────────────────────────────────────────────────────────

const FLAGS: Record<string, string> = { vi: "🇻🇳", en: "🇬🇧", zh: "🇨🇳", ko: "🇰🇷", ja: "🇯🇵" };
const inputStyle = { border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" };
const labelStyle = { color: "#8c7a5e" };

// ── Sub-components ────────────────────────────────────────────────────────────

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 text-xs tracking-widest uppercase transition-all"
      style={{
        borderBottom: active ? "2px solid #c8a96e" : "2px solid transparent",
        color: active ? "#2c2416" : "#8c7a5e",
        marginBottom: "-1px",
      }}
    >
      {children}
    </button>
  );
}

// ── Info Tab ─────────────────────────────────────────────────────────────────

function InfoTab({ poi, poiId, authHeader, onSaved }: { poi: Poi; poiId: string; authHeader: object; onSaved: () => void }) {
  const [form, setForm] = useState({
    poiName: poi.poiName,
    latitude: String(poi.latitude),
    longitude: String(poi.longitude),
    triggerRadius: String(poi.triggerRadius),
    isActive: poi.isActive,
    zoneId: poi.zoneId ?? "",
  });

  const { data: zones = [] } = useQuery<Zone[]>({
    queryKey: ["admin-zones"],
    queryFn: () => api.get("/api/admin/zones", { headers: authHeader }).then((r: { data: Zone[] }) => r.data),
  });
  const [msg, setMsg] = useState("");

  const mutation = useMutation({
    mutationFn: () => api.put(`/api/seller/pois/${poiId}`, {
      poiName: form.poiName,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      triggerRadius: parseFloat(form.triggerRadius),
      isActive: form.isActive,
      zoneId: form.zoneId || null,
    }, { headers: authHeader }),
    onSuccess: () => { setMsg("Đã lưu."); onSaved(); setTimeout(() => setMsg(""), 2000); },
    onError: () => setMsg("Lỗi khi lưu."),
  });

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <label className="block text-xs tracking-widest uppercase mb-1" style={labelStyle}>Tên POI</label>
        <input className="w-full px-3 py-2 text-sm outline-none" style={inputStyle}
          value={form.poiName} onChange={e => setForm(f => ({ ...f, poiName: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs tracking-widest uppercase mb-1" style={labelStyle}>Vĩ độ</label>
          <input className="w-full px-3 py-2 text-sm outline-none font-mono" style={inputStyle}
            value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs tracking-widest uppercase mb-1" style={labelStyle}>Kinh độ</label>
          <input className="w-full px-3 py-2 text-sm outline-none font-mono" style={inputStyle}
            value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))} />
        </div>
      </div>
      <div>
        <label className="block text-xs tracking-widest uppercase mb-2" style={labelStyle}>
          Vị trí trên bản đồ
          <span className="ml-2 normal-case" style={{ color: "#b09878" }}>(click hoặc kéo ghim)</span>
        </label>
        <MapPicker
          lat={parseFloat(form.latitude) || poi.latitude}
          lng={parseFloat(form.longitude) || poi.longitude}
          onChange={(lat, lng) => setForm(f => ({
            ...f,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
          }))}
        />
      </div>
      <div>
        <label className="block text-xs tracking-widest uppercase mb-1" style={labelStyle}>Bán kính GPS (m)</label>
        <input className="w-full px-3 py-2 text-sm outline-none" style={inputStyle} type="number"
          value={form.triggerRadius} onChange={e => setForm(f => ({ ...f, triggerRadius: e.target.value }))} />
      </div>
      <div>
        <label className="block text-xs tracking-widest uppercase mb-1" style={labelStyle}>Zone</label>
        <select className="w-full px-3 py-2 text-sm outline-none" style={inputStyle}
          value={form.zoneId} onChange={e => setForm(f => ({ ...f, zoneId: e.target.value }))}>
          <option value="">— Không chọn zone —</option>
          {zones.map((z: Zone) => (
            <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
          ))}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="isActive" checked={form.isActive}
          onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
        <label htmlFor="isActive" className="text-xs tracking-widest uppercase" style={labelStyle}>Đang hoạt động</label>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="px-6 py-2 text-xs tracking-widest uppercase"
          style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px", opacity: mutation.isPending ? 0.6 : 1 }}
        >
          {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
        {msg && <span className="text-xs" style={{ color: msg === "Đã lưu." ? "#16a34a" : "#dc2626" }}>{msg}</span>}
      </div>
    </div>
  );
}

// ── Localizations Tab ─────────────────────────────────────────────────────────

function LocalizationsTab({ poiId, authHeader }: { poiId: string; authHeader: object }) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string }>({ title: "", description: "" });
  const [msg, setMsg] = useState("");
  const [translating, setTranslating] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: () => api.get("/api/languages").then(r => r.data),
  });

  const { data: locs = [] } = useQuery<Localization[]>({
    queryKey: ["seller-locs", poiId],
    queryFn: () => api.get(`/api/seller/pois/${poiId}/localizations`, { headers: authHeader }).then(r => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: ({ langId, body }: { langId: string; body: object }) =>
      api.put(`/api/seller/pois/${poiId}/localizations/${langId}`, body, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-locs", poiId] });
      setMsg("Đã lưu."); setTimeout(() => setMsg(""), 2000);
    },
    onError: () => { setMsg("Lỗi khi lưu."); setTimeout(() => setMsg(""), 2000); },
  });

  const deleteMutation = useMutation({
    mutationFn: (langId: string) =>
      api.delete(`/api/seller/pois/${poiId}/localizations/${langId}`, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-locs", poiId] });
      setSelected(null);
    },
  });

  const handleTranslate = async (sourceLangId: string) => {
    setTranslating(true); setMsg("");
    try {
      const res = await api.post(`/api/seller/pois/${poiId}/localizations/translate`,
        { sourceLanguageId: sourceLangId }, { headers: authHeader });
      queryClient.invalidateQueries({ queryKey: ["seller-locs", poiId] });
      setMsg(res.data.message);
    } catch {
      setMsg("Lỗi khi dịch.");
    } finally {
      setTranslating(false); setTimeout(() => setMsg(""), 3000);
    }
  };

  const handleAudioUpload = async (langId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post(
        `/api/seller/pois/${poiId}/localizations/${langId}/audio`, fd,
        { headers: { ...(authHeader as object), "Content-Type": "multipart/form-data" } }
      );
      queryClient.invalidateQueries({ queryKey: ["seller-locs", poiId] });
      setMsg(`Audio đã upload: ${res.data.audioUrl}`);
      setTimeout(() => setMsg(""), 3000);
    } catch {
      setMsg("Upload audio thất bại."); setTimeout(() => setMsg(""), 2000);
    }
  };

  const selectLang = (langId: string) => {
    const loc = locs.find(l => l.languageId === langId);
    setSelected(langId);
    setEditForm({ title: loc?.title ?? "", description: loc?.description ?? "" });
    setMsg("");
  };

  const selectedLoc = locs.find(l => l.languageId === selected);
  const selectedLang = languages.find(l => l.languageId === selected);

  return (
    <div className="flex gap-6 min-h-0">
      {/* Language list */}
      <div className="w-52 shrink-0 space-y-1">
        {languages.map(lang => {
          const loc = locs.find(l => l.languageId === lang.languageId);
          const active = selected === lang.languageId;
          return (
            <button
              key={lang.languageId}
              onClick={() => selectLang(lang.languageId)}
              className="w-full flex items-center gap-2 px-3 py-3 text-left transition-all"
              style={{
                border: `1px solid ${active ? "#c8a96e" : "#e8dfc8"}`,
                backgroundColor: active ? "#fdf6e8" : "#fdfaf4",
                borderRadius: "2px",
              }}
            >
              <span className="text-base">{FLAGS[lang.languageCode] ?? "🌐"}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: "#2c2416" }}>{lang.languageName}</div>
                {loc ? (
                  <div className="text-xs" style={{ color: loc.isAutoTranslated ? "#b09060" : "#16a34a" }}>
                    {loc.isAutoTranslated ? "Tự động dịch" : "Đã nhập"}
                  </div>
                ) : (
                  <div className="text-xs" style={{ color: "#d8cbb0" }}>Chưa có</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Editor */}
      {selected && selectedLang ? (
        <div className="flex-1 min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium" style={{ color: "#2c2416" }}>
              {FLAGS[selectedLang.languageCode] ?? "🌐"} {selectedLang.languageName}
              {selectedLoc?.isAutoTranslated && (
                <span className="ml-2 text-xs px-2 py-0.5" style={{ backgroundColor: "#fef3c7", color: "#92400e" }}>
                  Auto-translated
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleTranslate(selected)}
                disabled={translating}
                className="px-3 py-1.5 text-xs tracking-widest uppercase"
                style={{ border: "1px solid #c8a96e", color: "#c8a96e", borderRadius: "1px", opacity: translating ? 0.6 : 1 }}
              >
                {translating ? "Đang dịch..." : "Dịch từ đây →"}
              </button>
              {selectedLoc && (
                <button
                  onClick={() => { if (confirm("Xóa localization này?")) deleteMutation.mutate(selected); }}
                  className="px-3 py-1.5 text-xs tracking-widest uppercase"
                  style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "#dc2626"; (e.target as HTMLElement).style.color = "#dc2626"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "#d8cbb0"; (e.target as HTMLElement).style.color = "#8c7a5e"; }}
                >
                  Xóa
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase mb-1" style={labelStyle}>Tiêu đề</label>
            <input className="w-full px-3 py-2 text-sm outline-none" style={inputStyle}
              value={editForm.title}
              onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Tiêu đề hiển thị trên app..." />
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase mb-1" style={labelStyle}>Mô tả thuyết minh</label>
            <textarea
              className="w-full px-3 py-2 text-sm outline-none resize-none"
              style={{ ...inputStyle, minHeight: "140px" }}
              value={editForm.description}
              onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Nội dung thuyết minh cho du khách..."
            />
          </div>

          {/* Audio */}
          <div>
            <label className="block text-xs tracking-widest uppercase mb-2" style={labelStyle}>Audio thuyết minh</label>
            {selectedLoc?.audioUrl ? (
              <div className="flex items-center gap-3">
                <audio controls src={selectedLoc.audioUrl} style={{ height: "36px" }} />
                <button
                  onClick={() => audioInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs tracking-widest uppercase"
                  style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
                >
                  Thay thế
                </button>
              </div>
            ) : (
              <button
                onClick={() => audioInputRef.current?.click()}
                className="px-4 py-2 text-xs tracking-widest uppercase"
                style={{ border: "1px solid #c8a96e", color: "#c8a96e", borderRadius: "1px" }}
              >
                + Upload audio
              </button>
            )}
            <input ref={audioInputRef} type="file" accept="audio/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleAudioUpload(selected, f); e.target.value = ""; }} />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => saveMutation.mutate({ langId: selected, body: { title: editForm.title, description: editForm.description } })}
              disabled={saveMutation.isPending}
              className="px-6 py-2 text-xs tracking-widest uppercase"
              style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px", opacity: saveMutation.isPending ? 0.6 : 1 }}
            >
              {saveMutation.isPending ? "Đang lưu..." : "Lưu nội dung"}
            </button>
            {msg && <span className="text-xs" style={{ color: msg.includes("Lỗi") ? "#dc2626" : "#16a34a" }}>{msg}</span>}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs tracking-widest uppercase" style={{ color: "#b09878" }}>Chọn ngôn ngữ để chỉnh sửa</p>
        </div>
      )}
    </div>
  );
}

// ── Media Tab ─────────────────────────────────────────────────────────────────

function MediaTab({ poiId, authHeader }: { poiId: string; authHeader: object }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");

  const { data: media = [] } = useQuery<Media[]>({
    queryKey: ["seller-media", poiId],
    queryFn: () => api.get(`/api/seller/pois/${poiId}/media`, { headers: authHeader }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (mediaId: string) =>
      api.delete(`/api/seller/media/${mediaId}`, { headers: authHeader }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-media", poiId] }),
  });

  const handleUpload = async (file: File) => {
    setUploading(true); setMsg("");
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.post(`/api/seller/pois/${poiId}/media/upload`, fd, {
        headers: { ...(authHeader as object), "Content-Type": "multipart/form-data" },
      });
      queryClient.invalidateQueries({ queryKey: ["seller-media", poiId] });
      setMsg("Upload thành công."); setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("Upload thất bại."); setTimeout(() => setMsg(""), 2000);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {/* Upload */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-5 py-2 text-xs tracking-widest uppercase"
          style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px", opacity: uploading ? 0.6 : 1 }}
        >
          {uploading ? "Đang upload..." : "+ Upload ảnh / video"}
        </button>
        {msg && <span className="text-xs" style={{ color: msg.includes("thất bại") ? "#dc2626" : "#16a34a" }}>{msg}</span>}
        <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ""; }} />
      </div>

      {media.length === 0 ? (
        <div className="py-16 text-center text-xs tracking-widest uppercase" style={{ color: "#b09878" }}>
          Chưa có media nào
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {media.map((m, i) => (
            <div key={m.mediaId} className="relative group" style={{ border: "1px solid #e8dfc8" }}>
              {m.mediaType === "video" ? (
                <video src={m.mediaUrl} className="w-full h-44 object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.mediaUrl} alt="" className="w-full h-44 object-cover" />
              )}
              <div className="absolute top-2 left-2 flex gap-1">
                <span className="text-xs px-1.5 py-0.5" style={{ backgroundColor: "rgba(44,36,22,0.7)", color: "#f5f0e8" }}>
                  #{i + 1}
                </span>
                <span className="text-xs px-1.5 py-0.5 uppercase" style={{ backgroundColor: "rgba(44,36,22,0.7)", color: "#c8a96e" }}>
                  {m.mediaType}
                </span>
              </div>
              <button
                onClick={() => { if (confirm("Xóa media này?")) deleteMutation.mutate(m.mediaId); }}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "#dc2626", color: "#fff", borderRadius: "2px" }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Q&A Tab ───────────────────────────────────────────────────────────────────

function QATab({ poiId, authHeader }: { poiId: string; authHeader: object }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [qForm, setQForm] = useState({ questionText: "", languageId: "" });
  const [openAnswer, setOpenAnswer] = useState<string | null>(null);
  const [answerForms, setAnswerForms] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");

  const { data: languages = [] } = useQuery<Language[]>({
    queryKey: ["languages"],
    queryFn: () => api.get("/api/languages").then(r => r.data),
  });

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ["seller-qa", poiId],
    queryFn: () => api.get(`/api/seller/pois/${poiId}/questions`, { headers: authHeader }).then(r => r.data),
  });

  const addQMutation = useMutation({
    mutationFn: () => api.post(`/api/seller/pois/${poiId}/questions`,
      { languageId: qForm.languageId, questionText: qForm.questionText }, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-qa", poiId] });
      setShowForm(false); setQForm({ questionText: "", languageId: "" });
    },
  });

  const deleteQMutation = useMutation({
    mutationFn: (qId: string) => api.delete(`/api/seller/questions/${qId}`, { headers: authHeader }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-qa", poiId] }),
  });

  const saveAnswerMutation = useMutation({
    mutationFn: ({ qId, text }: { qId: string; text: string }) =>
      api.put(`/api/seller/questions/${qId}/answer`, { answerText: text }, { headers: authHeader }),
    onSuccess: (_, { qId }) => {
      queryClient.invalidateQueries({ queryKey: ["seller-qa", poiId] });
      setOpenAnswer(null);
      setAnswerForms(f => { const c = { ...f }; delete c[qId]; return c; });
      setMsg("Đã lưu câu trả lời."); setTimeout(() => setMsg(""), 2000);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs" style={{ color: "#8c7a5e" }}>{questions.length} câu hỏi</p>
        <button
          onClick={() => setShowForm(s => !s)}
          className="px-4 py-2 text-xs tracking-widest uppercase"
          style={{ border: "1px solid #c8a96e", color: "#c8a96e", borderRadius: "1px" }}
        >
          {showForm ? "Hủy" : "+ Thêm câu hỏi"}
        </button>
      </div>

      {/* Add question form */}
      {showForm && (
        <div className="p-4 mb-5 space-y-3" style={{ border: "1px solid #e8dfc8", backgroundColor: "#fdfaf4" }}>
          <div>
            <label className="block text-xs tracking-widest uppercase mb-1" style={labelStyle}>Ngôn ngữ</label>
            <select
              className="w-full px-3 py-2 text-sm outline-none"
              style={inputStyle}
              value={qForm.languageId}
              onChange={e => setQForm(f => ({ ...f, languageId: e.target.value }))}
            >
              <option value="">Chọn ngôn ngữ...</option>
              {languages.map(l => (
                <option key={l.languageId} value={l.languageId}>{FLAGS[l.languageCode] ?? "🌐"} {l.languageName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs tracking-widest uppercase mb-1" style={labelStyle}>Câu hỏi</label>
            <input
              className="w-full px-3 py-2 text-sm outline-none"
              style={inputStyle}
              value={qForm.questionText}
              onChange={e => setQForm(f => ({ ...f, questionText: e.target.value }))}
              placeholder="Vd: Giờ mở cửa là mấy giờ?"
            />
          </div>
          <button
            onClick={() => addQMutation.mutate()}
            disabled={!qForm.languageId || !qForm.questionText.trim() || addQMutation.isPending}
            className="px-5 py-2 text-xs tracking-widest uppercase"
            style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px", opacity: (!qForm.languageId || !qForm.questionText.trim()) ? 0.4 : 1 }}
          >
            Thêm
          </button>
        </div>
      )}

      {msg && <p className="text-xs mb-3" style={{ color: "#16a34a" }}>{msg}</p>}

      {questions.length === 0 ? (
        <div className="py-16 text-center text-xs tracking-widest uppercase" style={{ color: "#b09878" }}>
          Chưa có câu hỏi nào
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <div key={q.questionId} style={{ border: "1px solid #e8dfc8", backgroundColor: "#fdfaf4" }}>
              {/* Question row */}
              <div className="px-4 py-3 flex items-start gap-3">
                <span className="text-sm mt-0.5">{FLAGS[q.languageCode] ?? "🌐"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: "#2c2416" }}>{q.questionText}</p>
                  {q.answer && (
                    <p className="text-xs mt-1 truncate" style={{ color: "#8c7a5e" }}>
                      → {q.answer.answerText}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setOpenAnswer(openAnswer === q.questionId ? null : q.questionId);
                      setAnswerForms(f => ({ ...f, [q.questionId]: q.answer?.answerText ?? "" }));
                    }}
                    className="px-3 py-1 text-xs tracking-widest uppercase"
                    style={{ border: "1px solid #c8a96e", color: "#c8a96e", borderRadius: "1px" }}
                  >
                    {q.answer ? "Sửa trả lời" : "+ Trả lời"}
                  </button>
                  <button
                    onClick={() => { if (confirm("Xóa câu hỏi này?")) deleteQMutation.mutate(q.questionId); }}
                    className="px-3 py-1 text-xs tracking-widest uppercase"
                    style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
                    onMouseEnter={e => { (e.target as HTMLElement).style.color = "#dc2626"; (e.target as HTMLElement).style.borderColor = "#dc2626"; }}
                    onMouseLeave={e => { (e.target as HTMLElement).style.color = "#8c7a5e"; (e.target as HTMLElement).style.borderColor = "#d8cbb0"; }}
                  >
                    Xóa
                  </button>
                </div>
              </div>

              {/* Answer editor */}
              {openAnswer === q.questionId && (
                <div className="px-4 pb-4 pt-2 space-y-2" style={{ borderTop: "1px solid #e8dfc8", backgroundColor: "#f5f0e8" }}>
                  <label className="block text-xs tracking-widest uppercase" style={labelStyle}>Câu trả lời</label>
                  <textarea
                    className="w-full px-3 py-2 text-sm outline-none resize-none"
                    style={{ ...inputStyle, minHeight: "80px" }}
                    value={answerForms[q.questionId] ?? ""}
                    onChange={e => setAnswerForms(f => ({ ...f, [q.questionId]: e.target.value }))}
                    placeholder="Nhập câu trả lời..."
                  />
                  <button
                    onClick={() => saveAnswerMutation.mutate({ qId: q.questionId, text: answerForms[q.questionId] ?? "" })}
                    disabled={saveAnswerMutation.isPending}
                    className="px-5 py-2 text-xs tracking-widest uppercase"
                    style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
                  >
                    Lưu
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── QR Modal ─────────────────────────────────────────────────────────────────

function QRModal({ poiId, poiName, onClose }: { poiId: string; poiName: string; onClose: () => void }) {
  const qrValue = `voztrip:poi:${poiId}`;
  const svgRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size + 60;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fdfaf4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(20, 20, size - 40, size - 40);
      ctx.drawImage(img, 20, 20, size - 40, size - 40);
      ctx.fillStyle = "#2c2416";
      ctx.font = "14px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(poiName, size / 2, size + 20);
      ctx.fillStyle = "#b09878";
      ctx.font = "11px sans-serif";
      ctx.fillText("Quét để xem thuyết minh · VozTrip", size / 2, size + 42);
      const link = document.createElement("a");
      link.download = `QR_${poiName.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
    img.src = `data:image/svg+xml;base64,${btoa(encodeURIComponent(svgData).replace(/%([0-9A-F]{2})/g, (_, p1) => String.fromCharCode(parseInt(p1, 16))))}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(44,36,22,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm p-8 flex flex-col items-center gap-6"
        style={{ backgroundColor: "#fdfaf4", borderRadius: "2px" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full">
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>QR Code</div>
          <div className="text-lg font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>{poiName}</div>
        </div>
        <div ref={svgRef} className="p-5" style={{ backgroundColor: "#ffffff", border: "1px solid #e8dfc8", borderRadius: "2px" }}>
          <QRCode value={qrValue} size={200} bgColor="#ffffff" fgColor="#2c2416" level="M" />
        </div>
        <div className="text-center">
          <div className="text-xs" style={{ color: "#b09878" }}>Quét bằng VozTrip app để xem thuyết minh</div>
          <div className="text-xs mt-1 px-2 py-1 font-mono" style={{ color: "#8c7a5e", backgroundColor: "#f0e8d8", borderRadius: "2px" }}>{qrValue}</div>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={handleDownload}
            className="flex-1 py-2 text-xs tracking-widest uppercase"
            style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
            onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#c8a96e")}
            onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#2c2416")}
          >
            Download PNG
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 text-xs tracking-widest uppercase"
            style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PoiDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: poiId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>("info");
  const [showQR, setShowQR] = useState(false);

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: pois = [] } = useQuery<Poi[]>({
    queryKey: ["seller-pois"],
    queryFn: () => api.get("/api/seller/pois", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  const poi = pois.find(p => p.poiId === poiId);

  if (!poi) {
    return (
      <div className="py-20 text-center text-xs tracking-widest uppercase" style={{ color: "#b09878" }}>
        Đang tải...
      </div>
    );
  }

  return (
    <div>
      {showQR && <QRModal poiId={poiId} poiName={poi.poiName} onClose={() => setShowQR(false)} />}

      {/* Breadcrumb + header */}
      <div className="mb-2">
        <button
          onClick={() => router.push("/seller/pois")}
          className="text-xs tracking-widest uppercase mb-3 flex items-center gap-1"
          style={{ color: "#b09060" }}
        >
          ← Danh sách POI
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>{poi.poiName}</h1>
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
          <button
            onClick={() => setShowQR(true)}
            className="ml-auto px-4 py-1.5 text-xs tracking-widest uppercase"
            style={{ border: "1px solid #c8a96e", color: "#c8a96e", borderRadius: "1px" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = "#c8a96e"; (e.target as HTMLElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = "transparent"; (e.target as HTMLElement).style.color = "#c8a96e"; }}
          >
            QR Code
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex mb-6" style={{ borderBottom: "1px solid #d8cbb0" }}>
        <TabButton active={tab === "info"} onClick={() => setTab("info")}>Thông tin</TabButton>
        <TabButton active={tab === "localizations"} onClick={() => setTab("localizations")}>
          Ngôn ngữ ({poi.localizationCount})
        </TabButton>
        <TabButton active={tab === "media"} onClick={() => setTab("media")}>Media</TabButton>
        <TabButton active={tab === "qa"} onClick={() => setTab("qa")}>Q&A</TabButton>
      </div>

      {/* Tab content */}
      {tab === "info" && (
        <InfoTab
          poi={poi} poiId={poiId} authHeader={authHeader}
          onSaved={() => queryClient.invalidateQueries({ queryKey: ["seller-pois"] })}
        />
      )}
      {tab === "localizations" && <LocalizationsTab poiId={poiId} authHeader={authHeader} />}
      {tab === "media" && <MediaTab poiId={poiId} authHeader={authHeader} />}
      {tab === "qa" && <QATab poiId={poiId} authHeader={authHeader} />}
    </div>
  );
}
