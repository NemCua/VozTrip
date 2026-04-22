import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import MaintenancePage from "./maintenance/page";

export const metadata: Metadata = {
  title: "VozTrip — Tourism Guide",
  description: "Hướng dẫn du lịch thông minh",
};

async function getMaintenanceState(): Promise<{ enabled: boolean; message?: string }> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5183";
    const res = await fetch(`${apiUrl}/api/features`, { cache: "no-store" });
    if (!res.ok) return { enabled: false };
    const data = await res.json();
    return {
      enabled: data?.app?.maintenance?.enabled === true,
      message: data?.app?.maintenance?.message,
    };
  } catch {
    return { enabled: false };
  }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const maintenance = await getMaintenanceState();

  if (maintenance.enabled) {
    return (
      <html lang="vi">
        <body className="bg-[#f5ede0] antialiased">
          <MaintenancePage message={maintenance.message} />
        </body>
      </html>
    );
  }

  return (
    <html lang="vi">
      <body className="bg-[#f5ede0] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
