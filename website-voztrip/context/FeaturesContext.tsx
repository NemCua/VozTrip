"use client";

import { createContext, useContext } from "react";
import { FeaturesConfig } from "../types/features";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bundledFeatures = require("../../config/features.json") as FeaturesConfig;

const FeaturesContext = createContext<FeaturesConfig>(bundledFeatures);

export function FeaturesProvider({
  features,
  children,
}: {
  features: FeaturesConfig;
  children: React.ReactNode;
}) {
  return (
    <FeaturesContext.Provider value={features}>
      {children}
    </FeaturesContext.Provider>
  );
}

export function useFeatures(): FeaturesConfig {
  return useContext(FeaturesContext);
}

export function useFeatureEnabled(
  selector: (f: FeaturesConfig) => boolean
): boolean {
  return selector(useContext(FeaturesContext));
}
