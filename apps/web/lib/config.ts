/**
 * Application configuration
 */

// Feature flags
export const FEATURES = {
  ENABLE_NOSTR_AUTH: true,
  ENABLE_PWA: true,
  ENABLE_NOTIFICATIONS: false,
};

// App metadata
export const APP_NAME = "Bitsacco";
export const APP_DESCRIPTION = "Save and grow with Bitcoin";
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

// Share configuration - matching webapp exactly
export const SHARE_VALUE_KES = Number(
  process.env.NEXT_PUBLIC_SHARE_VALUE_KES || "1000",
);

// Chama configuration for share purchases - critical IDs from webapp
export const INTERNAL_CHAMA_ID =
  process.env.NEXT_PUBLIC_INTERNAL_CHAMA_ID ||
  "cc212028-00be-4ea1-b32f-d3993bbf98e7";

export const INTERNAL_USER_ID =
  process.env.NEXT_PUBLIC_INTERNAL_USER_ID ||
  "b6287a8d-ff0b-4b98-8a7e-3aab8aef3995";

// API configuration
export const BS_API_URL = process.env.NEXT_PUBLIC_BS_API_URL || "";

// Environment variables matching webapp
export const BS_ENV = process.env.NEXT_PUBLIC_BS_ENV || "development";

// Feature flags configuration
export const FEATURES_JSON_URL = "/features.json";

// Deposit/Withdrawal limits configuration
export const PERSONAL_DEPOSIT_LIMITS = {
  MIN_AMOUNT_KES: Number(process.env.NEXT_PUBLIC_MIN_DEPOSIT_KES || "1"),
  MAX_AMOUNT_KES: Number(process.env.NEXT_PUBLIC_MAX_DEPOSIT_KES || "100_000"),
};

export const PERSONAL_WITHDRAW_LIMITS = {
  MIN_AMOUNT_KES: Number(process.env.NEXT_PUBLIC_MIN_WITHDRAW_KES || "100"),
  MAX_AMOUNT_KES: Number(process.env.NEXT_PUBLIC_MAX_WITHDRAW_KES || "100_000"),
};

// Lightning specific limits (higher max for Lightning)
export const LIGHTNING_DEPOSIT_LIMITS = {
  MIN_AMOUNT_KES: Number(
    process.env.NEXT_PUBLIC_MIN_LIGHTNING_DEPOSIT_KES || "1",
  ),
  MAX_AMOUNT_KES: Number(
    process.env.NEXT_PUBLIC_MAX_LIGHTNING_DEPOSIT_KES || "100_000_000",
  ),
};

// Timeouts and intervals
export const DEBOUNCE_DELAY_MS = 200;
export const TOAST_TIMEOUT_MS = 2000;
export const POLL_INTERVAL_MS = 5000;
export const POLL_TIMEOUT_MS = 45000;
