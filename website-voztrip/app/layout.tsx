import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { getFeatures } from "../lib/features";
import MaintenancePage from "./maintenance/page";

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
          <MaintenancePage message={features.app.maintenance.message} />
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
