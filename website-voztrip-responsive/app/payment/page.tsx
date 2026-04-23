"use client";
import { useRouter } from "next/navigation";
import { RefreshCw, Copy, Clock, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { checkDeviceStatus } from "@/services/api";
import { useLanguage } from "@/context/LanguageContext";
import { tr } from "@/lib/translations";

export default function PaymentPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const [deviceId, setDeviceId] = useState("");
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "simulating">("idle");
  const [countdown, setCountdown] = useState(0);
  const [copied, setCopied] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showConsentWarning, setShowConsentWarning] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("voz_session") ?? "";
    setDeviceId(id);
    if (localStorage.getItem("voz_consent") === "true") setAgreed(true);
  }, []);

  const navigateAfterApproval = () => {
    const redirect = localStorage.getItem("redirect_after");
    localStorage.removeItem("redirect_after");
    const hasLang = !!localStorage.getItem("voz_lang");
    if (!hasLang) {
      router.replace("/language");
    } else if (redirect && redirect !== "/payment") {
      router.replace(redirect);
    } else {
      router.replace("/home");
    }
  };

  useEffect(() => {
    if (countdown <= 0) return;
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

  const toggleAgreed = () => {
    const next = !agreed;
    setAgreed(next);
    setShowConsentWarning(false);
    localStorage.setItem("voz_consent", String(next));
  };

  const handleCheck = async () => {
    if (!agreed) { setShowConsentWarning(true); return; }
    if (!deviceId || checking || countdown > 0) return;
    setChecking(true);
    setStatus("idle");

    const result = await checkDeviceStatus(deviceId);
    setChecking(false);

    if (result === "approved") {
      localStorage.setItem("device_approved", "true");
      router.replace("/language");
    } else if (result === "unreachable") {
      setStatus("simulating");
      setCountdown(3);
    } else {
      setStatus("pending");
    }
  };

  return (
    <div className="min-h-screen bg-[#fce4ec] flex flex-col items-center justify-center px-8 gap-3">
      <p className="text-xl font-bold text-[#2c2416] tracking-wide">NGUYỄN QUỐC HUY</p>
      <p className="text-sm text-[#8c7a5e] mb-2">*******085</p>

      {/* QR card */}
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
        <p className="text-[10px] text-[#b09878] tracking-wider uppercase mb-1">
          {tr("payment_transfer_label", lang)}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-base font-bold text-[#2c2416] tracking-wider">{transferContent}</p>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 bg-[#f5f0e8] rounded-lg px-2.5 py-1.5 text-xs text-[#8c7a5e]"
          >
            <Copy size={12} />
            {copied ? tr("payment_copied", lang) : tr("payment_copy", lang)}
          </button>
        </div>
        <p className="text-[10px] text-[#b09878] mt-1">{tr("payment_transfer_note", lang)}</p>
      </div>

      {/* Status messages */}
      {status === "pending" && (
        <div className="w-full max-w-xs bg-[#fff7ed] border border-[#fed7aa] rounded-xl px-4 py-3 text-center">
          <p className="text-sm text-[#ea580c] font-medium">{tr("payment_pending_title", lang)}</p>
          <p className="text-xs text-[#9a3412] mt-0.5">{tr("payment_pending_sub", lang)}</p>
        </div>
      )}

      {status === "simulating" && countdown > 0 && (
        <div className="w-full max-w-xs bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Clock size={14} color="#16a34a" />
            <p className="text-sm text-[#16a34a] font-medium">{tr("payment_approving", lang)}</p>
          </div>
          <p className="text-2xl font-bold text-[#16a34a]">{countdown}</p>
          <p className="text-xs text-[#166534] mt-0.5">
            {tr("payment_auto_enter", lang).replace("{n}", String(countdown))}
          </p>
        </div>
      )}

      {/* Consent */}
      <div className="w-full max-w-xs flex flex-col gap-1.5">
        {showConsentWarning && !agreed && (
          <p className="text-[11px] text-[#c0392b] bg-[#fdf2f2] border border-[#f5c6c6] rounded-lg px-3 py-2">
            {tr("lang_consent_warning", lang)}
          </p>
        )}
        <button onClick={toggleAgreed} className="flex items-start gap-3 text-left">
          <div className={`w-5 h-5 rounded-md border-[1.5px] flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
            agreed ? "bg-[#2c2416] border-[#2c2416]" : "bg-white border-[#d8cbb0]"
          }`}>
            {agreed && <Check size={13} color="#fdfaf4" />}
          </div>
          <p className="flex-1 text-[13px] text-[#5c4a30] leading-5">
            {tr("lang_consent_text", lang)}{" "}
            <a
              href="/privacy"
              target="_blank"
              onClick={(e) => e.stopPropagation()}
              className="text-[#c8a96e] underline"
            >
              {tr("lang_consent_link", lang)}
            </a>{" "}
            {tr("lang_consent_suffix", lang)}
          </p>
        </button>
        <p className="text-[11px] text-[#b09878] pl-8">{tr("lang_consent_sub", lang)}</p>
      </div>

      {/* Check button */}
      <button
        onClick={handleCheck}
        disabled={checking || countdown > 0}
        className="w-full max-w-xs flex items-center justify-center gap-2 bg-[#2c2416] px-10 py-3.5 rounded-full shadow-md active:scale-95 transition-transform disabled:opacity-60"
      >
        <RefreshCw size={18} color="#c8a96e" className={checking ? "animate-spin" : ""} />
        <span className="text-[15px] font-semibold text-white">
          {checking
            ? tr("payment_checking", lang)
            : countdown > 0
            ? tr("payment_enter_btn", lang).replace("{n}", String(countdown))
            : tr("payment_check_btn", lang)}
        </span>
      </button>
    </div>
  );
}
