"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5183";
const CACHE_KEY = "voz_features_cache";

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

function loadCached(): FeaturesShape {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw) as FeaturesShape;
  } catch {}
  return DEFAULT;
}

const FeaturesContext = createContext<FeaturesShape>(DEFAULT);

export function FeaturesProvider({ children }: { children: ReactNode }) {
  // Start with localStorage cache so there's no flicker on reload
  const [features, setFeatures] = useState<FeaturesShape>(loadCached);

  const fetchFeatures = useCallback(() => {
    fetch(`${API_URL}/api/features`)
      .then(r => r.json())
      .then(data => {
        setFeatures(data);
        try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
      })
      .catch(() => {
        // keep last cached value on error — don't reset to DEFAULT
      });
  }, []);

  useEffect(() => {
    fetchFeatures();

    // Refetch when user switches back to the tab — catches admin flag changes
    window.addEventListener("focus", fetchFeatures);
    return () => window.removeEventListener("focus", fetchFeatures);
  }, [fetchFeatures]);

  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures() {
  return useContext(FeaturesContext);
}
