/**
 * Hook that integrates @bitsacco/core authentication with NextAuth
 * Provides unified auth state and methods
 */
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { authService } from "@/lib/auth";
import type { User } from "@bitsacco/core/types";

export function useCoreAuth() {
  const { data: session, status } = useSession();

  // Sync NextAuth session with core auth service
  useEffect(() => {
    if (session?.user && "id" in session.user) {
      // Store user data in core auth service for client-side operations
      const user: User = {
        id: session.user.id as string,
        profile: {
          name: session.user.name || undefined,
        },
        roles: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // This allows the core package to have user context for API calls
      authService.storeAuthData({
        user,
        accessToken: "", // Tokens are managed by NextAuth
        refreshToken: "",
      });
    } else if (status === "unauthenticated") {
      // Clear auth data when user logs out
      authService.logout();
    }
  }, [session, status]);

  return {
    user: session?.user as User | null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
