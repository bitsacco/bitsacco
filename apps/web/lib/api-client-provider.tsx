/**
 * Client-side API Client Provider
 * Provides an authenticated ApiClient instance to child components
 */

"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";
import { ApiClient } from "@bitsacco/core/client";

// ============================================================================
// Types
// ============================================================================

interface ApiClientContextValue {
  client: ApiClient | null;
  isAuthenticated: boolean;
}

// ============================================================================
// Context
// ============================================================================

const ApiClientContext = createContext<ApiClientContextValue | undefined>(
  undefined,
);

// ============================================================================
// Provider
// ============================================================================

export function ApiClientProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  // Create authenticated API client when session is available
  const client = useMemo(() => {
    if (status !== "authenticated" || !session?.accessToken) {
      return null;
    }

    // Use the proxy endpoint for client-side requests
    const baseUrl = "/api/proxy";

    return new ApiClient({
      baseUrl,
      defaultHeaders: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });
  }, [session?.accessToken, status]);

  const value: ApiClientContextValue = {
    client,
    isAuthenticated: status === "authenticated" && !!session?.accessToken,
  };

  return (
    <ApiClientContext.Provider value={value}>
      {children}
    </ApiClientContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useApiClient() {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error("useApiClient must be used within ApiClientProvider");
  }
  return context;
}
