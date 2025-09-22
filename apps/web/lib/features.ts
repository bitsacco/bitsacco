/**
 * Feature flags system for controlling feature releases
 */

// Feature flag keys - define all feature flags here
export enum FEATURE_FLAGS {
  // Core membership features
  ENABLE_MEMBERSHIP = "enable-membership",
  ENABLE_MEMBERSHIP_SHARE_SUBSCRIPTION = "enable-membership-share-subscription",
  ENABLE_MEMBERSHIP_SHARE_TRANSFER = "enable-membership-share-transfer",

  // Share marketplace
  ENABLE_SHARE_MARKETPLACE = "enable-share-marketplace",
  ENABLE_SHARE_PURCHASE_MODAL = "enable-share-purchase-modal",

  // Core transaction infrastructure - global features
  ENABLE_TRANSACTION_HISTORY = "enable-transaction-history",

  // Personal savings - main feature
  ENABLE_PERSONAL_SAVINGS = "enable-personal-savings",

  // Personal savings - wallet management
  ENABLE_MULTIPLE_WALLETS = "enable-multiple-wallets",
  ENABLE_TARGET_WALLETS = "enable-target-wallets",
  ENABLE_LOCKED_WALLETS = "enable-locked-wallets",
  ENABLE_WALLET_DETAILS = "enable-wallet-details",
  ENABLE_WALLET_ARCHIVAL = "enable-wallet-archival",

  // Personal savings - transaction flows
  ENABLE_SPECIFIC_WALLET_DEPOSITS = "enable-specific-wallet-deposits",
  ENABLE_AUTOMATIC_SPLIT_DEPOSITS = "enable-automatic-split-deposits",
  ENABLE_SMART_WITHDRAWAL_SELECTION = "enable-smart-withdrawal-selection",
  ENABLE_EARLY_WITHDRAWAL = "enable-early-withdrawal",
  ENABLE_PENALTY_WARNINGS = "enable-penalty-warnings",

  // Global payment infrastructure - cross-product features
  ENABLE_AUTO_DEPOSITS = "enable-auto-deposits",
  ENABLE_MPESA_DEPOSITS = "enable-mpesa-deposits",
  ENABLE_MPESA_WITHDRAWALS = "enable-mpesa-withdrawals",
  ENABLE_LIGHTNING_DEPOSITS = "enable-lightning-deposits",
  ENABLE_LIGHTNING_WITHDRAWALS = "enable-lightning-withdrawals",
  ENABLE_MPESA_STATUS_POLLING = "enable-mpesa-status-polling",
  ENABLE_LIGHTNING_QR_CODES = "enable-lightning-qr-codes",

  // Global UI/UX enhancements - cross-product features
  ENABLE_ADVANCED_TRANSACTION_FILTERS = "enable-advanced-transaction-filters",
  ENABLE_REALTIME_BALANCE_UPDATES = "enable-realtime-balance-updates",
  ENABLE_MOBILE_TRANSACTION_UI = "enable-mobile-transaction-ui",
  ENABLE_ENHANCED_LOADING_STATES = "enable-enhanced-loading-states",
  ENABLE_CURRENCY_PREFERENCES = "enable-currency-preferences",
  ENABLE_BITCOIN_UNIT_OPTIONS = "enable-bitcoin-unit-options",

  // Global analytics & monitoring - cross-product features
  ENABLE_SAVINGS_ANALYTICS = "enable-savings-analytics",
  ENABLE_TRANSACTION_METRICS = "enable-transaction-metrics",
  ENABLE_COST_BASIS_TRACKING = "enable-cost-basis-tracking",
  ENABLE_WALLET_USAGE_ANALYTICS = "enable-wallet-usage-analytics",

  // Global security & compliance - cross-product features
  ENABLE_ENHANCED_VERIFICATION = "enable-enhanced-verification",
  ENABLE_WITHDRAWAL_LIMITS = "enable-withdrawal-limits",

  // Personal savings - advanced functionality
  ENABLE_TARGET_AUTO_ACTIONS = "enable-target-auto-actions",
  ENABLE_MATURITY_NOTIFICATIONS = "enable-maturity-notifications",

  // Future features
  ENABLE_CHAMA_SAVINGS = "enable-chama-savings",
}

// Feature flag interface
export interface IFeatureFlag {
  id: string;
  description: string;
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
    id: FEATURE_FLAGS.ENABLE_MEMBERSHIP,
    description:
      "Enable membership functionality including share management and community features",
    variationType: "boolean",
    variation: true,
  },
  {
    id: FEATURE_FLAGS.ENABLE_MEMBERSHIP_SHARE_SUBSCRIPTION,
    description: "Allow users to subscribe to and purchase membership shares",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_MEMBERSHIP_SHARE_TRANSFER,
    description: "Enable transfer of membership shares between users",
    variationType: "boolean",
    variation: false,
  },

  // Share marketplace - enabled by default
  {
    id: FEATURE_FLAGS.ENABLE_SHARE_MARKETPLACE,
    description: "Show marketplace for buying and selling membership shares",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_SHARE_PURCHASE_MODAL,
    description: "Display modal for purchasing shares from marketplace offers",
    variationType: "boolean",
    variation: true,
  },

  // Core transaction infrastructure - enabled by default
  {
    id: FEATURE_FLAGS.ENABLE_TRANSACTION_HISTORY,
    description: "Show transaction history across all product experiences",
    variationType: "boolean",
    variation: true,
  },

  // Personal savings - main feature (disabled by default)
  {
    id: FEATURE_FLAGS.ENABLE_PERSONAL_SAVINGS,
    description: "Enable personal savings feature with wallet management",
    variationType: "boolean",
    variation: true,
  },

  // Personal savings - wallet management (disabled by default)
  {
    id: FEATURE_FLAGS.ENABLE_TARGET_WALLETS,
    description: "Allow creation of target savings wallets with specific goals",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_LOCKED_WALLETS,
    description: "Enable locked savings wallets with time-based restrictions",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_MULTIPLE_WALLETS,
    description: "Allow users to create and manage multiple savings wallets",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_WALLET_DETAILS,
    description: "Show detailed wallet information and analytics",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_WALLET_ARCHIVAL,
    description: "Allow users to archive empty savings wallets",
    variationType: "boolean",
    variation: false,
  },

  // Personal savings - transaction flows (disabled by default)
  {
    id: FEATURE_FLAGS.ENABLE_SPECIFIC_WALLET_DEPOSITS,
    description: "Allow users to deposit directly to specific wallets",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_AUTOMATIC_SPLIT_DEPOSITS,
    description:
      "Automatically split deposits across multiple wallets based on user preferences",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_SMART_WITHDRAWAL_SELECTION,
    description:
      "Intelligent wallet selection for withdrawals based on goals and lock status",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_EARLY_WITHDRAWAL,
    description: "Allow early withdrawal from locked wallets with penalties",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_PENALTY_WARNINGS,
    description:
      "Show penalty warnings for early withdrawals from locked wallets",
    variationType: "boolean",
    variation: false,
  },

  // Global payment infrastructure (disabled by default)
  {
    id: FEATURE_FLAGS.ENABLE_AUTO_DEPOSITS,
    description: "Enable automated recurring deposits across all products",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_MPESA_DEPOSITS,
    description: "Enable M-Pesa mobile money deposits",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_MPESA_WITHDRAWALS,
    description: "Enable M-Pesa mobile money withdrawals",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_LIGHTNING_DEPOSITS,
    description: "Enable Bitcoin Lightning Network deposits",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_LIGHTNING_WITHDRAWALS,
    description: "Enable Bitcoin Lightning Network withdrawals",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_MPESA_STATUS_POLLING,
    description: "Real-time status polling for M-Pesa transactions",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_LIGHTNING_QR_CODES,
    description: "Generate and scan Lightning Network QR codes for payments",
    variationType: "boolean",
    variation: false,
  },

  // Global UI/UX enhancements (disabled by default)
  {
    id: FEATURE_FLAGS.ENABLE_ADVANCED_TRANSACTION_FILTERS,
    description: "Advanced filtering options for transaction history",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_ENHANCED_LOADING_STATES,
    description: "Enhanced loading animations and skeleton states",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_CURRENCY_PREFERENCES,
    description: "User preferences for currency display (KES, USD, etc.)",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_BITCOIN_UNIT_OPTIONS,
    description: "Bitcoin unit display options (BTC, sats, mBTC)",
    variationType: "boolean",
    variation: false,
  },

  // Global analytics & monitoring (disabled by default)
  {
    id: FEATURE_FLAGS.ENABLE_SAVINGS_ANALYTICS,
    description: "Analytics and insights for savings performance",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_TRANSACTION_METRICS,
    description: "Detailed metrics and analytics for transaction patterns",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_COST_BASIS_TRACKING,
    description: "Track cost basis for tax reporting and investment analysis",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_WALLET_USAGE_ANALYTICS,
    description: "Analytics on wallet usage patterns and performance",
    variationType: "boolean",
    variation: false,
  },

  // Personal savings - advanced functionality (disabled by default)
  {
    id: FEATURE_FLAGS.ENABLE_TARGET_AUTO_ACTIONS,
    description: "Automated actions when savings targets are reached",
    variationType: "boolean",
    variation: false,
  },
  {
    id: FEATURE_FLAGS.ENABLE_MATURITY_NOTIFICATIONS,
    description: "Notifications when locked wallets reach maturity",
    variationType: "boolean",
    variation: false,
  },

  // Future features - disabled by default
  {
    id: FEATURE_FLAGS.ENABLE_CHAMA_SAVINGS,
    description: "Enable group savings functionality (Chama)",
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

        // Find description from fallback flags
        const fallbackFlag = FALLBACK_FLAGS.find((f) => f.id === feature.id);
        const description =
          feature.description ||
          fallbackFlag?.description ||
          `Feature: ${feature.id}`;

        flags.push({
          id: feature.id,
          description: description,
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
