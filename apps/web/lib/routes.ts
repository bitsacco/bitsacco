/**
 * Application Routes
 * Centralized route definitions to avoid magic strings and make route changes easier
 */
export const Routes = {
  // Public routes
  HOME: "/",

  // Auth routes
  LOGIN: "/login",
  SIGNUP: "/signup",
  RECOVER: "/recover",
  AUTH_ERROR: "/error",

  // Dashboard routes
  MEMBERSHIP: "/membership",
  PERSONAL: "/personal",
  CHAMAS: "/chamas",
  ACCOUNT: "/account",

  // Dynamic routes (use as functions)
  CHAMA_DETAILS: (id: string) => `/chamas/${id}`,
  JOIN_CHAMA: (id: string) => `/chamas/join/${id}`,

  // API routes
  API: {
    AUTH: {
      NEXTAUTH: "/api/auth/[...nextauth]",
      REGISTER: "/api/auth/register",
      VERIFY: "/api/auth/verify",
    },
    RECOVER: {
      REQUEST: "/api/recover/request",
      RESET: "/api/recover/reset",
    },
    PERSONAL: {
      DEPOSIT: "/api/personal/deposit",
      WITHDRAW: "/api/personal/withdraw",
      EXCHANGE_RATE: "/api/personal/exchange-rate",
      TRANSACTIONS: "/api/personal/transactions",
      TRANSACTION_DETAILS: (id: string) => `/api/personal/transactions/${id}`,
      WALLETS: "/api/personal/wallets",
      WALLET_DETAILS: (id: string) => `/api/personal/wallets/${id}`,
    },
    CHAMA: {
      CREATE: "/api/chama/create",
      LIST: "/api/chama/list",
      DETAILS: "/api/chama/details",
      DEPOSITS: "/api/chama/deposits",
      INVITE: "/api/chama/invite",
      JOIN: "/api/chama/join",
      MEMBERS: "/api/chama/members",
      META: "/api/chama/meta",
      TRANSACTIONS: {
        LIST: "/api/chama/transactions/list",
        STATUS: "/api/chama/transactions/status",
      },
      WITHDRAWALS: {
        REQUEST: "/api/chama/withdraw/request",
        APPROVE: "/api/chama/withdraw/approve",
        EXECUTE: "/api/chama/withdraw/execute",
      },
    },
    MEMBERSHIP: {
      MEMBERS: "/api/membership/members",
      TIERS: "/api/membership/tiers",
      PAYMENTS: {
        HISTORY: "/api/membership/payments/history",
        INTENTS: "/api/membership/payments/intents",
        PROCESS: "/api/membership/payments/process",
        PROVIDERS: "/api/membership/payments/providers",
        RETRY: "/api/membership/payments/retry",
        STATUS: "/api/membership/payments/status",
      },
      SHARES: {
        LIST: "/api/membership/shares/list",
        OFFERS: "/api/membership/shares/offers",
        SUBSCRIBE: "/api/membership/shares/subscribe",
        TRANSACTIONS: "/api/membership/shares/transactions",
        TRANSFER: "/api/membership/shares/transfer",
        VALIDATE: "/api/membership/shares/validate",
      },
    },
    PROXY: (path: string) => `/api/proxy/${path}`,
  },
} as const;

// Type for route values
export type RouteValue = (typeof Routes)[keyof typeof Routes] | string;
