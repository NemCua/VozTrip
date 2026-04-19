"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, MapPin, Map, QrCode, Settings } from "lucide-react";
import { tr } from "@/lib/translations";
import { useLanguage } from "@/context/LanguageContext";

const NAV_ITEMS = [
  { href: "/home",    icon: Compass,  key: "tab_explore" },
  { href: "/nearby",  icon: MapPin,   key: "tab_nearby"  },
  { href: "/map",     icon: Map,      key: "tab_map"     },
  { href: "/scan",    icon: QrCode,   key: "tab_scan"    },
  { href: "/profile", icon: Settings, key: "tab_settings" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#fdfaf4] border-t border-[#e8dcc8] max-w-md mx-auto">
      <div className="flex">
        {NAV_ITEMS.map(({ href, icon: Icon, key }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
                active ? "text-[#3d2c1e]" : "text-[#b09878]"
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span>{tr(key, lang)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
