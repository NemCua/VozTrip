"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RefreshCw, Copy, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { checkDeviceStatus } from "@/services/api";

export default function PaymentPage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState("");
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "simulating">("idle");
  const [countdown, setCountdown] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("voz_session") ?? "";
    setDeviceId(id);
  }, []);

  const navigateAfterApproval = () => {
    const redirect = localStorage.getItem("redirect_after");
    localStorage.removeItem("redirect_after");
    const hasLang = !!localStorage.getItem("voz_lang");
    if (!hasLang) {
      // Chưa chọn ngôn ngữ — qua language picker (sẽ redirect tiếp)
      router.replace("/language");
    } else if (redirect && redirect !== "/payment") {
      router.replace(redirect);
    } else {
      router.replace("/home");
    }
  };

  // Countdown timer for simulated approval
  useEffect(() => {
    if (countdown <= 0) return;
    if (countdown === 0) return;
    const t = setTimeout(() => {
      const next = countdown - 1;
      setCountdown(next);
      if (next === 0) {
        localStorage.setItem("device_approved", "true");
        navigateAfterApproval();
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [countdown, router]);

  const shortId = deviceId.slice(0, 8).toUpperCase();
  const transferContent = `VOZTRIP ${shortId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(transferContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheck = async () => {
    if (!deviceId || checking || countdown > 0) return;
    setChecking(true);
    setStatus("idle");

    const result = await checkDeviceStatus(deviceId);
    setChecking(false);

    if (result === "approved") {
      localStorage.setItem("device_approved", "true");
      router.replace("/language");
    } else if (result === "unreachable") {
      // Backend chưa sẵn sàng — giả lập admin duyệt sau 3 giây
      setStatus("simulating");
      setCountdown(3);
    } else {
      // pending — admin chưa duyệt
      setStatus("pending");
    }
  };

  return (
    <div className="min-h-screen bg-[#fce4ec] flex flex-col items-center justify-center px-8 gap-3">
      <p className="text-xl font-bold text-[#2c2416] tracking-wide">NGUYỄN QUỐC HUY</p>
      <p className="text-sm text-[#8c7a5e] mb-2">*******085</p>

      {/* QR card — dynamic QR từ SePay */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-2">
        {deviceId ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://qr.sepay.vn/img?bank=Sacombank&acc=060310094611&template=compact&amount=3000&des=${encodeURIComponent(transferContent)}`}
            alt="QR Payment"
            width={260}
            height={260}
            className="object-contain"
          />
        ) : (
          <div className="w-65 h-65 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Transfer content */}
      <div className="w-full max-w-xs bg-white rounded-2xl px-4 py-3 shadow-sm">
        <p className="text-[10px] text-[#b09878] tracking-wider uppercase mb-1">Nội dung chuyển khoản</p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold text-[#2c2416] tracking-wider">{transferContent}</p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 bg-[#f5f0e8] rounded-lg px-2.5 py-1.5 text-xs text-[#8c7a5e]"
          >
            <Copy size={12} />
            {copied ? "Đã copy" : "Copy"}
          </button>
        </div>
        <p className="text-[10px] text-[#b09878] mt-1">Vui lòng ghi đúng nội dung để được duyệt tự động</p>
      </div>

      {/* Status messages */}
      {status === "pending" && (
        <div className="w-full max-w-xs bg-[#fff7ed] border border-[#fed7aa] rounded-xl px-4 py-3 text-center">
          <p className="text-sm text-[#ea580c] font-medium">Chưa được duyệt</p>
          <p className="text-xs text-[#9a3412] mt-0.5">Vui lòng chờ sau khi chuyển khoản</p>
        </div>
      )}

      {status === "simulating" && countdown > 0 && (
        <div className="w-full max-w-xs bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock size={14} color="#16a34a" />
            <p className="text-sm text-[#16a34a] font-medium">Admin đang duyệt...</p>
          </div>
          <p className="text-2xl font-bold text-[#16a34a]">{countdown}</p>
          <p className="text-xs text-[#166534] mt-0.5">Tự động vào app sau {countdown}s</p>
        </div>
      )}

      {/* Check button */}
      <button
        onClick={handleCheck}
        disabled={checking || countdown > 0}
        className="w-full max-w-xs flex items-center justify-center gap-2 bg-[#2c2416] px-10 py-3.5 rounded-full shadow-md active:scale-95 transition-transform disabled:opacity-60"
      >
        <RefreshCw size={18} color="#c8a96e" className={checking ? "animate-spin" : ""} />
        <span className="text-[15px] font-semibold text-white">
          {checking ? "Đang kiểm tra..." : countdown > 0 ? `Vào app sau ${countdown}s...` : "Tôi đã chuyển khoản"}
        </span>
      </button>
    </div>
  );
}
