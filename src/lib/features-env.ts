/**
 * Env-only feature flags (Edge-safe).
 * Middleware MUST import from this file — never from features.ts — so Prisma
 * is not part of the Edge bundle graph (avoids broken db delegates on Node).
 */
function readFeatureFlag(key: string, defaultEnabled = false): boolean {
  const v = process.env[key];
  if (v === undefined || v === "") return defaultEnabled;
  return v === "true" || v === "1";
}

export const envFeatures = {
  candidateJobs: readFeatureFlag("NEXT_PUBLIC_FEATURE_CANDIDATE_JOBS", true),
  candidateApply: readFeatureFlag("NEXT_PUBLIC_FEATURE_CANDIDATE_APPLY", true),
  communication: readFeatureFlag("NEXT_PUBLIC_FEATURE_COMMUNICATION", true),
  pipeline: readFeatureFlag("NEXT_PUBLIC_FEATURE_PIPELINE", true),
  listings: readFeatureFlag("NEXT_PUBLIC_FEATURE_LISTINGS", true),
} as const;

/** Deployment-level kill switch (middleware, API guards, static pages) */
export const features = envFeatures;

export type FeatureName = keyof typeof envFeatures;

export type FeatureFlagRecord = Record<string, boolean>;
