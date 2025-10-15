/**
 * Helper functions for API routes to properly handle authentication
 */
import { auth } from "./auth";
import type { Session } from "next-auth";

// Extend Session type to include accessToken
interface SessionWithToken extends Session {
  accessToken?: string;
}

/**
 * API client that calls backend endpoints
 * Replaces the old client abstractions with direct fetch calls
 */
export async function createAuthenticatedApiClient(): Promise<{
  client: ApiClient | null;
  session: Session | null;
}> {
  const session = await auth();
  const sessionWithToken = session as SessionWithToken;

  if (!session?.user) {
    return { client: null, session: null };
  }

  if (!process.env.API_URL) {
    throw new Error("API_URL environment variable is not configured");
  }

  const accessToken = sessionWithToken.accessToken;
  if (!accessToken) {
    return { client: null, session: null };
  }

  const client = new ApiClient(process.env.API_URL, accessToken);
  return { client, session };
}

/**
 * Direct API client that makes fetch calls to backend
 * This replaces the old client abstractions
 */
class ApiClient {
  private baseUrl: string;
  private authHeaders: Record<string, string>;

  constructor(baseUrl: string, accessToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...this.authHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorMessage = `API error: ${response.status} ${response.statusText}`;
      return { error: errorMessage, data: null };
    }

    const data = await response.json();
    return { data, error: null };
  }

  // Lightning Address methods
  lightningAddress = {
    getUserLightningAddresses: () => this.request("/lnaddr"),
    createLightningAddress: (data: unknown) =>
      this.request("/lnaddr", { method: "POST", body: JSON.stringify(data) }),
    getLightningAddress: (id: string) => this.request(`/lnaddr/${id}`),
    updateLightningAddress: (id: string, data: unknown) =>
      this.request(`/lnaddr/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteLightningAddress: (id: string) =>
      this.request(`/lnaddr/${id}`, { method: "DELETE" }),
  };

  // Personal methods
  personal = {
    withdrawFromWallet: (userId: string, walletId: string, data: unknown) =>
      this.request(`/personal/users/${userId}/wallets/${walletId}/withdraw`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getUserWallets: (userId: string) =>
      this.request(`/personal/wallets?userId=${userId}`),
    createWallet: (userId: string, data: unknown) =>
      this.request(`/personal/users/${userId}/wallets`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getWallet: (userId: string, walletId: string) =>
      this.request(`/personal/wallets/${walletId}?userId=${userId}`),
    updateWallet: (userId: string, walletId: string, data: unknown) =>
      this.request(`/personal/users/${userId}/wallets/${walletId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deleteWallet: (userId: string, walletId: string) =>
      this.request(`/personal/users/${userId}/wallets/${walletId}`, {
        method: "DELETE",
      }),
    getTransactionHistory: (
      userId: string,
      data: Record<string, string | number>,
    ) => {
      // Convert numbers to strings for URLSearchParams
      const stringData: Record<string, string> = {};
      for (const [key, value] of Object.entries(data)) {
        stringData[key] = String(value);
      }
      return this.request(
        `/personal/users/${userId}/transactions?${new URLSearchParams(stringData)}`,
      );
    },
    getTransaction: (userId: string, transactionId: string) =>
      this.request(`/personal/users/${userId}/transactions/${transactionId}`),
    depositToWallet: (userId: string, walletId: string, data: unknown) =>
      this.request(`/personal/users/${userId}/wallets/${walletId}/deposit`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Membership methods
  membership = {
    getShareOffers: () => this.request("/membership/shares/offers"),
    transferShares: (data: unknown) =>
      this.request("/membership/shares/transfer", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    subscribeShares: (data: unknown) =>
      this.request("/membership/shares/subscribe", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getUserSharesTxs: (data: unknown) =>
      this.request("/membership/shares/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    offerShares: (data: unknown) =>
      this.request("/membership/shares/offer", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateSharesTx: (data: unknown) =>
      this.request("/membership/shares/update", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    createPaymentIntent: (data: unknown) =>
      this.request("/membership/payment/intent", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getMembershipTiers: () => this.request("/membership/tiers"),
    getPaymentHistory: (data: unknown) =>
      this.request("/membership/payment/history", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getPaymentProviders: () => this.request("/membership/payment/providers"),
    processPayment: (data: unknown) =>
      this.request("/membership/payment/process", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    retryPayment: (data: unknown) =>
      this.request("/membership/payment/retry", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  };

  // Chama methods
  chamas = {
    getChama: (data: { chamaId: string }) =>
      this.request(`/chama/details?chamaId=${data.chamaId}`),
    createChama: (data: unknown) =>
      this.request("/chama/create", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createDeposit: (data: unknown) =>
      this.request("/chama/deposits", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    continueDeposit: (data: unknown) =>
      this.request("/chama/deposits/continue", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    createWithdrawal: (data: unknown) =>
      this.request("/chama/withdrawals", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    filterChamas: (data: unknown) =>
      this.request("/chama/filter", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getBulkTransactionMeta: (data: unknown) =>
      this.request("/chama/transactions/bulk-meta", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getMemberProfiles: (data: unknown) =>
      this.request("/chama/members/profiles", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getTransaction: (chamaId: string, transactionId: string) =>
      this.request(`/chama/${chamaId}/transactions/${transactionId}`),
    getTransactions: (data: unknown) =>
      this.request("/chama/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    inviteMembers: (data: unknown) =>
      this.request("/chama/members/invite", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateTransaction: (data: {
      chamaId: string;
      txId: string;
      updates: unknown;
    }) =>
      this.request(`/chama/${data.chamaId}/transactions/${data.txId}`, {
        method: "PUT",
        body: JSON.stringify(data.updates),
      }),
  };
}

/**
 * Helper to get auth headers from session
 */
export async function getAuthHeaders(): Promise<Record<string, string> | null> {
  const session = await auth();
  const sessionWithToken = session as SessionWithToken;

  if (!session?.user || !sessionWithToken.accessToken) {
    return null;
  }

  return {
    Authorization: `Bearer ${sessionWithToken.accessToken}`,
  };
}
