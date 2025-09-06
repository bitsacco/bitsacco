/**
 * Feature flags system for controlling feature releases
 */

// Feature flag keys - define all feature flags here
export enum FEATURE_FLAGS {
  // Core membership features
  MEMBERSHIP = "membership",
  MEMBERSHIP_SHARE_SUBSCRIPTION = "membership-share-subscription",
  MEMBERSHIP_SHARE_TRANSFER = "membership-share-transfer",

  // Share marketplace
  SHARE_MARKETPLACE = "share-marketplace",
  SHARE_PURCHASE_MODAL = "share-purchase-modal",

  // History and tracking
  TRANSACTION_HISTORY = "transaction-history",

  // Future features
  PERSONAL_SAVINGS = "personal-savings",
  CHAMA_SAVINGS = "chama-savings",
}

// Feature flag interface
export interface IFeatureFlag {
  id: string;
  variationType: "boolean" | "string" | "number";
  variation: boolean | string | number;
}

// Feature flags response structure
interface FeatureFlagsResponse {
  features: IFeatureFlag[];
}

// Fallback default values for feature flags when offline or when features.json cannot be loaded
export const FALLBACK_FLAGS: IFeatureFlag[] = [
  // Core membership features - enabled by default
  {
    id: FEATURE_FLAGS.MEMBERSHIP,
    variationType: "boolean",
    variation: true,
  },
  {
    id: FEATURE_FLAGS.MEMBERSHIP_SHARE_SUBSCRIPTION,
    variationType: "boolean",
    variation: true,
  },
  {
    id: FEATURE_FLAGS.MEMBERSHIP_SHARE_TRANSFER,
    variationType: "boolean",
    variation: true,
  },

  // Share marketplace - enabled by default
  {
    id: FEATURE_FLAGS.SHARE_MARKETPLACE,
    variationType: "boolean",
    variation: true,
  },
  {
    id: FEATURE_FLAGS.SHARE_PURCHASE_MODAL,
    variationType: "boolean",
    variation: true,
  },

  // History - enabled by default
  {
    id: FEATURE_FLAGS.TRANSACTION_HISTORY,
    variationType: "boolean",
    variation: true,
  },

  // Future features - disabled by default
  {
    id: FEATURE_FLAGS.PERSONAL_SAVINGS,
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.CHAMA_SAVINGS,
    variationType: "boolean",
    variation: false,
  },
];

// Helper function to find flag variation
export const findFlagVariation = (
  flags: IFeatureFlag[],
  flagId: FEATURE_FLAGS,
): boolean => {
  const flag = flags.find((flag) => flag.id === flagId);
  return flag?.variation === true;
};

// Load feature flags from JSON file
export const loadFeatureFlagsFromJson = async (
  url: string = "/features.json",
): Promise<IFeatureFlag[]> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn("Failed to load features.json, using fallback flags");
      return FALLBACK_FLAGS;
    }

    const data: FeatureFlagsResponse = await response.json();
    if (!data || !data.features || !Array.isArray(data.features)) {
      console.warn("Invalid features.json format, using fallback flags");
      return FALLBACK_FLAGS;
    }

    // Validate and transform feature flags
    const flags: IFeatureFlag[] = [];
    try {
      for (const feature of data.features) {
        if (!["boolean", "string", "number"].includes(feature.variationType)) {
          throw new Error(
            `Unsupported variation type: ${feature.variationType}`,
          );
        }

        flags.push({
          id: feature.id,
          variationType: feature.variationType,
          variation: feature.variation,
        });
      }

      console.log(`Loaded ${flags.length} feature flags from JSON`);
      return flags;
    } catch (error) {
      console.warn("Failed to parse feature flags:", error);
      return FALLBACK_FLAGS;
    }
  } catch (error) {
    console.error("Error loading feature flags:", error);
    return FALLBACK_FLAGS;
  }
};

// Default flags - this will be populated from features.json at runtime
export let DEFAULT_FLAGS: IFeatureFlag[] = [...FALLBACK_FLAGS];

// Initialize default flags (called by FeatureFlagsProvider)
export const initializeFeatureFlags = async (
  url?: string,
): Promise<IFeatureFlag[]> => {
  DEFAULT_FLAGS = await loadFeatureFlagsFromJson(url);
  return DEFAULT_FLAGS;
};
