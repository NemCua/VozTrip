"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, ReactNode, useEffect } from "react";
import { LanguageProvider } from "@/context/LanguageContext";
import AppShell from "@/components/layout/AppShell";
import { usePathname, useRouter } from "next/navigation";
import { checkDeviceStatus, joinDevice, pingDevice } from "@/services/api";

const PUBLIC_PATHS = ["/", "/language", "/payment", "/privacy"];

function GateGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // Gate check — chạy mỗi khi đổi route
  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) { setChecked(true); return; }

    const run = async () => {
      let deviceId = localStorage.getItem("voz_session");
      if (!deviceId) {
        deviceId = crypto.randomUUID();
        localStorage.setItem("voz_session", deviceId);
      }

      const cachedApproved = localStorage.getItem("device_approved") === "true";
      if (cachedApproved) { setChecked(true); return; }

      try { await joinDevice(deviceId); } catch {}
      const result = await checkDeviceStatus(deviceId);

      if (result === "approved") {
        localStorage.setItem("device_approved", "true");
        setChecked(true);
      } else if (result === "unreachable") {
        setChecked(true);
      } else {
        router.replace("/payment");
      }
    };

    run();
  }, [pathname, router]);

  // Heartbeat — chạy 1 lần sau khi checked, ping mỗi 60s
  useEffect(() => {
    if (!checked) return;
    const deviceId = localStorage.getItem("voz_session");
    if (!deviceId) return;
    const interval = setInterval(() => pingDevice(deviceId), 60_000);
    return () => clearInterval(interval);
  }, [checked]);

  if (!checked) return null;
  return <>{children}</>;
}

function ShellWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const noShell = PUBLIC_PATHS.includes(pathname);
  return noShell ? <>{children}</> : <AppShell>{children}</AppShell>;
}

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <GateGuard>
          <ShellWrapper>{children}</ShellWrapper>
        </GateGuard>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
