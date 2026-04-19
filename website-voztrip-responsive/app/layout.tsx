import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "VozTrip — Tourism Guide",
  description: "Hướng dẫn du lịch thông minh",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="bg-[#f5ede0] antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
