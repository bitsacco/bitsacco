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

// Timeouts and intervals
export const DEBOUNCE_DELAY_MS = 200;
export const TOAST_TIMEOUT_MS = 2000;
export const POLL_INTERVAL_MS = 5000;
export const POLL_TIMEOUT_MS = 45000;
