"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Chama,
  ChamaTxsResponse,
  MemberProfilesResponse,
  BulkChamaTxMetaResponse,
} from "@bitsacco/core";

interface UseChamaDetailsOptions {
  chamaId: string | null;
  enabled?: boolean;
}

export function useChamaDetails({
  chamaId,
  enabled = true,
}: UseChamaDetailsOptions) {
  const [chama, setChama] = useState<Chama | null>(null);
  const [transactions, setTransactions] = useState<ChamaTxsResponse | null>(
    null,
  );
  const [memberProfiles, setMemberProfiles] =
    useState<MemberProfilesResponse | null>(null);
  const [metadata, setMetadata] = useState<BulkChamaTxMetaResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChamaDetails = useCallback(async () => {
    if (!chamaId) return;

    try {
      const response = await fetch(
        `/api/chama/details?chamaId=${encodeURIComponent(chamaId)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch chama details");
      }

      setChama(data.data);
    } catch (err) {
      console.error("Error fetching chama details:", err);
      throw err;
    }
  }, [chamaId]);

  const fetchTransactions = useCallback(async () => {
    if (!chamaId) return;

    try {
      const response = await fetch(
        `/api/chama/transactions/list?chamaId=${encodeURIComponent(chamaId)}&page=0&size=20`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch chama transactions");
      }

      setTransactions(data.data);
    } catch (err) {
      console.error("Error fetching chama transactions:", err);
      throw err;
    }
  }, [chamaId]);

  const fetchMemberProfiles = useCallback(async () => {
    if (!chamaId) return;

    try {
      const response = await fetch(
        `/api/chama/members?chamaId=${encodeURIComponent(chamaId)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch member profiles");
      }

      setMemberProfiles(data.data);
    } catch (err) {
      console.error("Error fetching member profiles:", err);
      throw err;
    }
  }, [chamaId]);

  const fetchMetadata = useCallback(async () => {
    if (!chamaId) return;

    try {
      const response = await fetch(`/api/chama/meta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamaIds: [chamaId],
          selectMemberIds: [], // Will be filled with current user ID by the API
          skipMemberMeta: false,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch chama metadata");
      }

      setMetadata(data.data);
    } catch (err) {
      console.error("Error fetching chama metadata:", err);
      throw err;
    }
  }, [chamaId]);

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    if (!enabled || !chamaId) return;

    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        fetchChamaDetails(),
        fetchTransactions(),
        fetchMemberProfiles(),
        fetchMetadata(),
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [
    enabled,
    chamaId,
    fetchChamaDetails,
    fetchTransactions,
    fetchMemberProfiles,
    fetchMetadata,
  ]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const refetch = useCallback(() => {
    return fetchAllData();
  }, [fetchAllData]);

  // Check if current user is admin (simplified without session)
  const isAdmin = false; // TODO: Implement admin check when session is available

  return {
    chama,
    transactions,
    memberProfiles,
    metadata,
    isAdmin,
    loading,
    error,
    refetch,
  };
}
