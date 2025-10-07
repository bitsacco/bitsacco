/**
 * Helper functions for API routes to properly handle authentication
 */
import { ApiClient } from "@bitsacco/core";
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
