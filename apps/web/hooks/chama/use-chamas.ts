"use client";

import { useState, useCallback, useEffect } from "react";
import { useSession } from "next-auth/react";
import type {
  PaginatedFilterChamasResponse,
  BulkChamaTxMetaResponse,
  ChamaMeta,
} from "@bitsacco/core";
import { Routes } from "@/lib/routes";

interface UseChamasOptions {
  page?: number;
  size?: number;
  enabled?: boolean;
}

interface ChamaBalances {
  groupBalanceMsats: number;
  memberBalanceMsats: number;
}

export function useChamas({
  page = 0,
  size = 10,
  enabled = true,
}: UseChamasOptions = {}) {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(page);
  const [chamas, setChamas] = useState<PaginatedFilterChamasResponse | null>(
    null,
  );
  const [chamaMetaData, setChamaMetaData] =
    useState<BulkChamaTxMetaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChamas = useCallback(
    async (pageNum = 0, pageSize = size): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/chama/list?page=${pageNum}&size=${pageSize}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          },
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Failed to fetch chamas");
        }

        setChamas(data.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching chamas:", err);
      } finally {
        setLoading(false);
      }
    },
    [size],
  );

  const fetchChamaMetadata = useCallback(async () => {
    try {
      if (!chamas?.chamas?.length || !session?.user?.id) return;

      const response = await fetch(Routes.API.CHAMA.META, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamaIds: chamas.chamas.map((chama) => chama.id),
          selectMemberIds: [session.user.id],
          skipMemberMeta: false,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch chama metadata");
      }

      setChamaMetaData(data.data);
    } catch (err) {
      console.error("Error fetching chama metadata:", err);
    }
  }, [chamas, session?.user?.id]);

  // Fetch chamas on mount and when enabled changes
  useEffect(() => {
    if (enabled && session?.user?.id) {
      fetchChamas(currentPage, size);
    }
  }, [fetchChamas, currentPage, size, enabled, session?.user?.id]);

  // Fetch metadata when chamas change
  useEffect(() => {
    if (chamas?.chamas?.length && session?.user?.id) {
      fetchChamaMetadata();
    }
  }, [chamas, fetchChamaMetadata, session?.user?.id]);

  const getChamaBalances = useCallback(
    (chamaId: string): ChamaBalances | null => {
      if (!chamaMetaData?.meta || !session?.user?.id) return null;

      const chamaMeta = chamaMetaData.meta.find(
        (m: ChamaMeta) => m.chamaId === chamaId,
      );
      if (!chamaMeta) return null;

      // Find the current user's member balance
      const currentUserMemberMeta = chamaMeta.memberMeta?.find(
        (m) => m.memberId === session.user?.id,
      );
      const memberBalance =
        currentUserMemberMeta?.memberMeta?.memberBalance || 0;

      return {
        groupBalanceMsats: chamaMeta.groupMeta?.groupBalance || 0,
        memberBalanceMsats: memberBalance,
      };
    },
    [chamaMetaData, session?.user?.id],
  );

  const goToPage = useCallback(
    async (pageNum: number) => {
      setCurrentPage(pageNum);
      await fetchChamas(pageNum, size);
    },
    [fetchChamas, size],
  );

  const refetch = useCallback(() => {
    return fetchChamas(currentPage, size);
  }, [fetchChamas, currentPage, size]);

  return {
    chamas: chamas?.chamas || [],
    pagination: chamas
      ? {
          page: chamas.page,
          size: chamas.size,
          pages: chamas.pages,
          total: chamas.total,
        }
      : null,
    loading,
    error,
    refetch,
    currentPage,
    goToPage,
    getChamaBalances,
    chamaMetaData,
  };
}
