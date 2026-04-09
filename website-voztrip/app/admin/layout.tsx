"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/sellers", label: "Sellers" },
  { href: "/admin/pois", label: "All POIs" },
  { href: "/admin/zones", label: "Zones" },
  { href: "/admin/languages", label: "Languages" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f5f0e8" }}>
      {/* Sidebar */}
      <aside className="w-56 flex flex-col" style={{ backgroundColor: "#2c2416", minHeight: "100vh" }}>
        {/* Logo */}
        <div className="px-6 py-7 border-b" style={{ borderColor: "#3d3020" }}>
          <div className="text-xs tracking-[0.3em] uppercase mb-1" style={{ color: "#c8a96e" }}>Admin</div>
          <div className="text-xl font-light tracking-tight" style={{ color: "#f5f0e8", fontFamily: "Georgia, serif" }}>VozTrip</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 text-xs tracking-widest uppercase rounded-sm transition-all"
              style={{
                backgroundColor: pathname.startsWith(item.href) ? "#c8a96e" : "transparent",
                color: pathname.startsWith(item.href) ? "#2c2416" : "#b09878",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-5 border-t" style={{ borderColor: "#3d3020" }}>
          <div className="text-xs mb-1" style={{ color: "#8c7a5e" }}>Signed in as</div>
          <div className="text-xs mb-4" style={{ color: "#c8a96e" }}>{session?.username ?? "admin"}</div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full py-2 text-xs tracking-widest uppercase transition-all"
            style={{ border: "1px solid #3d3020", color: "#8c7a5e", borderRadius: "1px" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = "#c8a96e"; (e.target as HTMLElement).style.color = "#c8a96e"; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = "#3d3020"; (e.target as HTMLElement).style.color = "#8c7a5e"; }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
