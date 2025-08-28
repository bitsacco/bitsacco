import { useMemo } from "react";
import { ApiClient } from "../client/api-client";
import type { AuthService } from "../auth/auth-service";

export interface UseApiClientOptions {
  baseUrl?: string;
  authService?: AuthService;
}

/**
 * Hook to create and manage an API client instance
 * Framework-agnostic - doesn't depend on NextJS or any specific auth library
 */
export function useApiClient({ baseUrl, authService }: UseApiClientOptions) {
  const apiClient = useMemo(() => {
    if (!baseUrl) {
      throw new Error("baseUrl is required for API client initialization");
    }

    return new ApiClient({
      baseUrl,
      authService,
    });
  }, [baseUrl, authService]);

  return apiClient;
}
