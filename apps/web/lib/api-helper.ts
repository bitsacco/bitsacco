/**
 * Helper functions for API routes to properly handle authentication
 */
import { ApiClient } from "@bitsacco/core/client";
import { auth } from "./auth";
import type { Session } from "next-auth";

// Extend Session type to include accessToken
interface SessionWithToken extends Session {
  accessToken?: string;
}

/**
 * Create an authenticated API client for server-side requests
 * This sets up the API client with the access token from the session
 */
export async function createAuthenticatedApiClient(): Promise<{
  client: ApiClient | null;
  session: Session | null;
}> {
  const session = await auth();

  // Debug: Log full session object
  const sessionWithToken = session as SessionWithToken;
  console.log("[API-HELPER] Full session object:", {
    sessionKeys: session ? Object.keys(session) : [],
    userKeys: session?.user ? Object.keys(session.user) : [],
    hasDirectAccessToken: !!sessionWithToken?.accessToken,
    fullSession: JSON.stringify(session, null, 2).substring(0, 500),
  });

  // Debug: Log session status
  console.log("[API-HELPER] Session check:", {
    hasSession: !!session,
    hasUser: !!session?.user,
    userId: session?.user?.id,
    hasAccessToken: !!sessionWithToken?.accessToken,
    tokenPreview: sessionWithToken?.accessToken
      ? `${sessionWithToken.accessToken.substring(0, 20)}...`
      : "NO_TOKEN",
  });

  if (!session?.user) {
    console.log("[API-HELPER] No authenticated session found");
    return { client: null, session: null };
  }

  if (!process.env.API_URL) {
    throw new Error("API_URL environment variable is not configured");
  }

  const accessToken = sessionWithToken.accessToken;
  if (!accessToken) {
    console.error("[API-HELPER] Session exists but no access token found!");
    return { client: null, session: null };
  }

  // Debug: Log API client creation
  console.log("[API-HELPER] Creating authenticated API client:", {
    apiUrl: process.env.API_URL,
    authHeader: `Bearer ${accessToken.substring(0, 20)}...`,
  });

  // Create a new ApiClient instance with auth headers for this request
  const client = new ApiClient({
    baseUrl: process.env.API_URL,
    defaultHeaders: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return { client, session };
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
