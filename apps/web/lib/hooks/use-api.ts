/**
 * Hook to access the API client from components
 */
import { apiClient } from "@/lib/auth";

export function useApi() {
  return apiClient;
}
