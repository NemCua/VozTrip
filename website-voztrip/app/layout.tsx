import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { getFeatures } from "../lib/features";
import MaintenancePage from "./maintenance/page";

function StaticMaintenancePage({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: "#fdfaf4" }}>
      <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "#c8a96e" }}>Đang bảo trì</p>
      <h1 className="text-3xl font-light text-center mb-4" style={{ color: "#2c2416", fontFamily: "Georgia, serif" }}>
        VozTrip tạm thời<br />không khả dụng
      </h1>
      <p className="text-sm text-center max-w-sm leading-relaxed" style={{ color: "#8c7a5e" }}>
        {message ?? "Chúng tôi đang nâng cấp hệ thống. Vui lòng quay lại sau."}
      </p>
    </div>
  );
}

export const metadata: Metadata = {
  title: "VozTrip",
  description: "Tourism Guide Management",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const features = await getFeatures();

  // ── Maintenance gate ─────────────────────────────────────────────────────
  // Chặn toàn bộ website, render thẳng trang bảo trì (không cần redirect)
  if (features.app.maintenance.enabled) {
    return (
      <html lang="vi" className="h-full">
        <body className="min-h-full">
          <StaticMaintenancePage message={features.app.maintenance.message} />
        </body>
      </html>
    );
  }

  return (
    <html lang="vi" className="h-full">
      <body className="min-h-full">
        <Providers features={features}>{children}</Providers>
      </body>
    </html>
  );
}
