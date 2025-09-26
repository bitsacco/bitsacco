import type { MembershipTier } from "@bitsacco/core";
import { Routes } from "./routes";

/**
 * Mock membership tiers service
 * TODO: Replace with actual backend API calls once membership tiers are implemented in the backend
 *
 * This service calls the mock API endpoint instead of making real backend requests
 */

/**
 * Mock API response structure to simulate real backend response
 */
export interface MembershipTiersResponse {
  success: boolean;
  data: {
    tiers: MembershipTier[];
  };
}

/**
 * Mock fetch function that calls the local API endpoint
 * This mimics a real API request/response pattern without hitting external backend
 */
export async function fetchMembershipTiers(): Promise<MembershipTiersResponse> {
  try {
    const response = await fetch(Routes.API.MEMBERSHIP.TIERS);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch membership tiers from mock API:", error);
    // Fallback to empty response
    return {
      success: false,
      data: {
        tiers: [],
      },
    };
  }
}

/**
 * Utility functions that work with tier data
 */
export function getTierByShareCount(
  shareCount: number,
  tiers: MembershipTier[],
): MembershipTier | null {
  return (
    tiers
      .filter((tier) => shareCount >= tier.shareRequirements)
      .sort((a, b) => b.level - a.level)[0] || null
  );
}

export function getNextTier(
  currentShareCount: number,
  tiers: MembershipTier[],
): MembershipTier | null {
  return (
    tiers
      .filter((tier) => tier.shareRequirements > currentShareCount)
      .sort((a, b) => a.shareRequirements - b.shareRequirements)[0] || null
  );
}
