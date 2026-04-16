import React, { createContext, useContext, useEffect, useState } from "react";
import { FeaturesConfig } from "../types/features";
import { API_URL } from "../constants";

// Bundle sẵn làm fallback khi offline hoặc fetch thất bại
const bundledFeatures = require("../../../config/features.json") as FeaturesConfig;

const FeaturesContext = createContext<FeaturesConfig>(bundledFeatures);

export function FeaturesProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState<FeaturesConfig>(bundledFeatures);

  useEffect(() => {
    fetch(`${API_URL}/api/features`)
      .then((r) => {
        if (!r.ok) throw new Error("non-2xx");
        return r.json() as Promise<FeaturesConfig>;
      })
      .then(setFeatures)
      .catch(() => {
        // Giữ nguyên bundled fallback, không crash
      });
  }, []);

  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures(): FeaturesConfig {
  return useContext(FeaturesContext);
}

/** Shortcut: trả về boolean từ selector, ví dụ:
 *  const canSeeQna = useFeatureEnabled(f => f.features.guest.qna.enabled);
 */
export function useFeatureEnabled(selector: (f: FeaturesConfig) => boolean): boolean {
  return selector(useContext(FeaturesContext));
}
