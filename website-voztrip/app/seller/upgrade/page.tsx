"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Profile = {
  shopName: string;
  plan: string;
  planUpgradedAt: string | null;
  poiCount: number;
  poiLimit: number | null;
};

type OrderInfo = {
  orderId: string;
  orderCode: string;
  amount: number;
  qrUrl: string;
  expiresInSeconds: number;
};

const VIP_PRICE = "3.000đ";
const POLL_INTERVAL_MS = 3_000;
const EXPIRE_SECS = 900;

export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"info" | "qr" | "success">("info");
  const [order, setOrder] = useState<OrderInfo | null>(null);
  const [timeLeft, setTimeLeft] = useState(EXPIRE_SECS);
  const [pollError, setPollError] = useState("");

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: profile } = useQuery<Profile>({
    queryKey: ["seller-profile"],
    queryFn: () => api.get("/api/seller/profile", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  // Tạo đơn hàng
  const createOrderMutation = useMutation({
    mutationFn: () =>
      api.post<OrderInfo>("/api/seller/upgrade/order", {}, { headers: authHeader }).then(r => r.data),
    onSuccess: (data) => {
      setOrder(data);
      setTimeLeft(data.expiresInSeconds);
      setStep("qr");
      setPollError("");
    },
  });

  // Đếm ngược
  useEffect(() => {
    if (step !== "qr") return;
    if (timeLeft <= 0) return;
    const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [step, timeLeft]);

  // Poll trạng thái thanh toán
  useEffect(() => {
    if (step !== "qr" || !order) return;
    if (timeLeft <= 0) return;

    const poll = async () => {
      try {
        const res = await api.get<{ status: string }>(
          `/api/seller/upgrade/order/${order.orderId}`,
          { headers: authHeader }
        );
        if (res.data.status === "paid") {
          queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
          queryClient.invalidateQueries({ queryKey: ["seller-stats"] });
          setStep("success");
        }
      } catch {}
    };

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [step, order, timeLeft]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Đã VIP ───────────────────────────────────────────────────────────────

  if (profile?.plan === "vip" && step !== "success") {
    return (
      <div>
        <div className="mb-8">
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Gói dịch vụ</div>
          <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Nâng cấp VIP</h1>
        </div>
        <div className="max-w-md p-8 text-center" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px" }}>
          <div className="text-4xl mb-3">✦</div>
          <div className="text-lg font-light mb-2" style={{ color: "#c8a96e", fontFamily: "Georgia, serif" }}>Bạn đang là thành viên VIP</div>
          <div className="text-xs mb-6" style={{ color: "#8c7a5e" }}>
            Nâng cấp lúc {profile.planUpgradedAt ? new Date(profile.planUpgradedAt).toLocaleDateString("vi-VN") : "—"}
          </div>
          <div className="text-sm mb-6" style={{ color: "#2c2416" }}>
            Bạn có thể tạo <strong>không giới hạn</strong> điểm tham quan.
          </div>
          <button
            onClick={() => router.push("/seller/pois")}
            className="px-6 py-2 text-xs tracking-widest uppercase"
            style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
          >
            Quản lý POI →
          </button>
        </div>
      </div>
    );
  }

  // ── Thành công ────────────────────────────────────────────────────────────

  if (step === "success") {
    return (
      <div>
        <div className="mb-8">
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Gói dịch vụ</div>
          <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Nâng cấp VIP</h1>
        </div>
        <div className="max-w-md p-10 text-center" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px" }}>
          <div className="text-5xl mb-4">✦</div>
          <div className="text-xl font-light mb-2" style={{ color: "#c8a96e", fontFamily: "Georgia, serif" }}>
            Chào mừng bạn trở thành VIP!
          </div>
          <div className="text-sm mb-8" style={{ color: "#8c7a5e" }}>
            Thanh toán thành công. Bạn có thể tạo không giới hạn điểm tham quan.
          </div>
          <button
            onClick={() => router.push("/seller/pois")}
            className="px-8 py-3 text-xs tracking-widest uppercase"
            style={{ backgroundColor: "#2c2416", color: "#f5f0e8", borderRadius: "1px" }}
            onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#c8a96e")}
            onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#2c2416")}
          >
            Quản lý điểm tham quan →
          </button>
        </div>
      </div>
    );
  }

  // ── QR thanh toán ────────────────────────────────────────────────────────

  if (step === "qr" && order) {
    return (
      <div>
        <div className="mb-8">
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Gói dịch vụ</div>
          <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Thanh toán VIP</h1>
        </div>

        <div className="max-w-sm">
          <div className="p-6 text-center" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px" }}>
            {/* QR code */}
            <img
              src={order.qrUrl}
              alt="QR chuyển khoản"
              width={220}
              height={220}
              className="mx-auto mb-4"
              style={{ borderRadius: "2px" }}
            />

            <div className="text-xs mb-1" style={{ color: "#8c7a5e" }}>Nội dung chuyển khoản</div>
            <div
              className="font-mono text-sm font-semibold mb-4 px-3 py-2 select-all"
              style={{ backgroundColor: "#f0e8d8", color: "#2c2416", borderRadius: "2px", letterSpacing: "0.1em" }}
            >
              {order.orderCode}
            </div>

            <div className="text-xs mb-1" style={{ color: "#8c7a5e" }}>Số tiền</div>
            <div className="text-xl font-light mb-5" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
              {order.amount.toLocaleString("vi-VN")}đ
            </div>

            {/* Countdown */}
            {timeLeft > 0 ? (
              <div className="flex items-center justify-center gap-2 mb-5 text-xs" style={{ color: "#8c7a5e" }}>
                <span>Hết hạn sau</span>
                <span
                  className="font-mono px-2 py-0.5"
                  style={{
                    backgroundColor: timeLeft < 120 ? "#fef3c7" : "#f0e8d8",
                    color: timeLeft < 120 ? "#92400e" : "#2c2416",
                    borderRadius: "2px",
                  }}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            ) : (
              <div className="text-xs mb-5" style={{ color: "#dc2626" }}>
                Đơn đã hết hạn.{" "}
                <button className="underline" onClick={() => { setStep("info"); setOrder(null); }}>
                  Tạo đơn mới
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-xs mb-2" style={{ color: "#8c7a5e" }}>
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: "#2c7a3c", animation: "pulse 1.5s infinite" }}
              />
              Đang chờ xác nhận thanh toán...
            </div>
          </div>

          <div className="mt-4 text-xs text-center" style={{ color: "#b09878" }}>
            Mở app ngân hàng → Quét QR hoặc chuyển khoản với nội dung <strong>{order.orderCode}</strong>
          </div>

          <button
            onClick={() => { setStep("info"); setOrder(null); }}
            className="mt-4 w-full py-2 text-xs tracking-widest uppercase"
            style={{ border: "1px solid #d8cbb0", color: "#8c7a5e", borderRadius: "1px" }}
          >
            Hủy
          </button>
        </div>
      </div>
    );
  }

  // ── Trang thông tin ───────────────────────────────────────────────────────

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Gói dịch vụ</div>
        <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Nâng cấp VIP</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-xl lg:grid-cols-2">
        {/* Free */}
        <div className="p-5" style={{ border: "1px solid #e8dfc8", backgroundColor: "#fdfaf4", borderRadius: "2px" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs tracking-widest uppercase" style={{ color: "#8c7a5e" }}>Gói hiện tại</div>
            <span className="text-xs px-2 py-0.5" style={{ backgroundColor: "#f0e8d8", color: "#8c7a5e", borderRadius: "2px" }}>Free</span>
          </div>
          <div className="text-2xl font-light mb-4" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>0đ</div>
          <ul className="space-y-2 text-xs" style={{ color: "#8c7a5e" }}>
            <li>✓ 1 điểm tham quan</li>
            <li>✓ Đa ngôn ngữ</li>
            <li>✓ Upload audio</li>
            <li>✓ Q&amp;A</li>
            <li style={{ color: "#d8cbb0" }}>✗ Thêm POI</li>
            <li style={{ color: "#d8cbb0" }}>✗ Boost POI</li>
          </ul>
        </div>

        {/* VIP */}
        <div className="p-5" style={{ border: "2px solid #c8a96e", backgroundColor: "#fdfaf4", borderRadius: "2px" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs tracking-widest uppercase" style={{ color: "#c8a96e" }}>Nâng cấp lên</div>
            <span className="text-xs px-2 py-0.5" style={{ backgroundColor: "#c8a96e", color: "#fff", borderRadius: "2px" }}>VIP</span>
          </div>
          <div className="text-2xl font-light mb-1" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>{VIP_PRICE}</div>
          <div className="text-xs mb-4" style={{ color: "#b09878" }}>một lần duy nhất</div>
          <ul className="space-y-2 text-xs" style={{ color: "#2c2416" }}>
            <li>✓ Không giới hạn điểm tham quan</li>
            <li>✓ Đa ngôn ngữ</li>
            <li>✓ Upload audio</li>
            <li>✓ Q&amp;A</li>
            <li>✓ Boost POI tăng hiện diện</li>
            <li>✓ Analytics nâng cao</li>
          </ul>

          <button
            onClick={() => createOrderMutation.mutate()}
            disabled={createOrderMutation.isPending}
            className="w-full mt-6 py-3 text-xs tracking-widest uppercase"
            style={{
              backgroundColor: "#c8a96e",
              color: "#fff",
              borderRadius: "1px",
              opacity: createOrderMutation.isPending ? 0.7 : 1,
              border: "none",
              cursor: createOrderMutation.isPending ? "wait" : "pointer",
            }}
            onMouseEnter={e => { if (!createOrderMutation.isPending) (e.target as HTMLElement).style.backgroundColor = "#2c2416"; }}
            onMouseLeave={e => { if (!createOrderMutation.isPending) (e.target as HTMLElement).style.backgroundColor = "#c8a96e"; }}
          >
            {createOrderMutation.isPending ? "Đang tạo đơn..." : `Thanh toán ${VIP_PRICE}`}
          </button>

          {createOrderMutation.isError && (
            <p className="text-xs mt-2" style={{ color: "#dc2626" }}>
              {(createOrderMutation.error as any)?.response?.data?.message ?? "Có lỗi xảy ra."}
            </p>
          )}

          <div className="mt-3 text-xs text-center" style={{ color: "#b09878" }}>
            Thanh toán qua chuyển khoản ngân hàng · Xác nhận tự động
          </div>
        </div>
      </div>
    </div>
  );
}
