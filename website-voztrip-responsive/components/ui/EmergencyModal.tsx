"use client";
import { X, AlertTriangle, Shield, HeartPulse, Flame, Phone, Info, Headphones, MapPin } from "lucide-react";

const ICON_MAP: Record<string, React.ReactNode> = {
  "shield":       <Shield size={20} />,
  "medkit":       <HeartPulse size={20} />,
  "flame":        <Flame size={20} />,
  "call":         <Phone size={20} />,
  "information":  <Info size={20} />,
  "headset":      <Headphones size={20} />,
  "location":     <MapPin size={20} />,
};

const EMERGENCY_CONTACTS = [
  {
    group: "Khẩn cấp quốc gia",
    items: [
      { label: "Công an",          number: "113",          icon: "shield",      color: "#1d4ed8" },
      { label: "Cứu thương",       number: "115",          icon: "medkit",      color: "#dc2626" },
      { label: "Cứu hỏa",          number: "114",          icon: "flame",       color: "#ea580c" },
      { label: "Cấp cứu tổng hợp", number: "112",          icon: "call",        color: "#7c3aed" },
    ],
  },
  {
    group: "Hỗ trợ du lịch",
    items: [
      { label: "Đường dây du lịch", number: "1800599920",   icon: "information", color: "#0891b2" },
      { label: "Hỗ trợ VozTrip",    number: "1900123456",   icon: "headset",     color: "#c8a96e" },
    ],
  },
  {
    group: "Công an khu vực (Demo)",
    items: [
      { label: "CA Quận 1 – TP.HCM",    number: "02838296801", icon: "location", color: "#1d4ed8" },
      { label: "CA Hoàn Kiếm – Hà Nội", number: "02439362154", icon: "location", color: "#1d4ed8" },
      { label: "CA TP. Hội An",          number: "02353861011", icon: "location", color: "#1d4ed8" },
      { label: "CA TP. Đà Lạt",          number: "02633822254", icon: "location", color: "#1d4ed8" },
    ],
  },
];

type Props = { open: boolean; onClose: () => void };

export default function EmergencyModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-md bg-[#fdfaf4] rounded-t-3xl pt-2 pb-6 shadow-2xl">

        {/* Handle */}
        <div className="flex justify-center mb-1">
          <div className="w-10 h-1 rounded-full bg-[#d8cbb0]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8dfc8]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#dc2626] flex items-center justify-center">
              <AlertTriangle size={18} color="#fff" />
            </div>
            <div>
              <p className="text-base font-semibold text-[#2c2416]">Số khẩn cấp</p>
              <p className="text-[11px] text-[#b09878] mt-0.5">Emergency Contacts</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1">
            <X size={22} color="#8c7a5e" />
          </button>
        </div>

        {/* Contact list */}
        <div className="overflow-y-auto max-h-[60vh] px-5 pt-2">
          {EMERGENCY_CONTACTS.map((group) => (
            <div key={group.group} className="mt-4">
              <p className="text-[10px] tracking-[2px] uppercase text-[#b09060] mb-2">
                {group.group}
              </p>
              <div className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <a
                    key={item.number}
                    href={`tel:${item.number}`}
                    className="flex items-center gap-3 bg-white border border-[#e8dfc8] rounded-2xl px-3.5 py-3 active:scale-[0.98] transition-transform"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.color + "18", color: item.color }}
                    >
                      {ICON_MAP[item.icon] ?? <Phone size={20} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#2c2416] font-medium">{item.label}</p>
                      <p className="text-[17px] text-[#2c2416] font-bold tracking-wide">{item.number}</p>
                    </div>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: item.color }}
                    >
                      <Phone size={16} color="#fff" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Note */}
        <p className="text-center text-[11px] text-[#b09878] mt-4 px-5">
          Bấm vào số để gọi ngay · Tap to call immediately
        </p>
      </div>
    </div>
  );
}
