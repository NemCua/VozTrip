"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/seller/dashboard", label: "Dashboard" },
  { href: "/seller/pois", label: "Điểm tham quan" },
  { href: "/seller/upgrade", label: "Nâng cấp VIP" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f5f0e8" }}>
      {/* Sidebar */}
      <aside className="w-56 flex flex-col" style={{ backgroundColor: "#2c2416", minHeight: "100vh" }}>
        {/* Logo */}
        <div className="px-6 py-7 border-b" style={{ borderColor: "#3d3020" }}>
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#c8a96e" }}>Seller</div>
          <div className="text-xl font-light tracking-tight" style={{ color: "#f5f0e8", fontFamily: "Georgia, serif" }}>VozTrip</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const active = pathname.startsWith(item.href);
            const isVip = item.href === "/seller/upgrade";
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center px-3 py-2 text-xs tracking-widest uppercase rounded-sm transition-all"
                style={{
                  backgroundColor: active ? "#c8a96e" : isVip ? "rgba(200,169,110,0.12)" : "transparent",
                  color: active ? "#2c2416" : isVip ? "#c8a96e" : "#b09878",
                  border: isVip && !active ? "1px solid rgba(200,169,110,0.3)" : "1px solid transparent",
                }}
              >
                {isVip && <span className="mr-1.5">✦</span>}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-5 border-t" style={{ borderColor: "#3d3020" }}>
          <div className="text-xs mb-1" style={{ color: "#8c7a5e" }}>Đăng nhập với</div>
          <div className="text-xs mb-1" style={{ color: "#c8a96e" }}>{session?.username ?? "seller"}</div>
          {session?.shopName && (
            <div className="text-xs mb-4" style={{ color: "#8c7a5e" }}>{session.shopName}</div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full py-2 text-xs tracking-widest uppercase transition-all"
            style={{ border: "1px solid #3d3020", color: "#8c7a5e", borderRadius: "1px" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "#c8a96e"; (e.target as HTMLElement).style.color = "#c8a96e"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "#3d3020"; (e.target as HTMLElement).style.color = "#8c7a5e"; }}
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
