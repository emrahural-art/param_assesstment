import { envFeatures, type FeatureName, type FeatureFlagRecord } from "./features-env";

export { envFeatures, features, type FeatureName, type FeatureFlagRecord } from "./features-env";

/**
 * Load feature flags from DB, merged with env flags.
 * Server / Node only — not for Edge middleware.
 */
export async function getFeatureFlags(): Promise<FeatureFlagRecord> {
  try {
    const { db } = await import("@/lib/prisma");
    const delegate = db.featureFlag;
    if (!delegate?.findMany) {
      return { ...envFeatures };
    }
    const dbFlags = await delegate.findMany();
    const merged: FeatureFlagRecord = {};
    for (const flag of dbFlags) {
      const envKey = flag.key as FeatureName;
      const envEnabled = envKey in envFeatures ? envFeatures[envKey] : true;
      merged[flag.key] = envEnabled && flag.enabled;
    }
    for (const [key, enabled] of Object.entries(envFeatures)) {
      if (!(key in merged)) {
        merged[key] = enabled;
      }
    }
    return merged;
  } catch {
    return { ...envFeatures };
  }
}

/** Admin UI: raw FeatureFlag rows. Server / Node only. */
export async function getFeatureFlagRows() {
  const { db } = await import("@/lib/prisma");
  const delegate = db.featureFlag;
  if (!delegate?.findMany) {
    return [];
  }
  return delegate.findMany({ orderBy: { key: "asc" } });
}
