"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";
import QRCode from "react-qr-code";

const MapPicker = dynamic(() => import("@/components/MapPicker"), { ssr: false });

type Poi = {
  poiId: string;
  poiName: string;
  latitude: number;
  longitude: number;
  triggerRadius: number;
  isActive: boolean;
  isFeatured: boolean;
  featuredUntil: string | null;
  createdAt: string;
  zoneName: string | null;
  localizationCount: number;
};

type BoostOrder = {
  orderId: string;
  orderCode: string;
  amount: number;
  boostDays: number;
  qrUrl: string;
  expiresInSeconds: number;
};

type Zone = { zoneId: string; zoneName: string };

type CreateForm = {
  poiName: string;
  latitude: string;
  longitude: string;
  triggerRadius: string;
  zoneId: string;
};

const EMPTY_FORM: CreateForm = { poiName: "", latitude: "", longitude: "", triggerRadius: "10", zoneId: "" };

// ── QR Modal ─────────────────────────────────────────────────────────────────

function QRModal({ poi, onClose }: { poi: Poi; onClose: () => void }) {
  const webAppUrl = process.env.NEXT_PUBLIC_WEB_APP_URL ?? "https://voztrip-web.vercel.app";
  const qrValue = `${webAppUrl}/poi/${poi.poiId}`;
  const svgRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const size = 400;
    canvas.width = size;
    canvas.height = size + 60; // thêm chỗ cho label

    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fdfaf4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.onload = () => {
      // vẽ padding trắng xung quanh QR
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(20, 20, size - 40, size - 40);
      ctx.drawImage(img, 20, 20, size - 40, size - 40);

      // label tên POI
      ctx.fillStyle = "#2c2416";
      ctx.font = "14px Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(poi.poiName, size / 2, size + 20);

      ctx.fillStyle = "#b09878";
      ctx.font = "11px sans-serif";
      ctx.fillText("Quét để xem thuyết minh · VozTrip", size / 2, size + 42);

      const link = document.createElement("a");
      link.download = `QR_${poi.poiName.replace(/\s+/g, "_")}.png`;
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
        {/* Header */}
        <div className="w-full">
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>QR Code</div>
          <div className="text-lg font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
            {poi.poiName}
          </div>
        </div>

        {/* QR */}
        <div
          ref={svgRef}
          className="p-5"
          style={{ backgroundColor: "#ffffff", border: "1px solid #e8dfc8", borderRadius: "2px" }}
        >
          <QRCode
            value={qrValue}
            size={200}
            bgColor="#ffffff"
            fgColor="#2c2416"
            level="M"
          />
        </div>

        {/* Value hint */}
        <div className="text-center">
          <div className="text-xs" style={{ color: "#b09878" }}>
            Quét bằng camera điện thoại để vào VozTrip
          </div>
          <div
            className="text-xs mt-1 px-2 py-1 font-mono"
            style={{ color: "#8c7a5e", backgroundColor: "#f0e8d8", borderRadius: "2px" }}
          >
            {qrValue}
          </div>
        </div>

        {/* Actions */}
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

// ── Boost Modal ───────────────────────────────────────────────────────────────

const BOOST_POLL_MS = 3_000;
const BOOST_EXPIRE_SECS = 900;

function BoostModal({ poi, session, onClose, onSuccess }: {
  poi: Poi;
  session: any;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };
  const [order, setOrder] = useState<BoostOrder | null>(null);
  const [timeLeft, setTimeLeft] = useState(BOOST_EXPIRE_SECS);
  const [loading, setLoading] = useState(false);

  const isActive = poi.isFeatured && poi.featuredUntil && new Date(poi.featuredUntil) > new Date();

  const createOrder = async () => {
    setLoading(true);
    try {
      const res = await api.post<BoostOrder>(
        `/api/seller/pois/${poi.poiId}/boost/order`,
        {},
        { headers: authHeader }
      );
      setOrder(res.data);
      setTimeLeft(res.data.expiresInSeconds);
    } catch {}
    setLoading(false);
  };

  // Countdown
  useEffect(() => {
    if (!order || timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [order, timeLeft]);

  // Poll
  useEffect(() => {
    if (!order || timeLeft <= 0) return;
    const poll = async () => {
      try {
        const res = await api.get<{ status: string }>(
          `/api/seller/orders/${order.orderId}`,
          { headers: authHeader }
        );
        if (res.data.status === "paid") onSuccess();
      } catch {}
    };
    const interval = setInterval(poll, BOOST_POLL_MS);
    return () => clearInterval(interval);
  }, [order, timeLeft]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(44,36,22,0.6)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm p-8 flex flex-col gap-5"
        style={{ backgroundColor: "#fdfaf4", borderRadius: "2px" }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Tăng hiện diện</div>
          <div className="text-lg font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
            Boost POI · {poi.poiName}
          </div>
        </div>

        {isActive && (
          <div className="px-4 py-3 text-xs" style={{ backgroundColor: "#fdf6e8", border: "1px solid #e8d5a8", borderRadius: "2px", color: "#8c7a5e" }}>
            POI đang được boost đến <strong>{new Date(poi.featuredUntil!).toLocaleDateString("vi-VN")}</strong>.
            Thanh toán thêm để gia hạn.
          </div>
        )}

        <div className="text-xs" style={{ color: "#8c7a5e" }}>
          Boost đánh dấu POI là <span style={{ color: "#c8a96e" }}>nổi bật</span> trong {order?.boostDays ?? 30} ngày.
          Giá: <strong style={{ color: "#2c2416" }}>{(3_000).toLocaleString("vi-VN")}đ</strong>
        </div>

        {!order ? (
          <button
            onClick={createOrder}
            disabled={loading}
            className="w-full py-3 text-xs tracking-widest uppercase"
            style={{
              backgroundColor: "#c8a96e", color: "#fff",
              borderRadius: "1px", opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? "Đang tạo đơn..." : "Tạo đơn thanh toán"}
          </button>
        ) : timeLeft > 0 ? (
          <div className="flex flex-col items-center gap-4">
            <img src={order.qrUrl} alt="QR boost" width={200} height={200} className="mx-auto" style={{ borderRadius: "2px" }} />
            <div
              className="font-mono text-sm font-semibold px-3 py-2 select-all text-center w-full"
              style={{ backgroundColor: "#f0e8d8", color: "#2c2416", borderRadius: "2px", letterSpacing: "0.1em" }}
            >
              {order.orderCode}
            </div>
            <div className="text-xs flex items-center gap-2" style={{ color: "#8c7a5e" }}>
              Hết hạn sau
              <span className="font-mono px-2 py-0.5" style={{ backgroundColor: "#f0e8d8", borderRadius: "2px", color: "#2c2416" }}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="text-xs flex items-center gap-2" style={{ color: "#8c7a5e" }}>
              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: "#2c7a3c" }} />
              Đang chờ xác nhận...
            </div>
          </div>
        ) : (
          <div className="text-xs text-center" style={{ color: "#dc2626" }}>
            Đơn đã hết hạn.{" "}
            <button className="underline" onClick={() => { setOrder(null); setTimeLeft(BOOST_EXPIRE_SECS); }}>Tạo lại</button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-2 text-xs tracking-widest uppercase"
          style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PoisPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [qrPoi, setQrPoi] = useState<Poi | null>(null);
  const [boostPoi, setBoostPoi] = useState<Poi | null>(null);

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: zones = [] } = useQuery<Zone[]>({
    queryKey: ["admin-zones"],
    queryFn: () => api.get("/api/admin/zones", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  const { data: pois = [], isLoading } = useQuery<Poi[]>({
    queryKey: ["seller-pois"],
    queryFn: () => api.get("/api/seller/pois", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  const createMutation = useMutation({
    mutationFn: (body: object) =>
      api.post("/api/seller/pois", body, { headers: authHeader }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["seller-pois"] });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      router.push(`/seller/pois/${res.data.poiId}`);
    },
    onError: (err: any) => {
      const code = err?.response?.data?.code;
      if (code === "PLAN_LIMIT") {
        setShowCreate(false);
        router.push("/seller/upgrade");
      } else {
        setFormError("Tạo POI thất bại, kiểm tra lại thông tin.");
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (poiId: string) =>
      api.delete(`/api/seller/pois/${poiId}`, { headers: authHeader }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["seller-pois"] }),
  });

  const handleCreate = () => {
    setFormError("");
    const lat = parseFloat(form.latitude);
    const lng = parseFloat(form.longitude);
    const radius = parseFloat(form.triggerRadius);
    if (!form.poiName.trim()) return setFormError("Tên không được trống.");
    if (isNaN(lat) || isNaN(lng)) return setFormError("Tọa độ không hợp lệ.");
    createMutation.mutate({ poiName: form.poiName.trim(), latitude: lat, longitude: lng, triggerRadius: radius, zoneId: form.zoneId || null });
  };

  return (
    <div>
      {/* QR Modal */}
      {qrPoi && <QRModal poi={qrPoi} onClose={() => setQrPoi(null)} />}

      {/* Boost Modal */}
      {boostPoi && (
        <BoostModal
          poi={boostPoi}
          session={session}
          onClose={() => setBoostPoi(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["seller-pois"] });
            setBoostPoi(null);
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Quản lý</div>
          <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Điểm tham quan</h1>
        </div>
        <button
          onClick={() => { setShowCreate(true); setFormError(""); setForm(EMPTY_FORM); }}
          className="px-5 py-2 text-xs tracking-widest uppercase transition-all"
          style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
          onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#c8a96e")}
          onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#2c2416")}
        >
          + Thêm POI
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: "rgba(44,36,22,0.5)" }}>
          <div className="w-full max-w-xl p-8 my-auto" style={{ backgroundColor: "#fdfaf4", borderRadius: "2px" }}>
            <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Tạo mới</div>
            <h2 className="text-lg font-light mb-6" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Điểm tham quan mới</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Tên POI *</label>
                <input
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                  value={form.poiName}
                  onChange={e => setForm(f => ({ ...f, poiName: e.target.value }))}
                  placeholder="Vd: Văn Miếu Quốc Tử Giám"
                />
              </div>

              {/* Tọa độ — nhập thủ công */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Vĩ độ *</label>
                  <input
                    className="w-full px-3 py-2 text-sm outline-none font-mono"
                    style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                    value={form.latitude}
                    onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                    placeholder="21.0283"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Kinh độ *</label>
                  <input
                    className="w-full px-3 py-2 text-sm outline-none font-mono"
                    style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                    value={form.longitude}
                    onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                    placeholder="105.8347"
                  />
                </div>
              </div>

              {/* Map picker */}
              <div>
                <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: "#8c7a5e" }}>
                  Chọn vị trí trên bản đồ
                  <span className="ml-2 normal-case" style={{ color: "#b09878" }}>(click hoặc kéo ghim)</span>
                </label>
                <MapPicker
                  lat={parseFloat(form.latitude) || 21.028}
                  lng={parseFloat(form.longitude) || 105.834}
                  onChange={(lat, lng) => setForm(f => ({
                    ...f,
                    latitude: lat.toFixed(6),
                    longitude: lng.toFixed(6),
                  }))}
                />
              </div>

              <div>
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Zone</label>
                <select
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                  value={form.zoneId}
                  onChange={e => setForm(f => ({ ...f, zoneId: e.target.value }))}
                >
                  <option value="">— Không chọn zone —</option>
                  {zones.map(z => (
                    <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Bán kính GPS trigger (m)</label>
                <input
                  className="w-full px-3 py-2 text-sm outline-none"
                  style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                  value={form.triggerRadius}
                  onChange={e => setForm(f => ({ ...f, triggerRadius: e.target.value }))}
                  placeholder="10"
                  type="number"
                />
              </div>
            </div>

            {formError && <p className="text-xs mt-3" style={{ color: "#dc2626" }}>{formError}</p>}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreate}
                disabled={createMutation.isPending}
                className="flex-1 py-2 text-xs tracking-widest uppercase"
                style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px", opacity: createMutation.isPending ? 0.6 : 1 }}
              >
                {createMutation.isPending ? "Đang tạo..." : "Tạo"}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2 text-xs tracking-widest uppercase"
                style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="text-xs tracking-widest" style={{ color: "#8c7a5e" }}>Đang tải...</div>
      ) : pois.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-xs tracking-widest uppercase mb-3" style={{ color: "#b09878" }}>Chưa có điểm tham quan nào</div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2 text-xs tracking-widest uppercase"
            style={{ border: "1px solid #c8a96e", color: "#c8a96e", borderRadius: "1px" }}
          >
            Thêm ngay
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pois.map(poi => (
            <div
              key={poi.poiId}
              className="px-5 py-4 flex items-center gap-4"
              style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px" }}
            >
              {/* Status dot */}
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: poi.isActive ? "#16a34a" : "#9ca3af" }}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium" style={{ color: "#2c2416" }}>{poi.poiName}</span>
                  {poi.zoneName && (
                    <span className="text-xs px-2 py-0.5" style={{ backgroundColor: "#fdf6e8", color: "#c8a96e", border: "1px solid #e8d5a8", borderRadius: "2px" }}>
                      {poi.zoneName}
                    </span>
                  )}
                  {poi.isFeatured && poi.featuredUntil && new Date(poi.featuredUntil) > new Date() && (
                    <span className="text-xs px-2 py-0.5" style={{ backgroundColor: "#fef3c7", color: "#92400e", border: "1px solid #fde68a", borderRadius: "2px" }}>
                      ✦ Đang boost
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: "#8c7a5e" }}>
                  {poi.latitude.toFixed(5)}, {poi.longitude.toFixed(5)}
                  {" · "}GPS {poi.triggerRadius}m
                  {" · "}
                  <span style={{ color: poi.localizationCount > 0 ? "#16a34a" : "#b09878" }}>
                    {poi.localizationCount} ngôn ngữ
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setBoostPoi(poi)}
                  className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
                  style={{ border: "1px solid #e8d5a8", color: "#92400e", borderRadius: "1px" }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = "#fef3c7"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = "transparent"; }}
                >
                  Boost
                </button>
                <button
                  onClick={() => setQrPoi(poi)}
                  className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
                  style={{ border: "1px solid #c8a96e", color: "#c8a96e", borderRadius: "1px" }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.backgroundColor = "#c8a96e"; (e.target as HTMLElement).style.color = "#fff"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.backgroundColor = "transparent"; (e.target as HTMLElement).style.color = "#c8a96e"; }}
                >
                  QR
                </button>
                <button
                  onClick={() => router.push(`/seller/pois/${poi.poiId}`)}
                  className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
                  style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
                  onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#c8a96e")}
                  onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#2c2416")}
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Xóa "${poi.poiName}"? Hành động này không thể hoàn tác.`))
                      deleteMutation.mutate(poi.poiId);
                  }}
                  className="px-4 py-2 text-xs tracking-widest uppercase transition-all"
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
