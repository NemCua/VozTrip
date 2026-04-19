"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ScanLine, CheckCircle } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { useLanguage } from "@/context/LanguageContext";
import { tr } from "@/lib/translations";

type State = "requesting" | "denied" | "scanning" | "scanned" | "error";

export default function ScanPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [state, setState] = useState<State>("requesting");

  useEffect(() => {
    const scannerId = "qr-reader";
    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => {
          if (state === "scanned") return;
          setState("scanned");

          const match = decodedText.match(/^voztrip:poi:(.+)$/);
          if (match) {
            setTimeout(() => router.push(`/poi/${match[1]}`), 700);
          } else {
            setTimeout(() => setState("scanning"), 2500);
          }
        },
        () => {}
      )
      .then(() => setState("scanning"))
      .catch(() => setState("denied"));

    return () => {
      scanner.isScanning && scanner.stop().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "denied") {
    return (
      <div className="min-h-screen bg-[#fdfaf4] flex flex-col items-center justify-center gap-4 px-8 text-center">
        <Camera size={48} color="#b09878" />
        <p className="text-lg font-semibold text-[#2c2416]">Cần quyền camera</p>
        <p className="text-sm text-[#8c7a5e]">Để quét mã QR của điểm tham quan</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-7 py-3 bg-[#2c2416] rounded-xl text-[#f5f0e8] text-sm font-semibold"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-black overflow-hidden">

      {/* Camera feed — html5-qrcode mounts video vào đây */}
      <div id="qr-reader" className="absolute inset-0 [&>video]:w-full [&>video]:h-full [&>video]:object-cover [&>img]:hidden [&>div]:hidden" />

      {/* Dark overlay — 4 vùng tối xung quanh viewfinder */}
      <div className="absolute inset-0 pointer-events-none">
        {/* top */}
        <div className="absolute top-0 left-0 right-0 h-[25%] bg-black/55" />
        {/* bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-black/55" />
        {/* left */}
        <div className="absolute top-[25%] left-0 w-[12%] h-[50%] bg-black/55" />
        {/* right */}
        <div className="absolute top-[25%] right-0 w-[12%] h-[50%] bg-black/55" />

        {/* Corner brackets */}
        <span className="absolute top-[25%] left-[12%] w-6 h-6 border-t-[3px] border-l-[3px] border-[#c8a96e]" />
        <span className="absolute top-[25%] right-[12%] w-6 h-6 border-t-[3px] border-r-[3px] border-[#c8a96e]" />
        <span className="absolute bottom-[25%] left-[12%] w-6 h-6 border-b-[3px] border-l-[3px] border-[#c8a96e]" />
        <span className="absolute bottom-[25%] right-[12%] w-6 h-6 border-b-[3px] border-r-[3px] border-[#c8a96e]" />
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 px-6 pt-5 pb-4 bg-black/40">
        <p className="text-[10px] tracking-[4px] text-[#c8a96e] uppercase">VozTrip</p>
        <p className="text-[22px] text-[#f5f0e8] font-light mt-0.5">{tr("scan_title", lang)}</p>
      </div>

      {/* Hint pill */}
      <div className="absolute bottom-28 left-0 right-0 flex justify-center">
        {state === "scanned" ? (
          <div className="flex items-center gap-2 bg-[rgba(44,36,22,0.85)] border border-[rgba(200,169,110,0.4)] rounded-full px-5 py-2.5">
            <CheckCircle size={16} color="#c8a96e" />
            <span className="text-[13px] text-[#f5f0e8]">Đang mở điểm tham quan...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-[rgba(44,36,22,0.75)] border border-[rgba(200,169,110,0.3)] rounded-full px-5 py-2.5">
            <ScanLine size={16} color="#f5f0e8" />
            <span className="text-[13px] text-[#f5f0e8]">{tr("scan_hint", lang)}</span>
          </div>
        )}
      </div>

      {/* Requesting state spinner */}
      {state === "requesting" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#c8a96e] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
