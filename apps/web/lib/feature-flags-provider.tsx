"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  FEATURE_FLAGS,
  IFeatureFlag,
  findFlagVariation,
  FALLBACK_FLAGS,
  initializeFeatureFlags,
} from "./features";
import { FEATURES_JSON_URL } from "./config";

// Feature flags context interface
interface FeatureFlagsContextValue {
  isEnabled: (flagId: FEATURE_FLAGS, defaultValue?: boolean) => boolean;
  flags: IFeatureFlag[];
  isLoading: boolean;
}

// Default context value
const defaultFeatureFlagsContext: FeatureFlagsContextValue = {
  isEnabled: (flagId: FEATURE_FLAGS, defaultValue = false) => {
    return findFlagVariation(FALLBACK_FLAGS, flagId) || defaultValue;
  },
  flags: FALLBACK_FLAGS,
  isLoading: true,
};

// Create context
const FeatureFlagsContext = createContext<FeatureFlagsContextValue>(
  defaultFeatureFlagsContext,
);

// Provider props
interface FeatureFlagsProviderProps {
  children: ReactNode;
}

// Provider component
export function FeatureFlagsProvider({ children }: FeatureFlagsProviderProps) {
  const [flags, setFlags] = useState<IFeatureFlag[]>(FALLBACK_FLAGS);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize feature flags on mount
  useEffect(() => {
    const loadFlags = async () => {
      try {
        const loadedFlags = await initializeFeatureFlags(FEATURES_JSON_URL);
        setFlags(loadedFlags);
      } catch (error) {
        console.error("Failed to initialize feature flags:", error);
        setFlags(FALLBACK_FLAGS);
      } finally {
        setIsLoading(false);
      }
    };

    loadFlags();
  }, []);

  // Check if a feature flag is enabled
  const isEnabled = (flagId: FEATURE_FLAGS, defaultValue = false): boolean => {
    return findFlagVariation(flags, flagId) || defaultValue;
  };

  const contextValue: FeatureFlagsContextValue = {
    isEnabled,
    flags,
    isLoading,
  };

  return (
    <FeatureFlagsContext.Provider value={contextValue}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

// Hook to use feature flags
export const useFeatureFlags = (): FeatureFlagsContextValue => {
  const context = useContext(FeatureFlagsContext);

  if (!context) {
    throw new Error(
      "useFeatureFlags must be used within a FeatureFlagsProvider",
    );
  }

  return context;
};

// Convenience hook to check a single feature flag
export const useFeatureFlag = (
  flagId: FEATURE_FLAGS,
  defaultValue = false,
): boolean => {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(flagId, defaultValue);
};
