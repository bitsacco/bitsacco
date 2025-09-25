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
import type { LoginUserRequest, User as CoreUser } from "@bitsacco/core/types";

// Type augmentations for NextAuth
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: CoreUser;
    expires: string;
  }

  interface User extends CoreUser {
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    user?: CoreUser;
    accessToken?: string;
    refreshToken?: string;
  }
}

// Import types after augmentation
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";

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
});

// Connect auth service to API client for authenticated requests
apiClient.setAuthService(authService);

// NextAuth configuration
export const authConfig: NextAuthConfig = {
  trustHost: true,
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
    jwt({ token, user, account }) {
      // Store auth data in token on initial sign in
      if (account && user) {
        // Cast user to our extended User type which includes tokens
        const authUser = user as User;
        const { accessToken, refreshToken, ...coreUser } = authUser;

        return {
          ...token,
          sub: authUser.id,
          user: coreUser as CoreUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        };
      }
      return token;
    },
    session({ session, token }: { session: Session; token: JWT }) {
      // Ensure we have a complete user object from the token
      if (token.user) {
        const enhancedSession: Session = {
          ...session,
          accessToken: token.accessToken,
          refreshToken: token.refreshToken,
          user: token.user,
        };

        return enhancedSession;
      }

      // Fallback if no user in token (shouldn't happen in normal flow)
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
      async authorize(
        credentials: Partial<Record<"phone" | "pin", unknown>>,
      ): Promise<User | null> {
        if (!credentials?.phone || !credentials?.pin) return null;

        try {
          const loginRequest: LoginUserRequest = {
            phone: String(credentials.phone),
            pin: String(credentials.pin),
          };
          const response = await apiClient.auth.login(loginRequest);

          if (response.data) {
            // Return user with tokens attached for JWT callback to process
            const authUser: User = {
              ...response.data.user,
              accessToken: response.data.accessToken || "",
              refreshToken: response.data.refreshToken || "",
            };
            return authUser;
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
      async authorize(
        credentials: Partial<Record<"npub" | "pin", unknown>>,
      ): Promise<User | null> {
        if (!credentials?.npub || !credentials?.pin) return null;

        try {
          const loginRequest: LoginUserRequest = {
            npub: String(credentials.npub),
            pin: String(credentials.pin),
          };
          const response = await apiClient.auth.login(loginRequest);

          if (response.data) {
            // Return user with tokens attached for JWT callback to process
            const authUser: User = {
              ...response.data.user,
              accessToken: response.data.accessToken || "",
              refreshToken: response.data.refreshToken || "",
            };
            return authUser;
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
