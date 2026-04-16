"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { FeaturesProvider } from "../context/FeaturesContext";
import { FeaturesConfig } from "../types/features";

export function Providers({
  features,
  children,
}: {
  features: FeaturesConfig;
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <FeaturesProvider features={features}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>{children}</SessionProvider>
      </QueryClientProvider>
    </FeaturesProvider>
  );
}
