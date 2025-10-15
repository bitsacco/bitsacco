// We'll use a simplified approach for mobile to avoid Node.js dependencies
import { mobileAuthService } from "./mobileAuthService";
import axios from "axios";
import type {
  LoginUserRequest,
  RegisterUserRequest,
  User,
} from "@bitsacco/core";

// Create a simple API client using axios instead of the core client to avoid jose dependency
const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000",
  timeout: 10000,
});

// Add auth interceptor
apiClient.interceptors.request.use(async (config) => {
  const token = await mobileAuthService.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Export API methods for easy use in controllers
export const authApi = {
  login: async (credentials: LoginUserRequest) => {
    return await mobileAuthService.login(credentials);
  },

  register: async (userData: RegisterUserRequest) => {
    return await mobileAuthService.register(userData);
  },

  logout: async () => {
    return await mobileAuthService.logout();
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const isAuth = await mobileAuthService.isAuthenticated();
      if (!isAuth) return null;

      // For now, return mock user data
      // In a real implementation, you'd call your API
      return {
        id: "mock-user",
        roles: [0],
        phone: { number: "123456789", verified: false },
      };
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  },
};

export const membershipApi = {
  getShares: async (userId: string) => {
    try {
      const response = await apiClient.get(
        `/membership/shares/transactions/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching shares:", error);
      // Return mock data for now
      return {
        transactions: [],
        totalCount: 0,
        page: 1,
        size: 20,
        totalShares: 0,
      };
    }
  },

  getSharesOffers: async () => {
    try {
      const response = await apiClient.get("/membership/shares/offers");
      return response.data;
    } catch (error) {
      console.error("Error fetching share offers:", error);
      // Return mock data
      return {
        offers: [],
        totalCount: 0,
      };
    }
  },

  subscribeToShares: async (
    userId: string,
    offerId: string,
    quantity: number
  ) => {
    try {
      const response = await apiClient.post("/membership/shares/subscribe", {
        userId,
        offerId,
        quantity,
      });
      return response.data;
    } catch (error) {
      console.error("Error subscribing to shares:", error);
      throw error;
    }
  },
};

export const walletApi = {
  getBalance: async () => {
    try {
      const response = await apiClient.get("/wallet/balance");
      return response.data;
    } catch (error) {
      console.error("Error fetching balance:", error);
      // Return mock data
      return { balance: 0, currency: "USD" };
    }
  },

  getTransactions: async (limit = 20) => {
    try {
      const response = await apiClient.get(
        `/wallet/transactions?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      // Return mock data
      return { transactions: [] };
    }
  },
};

export const fxApi = {
  getExchangeRate: async (from: string, to: string) => {
    try {
      const response = await apiClient.get(`/fx/quote?from=${from}&to=${to}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      // Return mock data
      return { rate: 1, from, to };
    }
  },
};
