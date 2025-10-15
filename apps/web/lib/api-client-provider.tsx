/**
 * Client-side API Client Provider
 * Provides an authenticated ApiClient instance to child components
 */

"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useSession } from "next-auth/react";
import { WebApiClient } from "./api";

// ============================================================================
// Types
// ============================================================================

interface ApiClientContextValue {
  client: WebApiClient | null;
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

  // Client-side API client uses web app's proxy routes
  // baseUrl is empty string to use current origin (web app itself)
  const client = useMemo(() => {
    if (status !== "authenticated" || !session?.accessToken) {
      return null;
    }

    return new WebApiClient({
      baseUrl: "/api", // Use web app's API routes which proxy to OS API
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
