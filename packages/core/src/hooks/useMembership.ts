import { useState, useEffect, useCallback } from "react";
import type { ApiClient } from "../client/api-client";
import type {
  AllSharesOffers,
  UserShareTxsResponse,
  SubscribeSharesRequest,
  TransferSharesRequest,
} from "../types/membership";

export interface UseShareOffersOptions {
  apiClient: ApiClient;
}

export interface UseUserSharesOptions {
  apiClient: ApiClient;
  userId: string;
}

export interface UseShareActionsOptions {
  apiClient: ApiClient;
  userId: string;
}

export function useShareOffers({ apiClient }: UseShareOffersOptions) {
  const [offers, setOffers] = useState<AllSharesOffers | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.membership.getShareOffers();
      if (response.error) {
        throw new Error(response.error);
      }
      setOffers(response.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch offers");
    } finally {
      setLoading(false);
    }
  }, [apiClient]);

  useEffect(() => {
    void fetchOffers();
  }, [fetchOffers]);

  return { offers, loading, error, refetch: fetchOffers };
}

export function useUserSharesTxs({ apiClient, userId }: UseUserSharesOptions) {
  const [transactions, setTransactions] = useState<UserShareTxsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(
    async (page = 0, size = 10) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.membership.getUserSharesTxs({
          userId,
          page,
          size,
        });
        if (response.error) {
          throw new Error(response.error);
        }
        setTransactions(response.data || null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch transactions",
        );
      } finally {
        setLoading(false);
      }
    },
    [apiClient, userId],
  );

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  return { transactions, loading, error, refetch: fetchTransactions };
}

export function useSubscribeShares({
  apiClient,
  userId,
}: UseShareActionsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subscribe = useCallback(
    async (data: Omit<SubscribeSharesRequest, "userId">) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.membership.subscribeShares({
          ...data,
          userId,
        });
        if (response.error) {
          throw new Error(response.error);
        }
        return response.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to subscribe");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiClient, userId],
  );

  return { subscribe, loading, error };
}

export function useTransferShares({
  apiClient,
  userId,
}: UseShareActionsOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const transfer = useCallback(
    async (data: Omit<TransferSharesRequest, "fromUserId">) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.membership.transferShares({
          ...data,
          fromUserId: userId,
        });
        if (response.error) {
          throw new Error(response.error);
        }
        return response.data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to transfer");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiClient, userId],
  );

  return { transfer, loading, error };
}
