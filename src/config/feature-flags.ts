const featureFlags = {
  ads: false,
  storeBadges: false
} as const;

interface FeatureFlagRuntimeOptions {
  isDev: boolean;
  isNative: boolean;
}

const defaultRuntimeOptions: FeatureFlagRuntimeOptions = {
  isDev: import.meta.env.DEV,
  isNative: import.meta.env.VITE_IS_NATIVE === 'true'
};

export function getFeatureFlags(runtimeOptions: FeatureFlagRuntimeOptions = defaultRuntimeOptions) {
  return {
    ads: featureFlags.ads && !runtimeOptions.isDev && !runtimeOptions.isNative,
    storeBadges: featureFlags.storeBadges && !runtimeOptions.isNative
  } as const;
}
