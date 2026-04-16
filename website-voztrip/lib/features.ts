import { FeaturesConfig } from "../types/features";

// Fallback khi backend không reach được
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bundledFeatures = require("../../config/features.json") as FeaturesConfig;

/**
 * Server-side fetch — dùng trong Server Components và layout.tsx.
 * Next.js cache revalidate mỗi 30s, không gọi backend mỗi request.
 */
export async function getFeatures(): Promise<FeaturesConfig> {
  try {
    const apiUrl =
      process.env.API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:5000";

    const res = await fetch(`${apiUrl}/api/features`, {
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error(`/api/features returned ${res.status}`);
    return res.json() as Promise<FeaturesConfig>;
  } catch {
    return bundledFeatures;
  }
}
