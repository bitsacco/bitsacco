export const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || "";

/**
 * Get the Lightning address domain based on the current environment
 * - production (NODE_ENV): bitsacco.com
 * - staging (NEXT_PUBLIC_APP_ENV): staging.bitsacco.com
 * - development: dev.bitsacco.com
 */
export function getLightningAddressDomain(): string {
  // Use NEXT_PUBLIC_APP_ENV for staging detection, fall back to NODE_ENV
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const nodeEnv = process.env.NODE_ENV;

  // Check app env first (can be "staging")
  if (appEnv === "staging") {
    return "staging.bitsacco.com";
  }

  // Then check NODE_ENV
  if (nodeEnv === "production") {
    return "bitsacco.com";
  }

  // Default to development domain
  return "dev.bitsacco.com";
}

export const BS_API_URL = process.env.NEXT_PUBLIC_BS_API_URL || "";

export const BS_SHARE_VALUE_KES = Number(
  process.env.NEXT_PUBLIC_BS_SHARE_VALUE_KES || "",
);

// Critical IDs from webapp - these enable chama deposit integration
export const BS_INTERNAL_CHAMA_ID =
  process.env.NEXT_PUBLIC_BS_INTERNAL_CHAMA_ID ||
  "cc212028-00be-4ea1-b32f-d3993bbf98e7";

export const BS_INTERNAL_USER_ID =
  process.env.NEXT_PUBLIC_BS_INTERNAL_USER_ID ||
  "b6287a8d-ff0b-4b98-8a7e-3aab8aef3995";

export const INVITE_CODE = process.env.NEXT_PUBLIC_BS_INVITE_CODE || "";

// Timing constants from webapp
export const DEBOUNCE_DELAY_MS = 200; // 200ms
export const TOAST_TIMEOUT_MS = 2000; // 2 seconds
export const POLL_INTERVAL_MS = 5000; // 5 seconds
export const POLL_TIMEOUT_MS = 45000; // 45 seconds

export enum PhoneRegionCode {
  Kenya = "KE",
  Uganda = "UG",
  Nigeria = "NG",
  Tanzania = "TZ",
  SouthAfrica = "ZA",
  UnitedStates = "US",
  Canada = "CA",
  Mexico = "MX",
  Jamaica = "JM",
}

// Lightning Address constants
export const DEFAULT_LIGHTNING_ADDRESS_DESCRIPTION = `save with ${getLightningAddressDomain()}`;

// Membership-specific configuration
export const MEMBERSHIP_CONFIG = {
  INTERNAL_CHAMA_ID: BS_INTERNAL_CHAMA_ID,
  INTERNAL_USER_ID: BS_INTERNAL_USER_ID,
  SHARE_VALUE_KES: BS_SHARE_VALUE_KES,
  POLL_INTERVAL_MS,
  POLL_TIMEOUT_MS,
} as const;
