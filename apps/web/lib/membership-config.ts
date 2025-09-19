// Configuration matching the working webapp implementation
// Reference: /home/okj/bitsacco/webapp/src/configs.ts

export const BS_ENV = process.env.NEXT_PUBLIC_BS_ENV || "development";

export const BS_DOMAIN =
  process.env.NEXT_PUBLIC_BS_APP_DOMAIN || "bitsacco.com";

export const BS_API_URL = process.env.NEXT_PUBLIC_BS_API_URL || "";

export const BS_SHARE_VALUE_KES = Number(
  process.env.NEXT_PUBLIC_BS_SHARE_VALUE_KES || "1000",
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
export const DEFAULT_LIGHTNING_ADDRESS_DESCRIPTION = "save with bitsacco.com";

// Membership-specific configuration
export const MEMBERSHIP_CONFIG = {
  INTERNAL_CHAMA_ID: BS_INTERNAL_CHAMA_ID,
  INTERNAL_USER_ID: BS_INTERNAL_USER_ID,
  SHARE_VALUE_KES: BS_SHARE_VALUE_KES,
  POLL_INTERVAL_MS,
  POLL_TIMEOUT_MS,
} as const;
