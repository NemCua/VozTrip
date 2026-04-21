"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5183";

type GuestFeatures = {
  gpsVisitLog: { qrScan: { enabled: boolean } };
};

type FeaturesShape = {
  features: { guest: GuestFeatures };
};

const DEFAULT: FeaturesShape = {
  features: { guest: { gpsVisitLog: { qrScan: { enabled: true } } } },
};

const FeaturesContext = createContext<FeaturesShape>(DEFAULT);

export function FeaturesProvider({ children }: { children: ReactNode }) {
  const [features, setFeatures] = useState<FeaturesShape>(DEFAULT);

  useEffect(() => {
    fetch(`${API_URL}/api/features`)
      .then((r) => r.json())
      .then((data) => setFeatures(data))
      .catch(() => {});
  }, []);

  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  return useContext(FeaturesContext);
}
