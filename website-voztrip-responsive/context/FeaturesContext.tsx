"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5183";

type E = { enabled: boolean };

type FeaturesShape = {
  app: { maintenance: { enabled: boolean; message: string } };
  features: {
    guest: {
      languagePicker: E;
      explorePois:    E;
      nearbyPois:     E;
      map:            E;
      poiDetail:      { enabled: boolean; media: E; audio: E };
      qna:            E;
      gpsVisitLog:    { enabled: boolean; qrScan: E };
      usageLog:       E;
    };
  };
  pages: {
    emergency: { enabled: boolean; message: string };
    feedback:  E;
  };
};

const DEFAULT: FeaturesShape = {
  app:      { maintenance: { enabled: false, message: "" } },
  features: {
    guest: {
      languagePicker: { enabled: true },
      explorePois:    { enabled: true },
      nearbyPois:     { enabled: true },
      map:            { enabled: true },
      poiDetail:      { enabled: true, media: { enabled: true }, audio: { enabled: true } },
      qna:            { enabled: true },
      gpsVisitLog:    { enabled: true, qrScan: { enabled: true } },
      usageLog:       { enabled: true },
    },
  },
  pages: {
    emergency: { enabled: true,  message: "" },
    feedback:  { enabled: true },
  },
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
