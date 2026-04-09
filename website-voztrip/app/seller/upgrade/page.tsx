"use client";

import { useState } from "react";
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

const VIP_PRICE = "299.000đ";

export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [card, setCard] = useState({ number: "", holder: "", expiry: "", cvv: "" });
  const [step, setStep] = useState<"info" | "payment" | "success">("info");
  const [error, setError] = useState("");

  const authHeader = { Authorization: `Bearer ${session?.accessToken}` };

  const { data: profile } = useQuery<Profile>({
    queryKey: ["seller-profile"],
    queryFn: () => api.get("/api/seller/profile", { headers: authHeader }).then(r => r.data),
    enabled: !!session?.accessToken,
  });

  const upgradeMutation = useMutation({
    mutationFn: () =>
      api.post("/api/seller/upgrade", {
        cardNumber: card.number.replace(/\s/g, ""),
        cardHolder: card.holder,
      }, { headers: authHeader }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-profile"] });
      queryClient.invalidateQueries({ queryKey: ["seller-stats"] });
      setStep("success");
    },
    onError: (err: any) => {
      setError(err?.response?.data?.message ?? "Thanh toán thất bại. Vui lòng thử lại.");
    },
  });

  const formatCard = (val: string) =>
    val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

  const handlePay = () => {
    setError("");
    if (card.number.replace(/\s/g, "").length !== 16) return setError("Số thẻ phải có 16 chữ số.");
    if (!card.holder.trim()) return setError("Vui lòng nhập tên chủ thẻ.");
    if (!card.expiry.match(/^\d{2}\/\d{2}$/)) return setError("Ngày hết hạn không hợp lệ (MM/YY).");
    if (card.cvv.length < 3) return setError("CVV không hợp lệ.");
    upgradeMutation.mutate();
  };

  // Đã là VIP
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

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#b09060" }}>Gói dịch vụ</div>
        <h1 className="text-2xl font-light" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>Nâng cấp VIP</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-2xl lg:grid-cols-2">
        {/* So sánh gói */}
        <div className="space-y-3">
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
              <li>✓ Q&A</li>
              <li style={{ color: "#d8cbb0" }}>✗ Thêm POI</li>
              <li style={{ color: "#d8cbb0" }}>✗ Analytics nâng cao</li>
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
              <li>✓ Q&A</li>
              <li>✓ Ưu tiên hỗ trợ</li>
              <li>✓ Analytics nâng cao</li>
            </ul>
          </div>
        </div>

        {/* Form thanh toán */}
        <div className="p-6" style={{ backgroundColor: "#fdfaf4", border: "1px solid #e8dfc8", borderRadius: "2px" }}>
          <div className="text-xs tracking-[0.25em] uppercase mb-5" style={{ color: "#8c7a5e" }}>Thông tin thanh toán</div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Số thẻ</label>
              <input
                className="w-full px-3 py-2 text-sm outline-none font-mono tracking-widest"
                style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                value={card.number}
                onChange={e => setCard(c => ({ ...c, number: formatCard(e.target.value) }))}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Tên chủ thẻ</label>
              <input
                className="w-full px-3 py-2 text-sm outline-none uppercase"
                style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                value={card.holder}
                onChange={e => setCard(c => ({ ...c, holder: e.target.value.toUpperCase() }))}
                placeholder="NGUYEN VAN A"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>Hết hạn</label>
                <input
                  className="w-full px-3 py-2 text-sm outline-none font-mono"
                  style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                  value={card.expiry}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                    setCard(c => ({ ...c, expiry: v }));
                  }}
                  placeholder="MM/YY"
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-xs tracking-widest uppercase mb-1" style={{ color: "#8c7a5e" }}>CVV</label>
                <input
                  className="w-full px-3 py-2 text-sm outline-none font-mono"
                  style={{ border: "1px solid #d8cbb0", backgroundColor: "#fff", color: "#2c2416" }}
                  value={card.cvv}
                  onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                  placeholder="•••"
                  type="password"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs mt-3" style={{ color: "#dc2626" }}>{error}</p>}

          {/* Mock notice */}
          <div className="mt-4 px-3 py-2 text-xs" style={{ backgroundColor: "#fef3c7", color: "#92400e", borderRadius: "2px" }}>
            Demo: nhập bất kỳ số thẻ 16 chữ số để thử thanh toán
          </div>

          <button
            onClick={handlePay}
            disabled={upgradeMutation.isPending}
            className="w-full mt-5 py-3 text-xs tracking-widest uppercase"
            style={{
              backgroundColor: "#c8a96e",
              color: "#fff",
              borderRadius: "1px",
              opacity: upgradeMutation.isPending ? 0.7 : 1,
            }}
            onMouseEnter={e => ((e.target as HTMLElement).style.backgroundColor = "#2c2416")}
            onMouseLeave={e => ((e.target as HTMLElement).style.backgroundColor = "#c8a96e")}
          >
            {upgradeMutation.isPending ? "Đang xử lý..." : `Thanh toán ${VIP_PRICE}`}
          </button>

          <div className="mt-3 text-xs text-center" style={{ color: "#b09878" }}>
            Thanh toán 1 lần · Không gia hạn tự động
          </div>
        </div>
      </div>
    </div>
  );
}
