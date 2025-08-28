/**
 * Simplified NextAuth configuration with @bitsacco/core integration
 * Single source of truth for authentication
 */
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { ApiClient } from "@bitsacco/core/client";
import { AuthService } from "@bitsacco/core/auth";
import {
  WebStorageAdapter,
  type StorageAdapter,
} from "@bitsacco/core/adapters";
import type { LoginUserRequest } from "@bitsacco/core/types";
import type { Session } from "next-auth";

// API configuration
const API_URL =
  typeof window !== "undefined" ? "/api/proxy" : process.env.API_URL || "";

// Initialize core services
// Only create client-side services when in browser
export const apiClient = new ApiClient({ baseUrl: API_URL });

// Create a no-op storage adapter for server-side
class ServerStorageAdapter implements StorageAdapter {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getItem(key: string): Promise<string | null> {
    return null;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async setItem(key: string, value: string): Promise<void> {
    // No-op for server-side
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async removeItem(key: string): Promise<void> {
    // No-op for server-side
  }
  async clear(): Promise<void> {
    // No-op for server-side
  }
}

export const authService = new AuthService({
  storage:
    typeof window !== "undefined"
      ? new WebStorageAdapter()
      : new ServerStorageAdapter(),
  apiBaseUrl: API_URL,
});

// Connect auth service to API client for authenticated requests
apiClient.setAuthService(authService);

// NextAuth configuration
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    authorized({
      auth,
      request: { nextUrl },
    }: {
      auth: Session | null;
      request: { nextUrl: URL };
    }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnAuth = nextUrl.pathname.startsWith("/auth");

      if (isOnDashboard) {
        return isLoggedIn;
      } else if (isLoggedIn && isOnAuth) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jwt({ token, user, account }: any) {
      // Store auth data in token on initial sign in
      if (account && user) {
        return {
          ...token,
          sub: user.id,
          user: user.user,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
        };
      }
      return token;
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session({ session, token }: any) {
      if (token.user && session.user) {
        session.user.id = token.user.id;
        session.user.name = token.user.profile?.name || null;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      id: "phone-pin",
      name: "Phone & PIN",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        pin: { label: "PIN", type: "password" },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials: any) {
        if (!credentials?.phone || !credentials?.pin) return null;

        try {
          const loginRequest: LoginUserRequest = {
            phone: credentials.phone,
            pin: credentials.pin,
          };
          const response = await apiClient.auth.login(loginRequest);

          if (response.data) {
            // Return the exact shape NextAuth expects
            return {
              id: response.data.user.id,
              ...response.data, // includes user, accessToken, refreshToken
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
        }
        return null;
      },
    }),
    CredentialsProvider({
      id: "nostr-pin",
      name: "Nostr & PIN",
      credentials: {
        npub: { label: "Nostr Public Key", type: "text" },
        pin: { label: "PIN", type: "password" },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async authorize(credentials: any) {
        if (!credentials?.npub || !credentials?.pin) return null;

        try {
          const loginRequest: LoginUserRequest = {
            npub: credentials.npub,
            pin: credentials.pin,
          };
          const response = await apiClient.auth.login(loginRequest);

          if (response.data) {
            // Return the exact shape NextAuth expects
            return {
              id: response.data.user.id,
              ...response.data, // includes user, accessToken, refreshToken
            };
          }
        } catch (error) {
          console.error("Auth error:", error);
        }
        return null;
      },
    }),
  ],
  events: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async signOut(params: any) {
      // Clean up tokens on sign out
      if ("token" in params && params.token) {
        if (params.token.refreshToken) {
          await apiClient.auth.logout(params.token.refreshToken);
        }
      }
    },
  },
};

// Export NextAuth instance - using type assertion to avoid TypeScript strict mode issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { handlers, auth, signIn, signOut } = NextAuth(authConfig) as any;

export { handlers, auth, signIn, signOut };
