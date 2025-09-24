"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  WalletTransaction,
  UserTxsResponse,
  SolowalletTx,
} from "@bitsacco/core";
import { PersonalTransactionStatus } from "@bitsacco/core";

// Define simple types inline
type PaymentMethod = "mpesa" | "lightning";
type SplitType = "automatic" | "specific";

interface DepositRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  splitType?: SplitType;
  walletIds?: string[];
  walletId?: string;
  phoneNumber?: string;
}

interface WithdrawRequest {
  walletId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  phoneNumber?: string;
  lightningAddress?: string;
}

// Use the actual backend response type
type TransactionResponse = UserTxsResponse;

interface TransactionsResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    size: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface UseTransactionsOptions {
  walletId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

export interface UseTransactionsReturn {
  transactions: WalletTransaction[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  initiateDeposit: (request: DepositRequest) => Promise<TransactionResponse>;
  initiateWithdraw: (request: WithdrawRequest) => Promise<TransactionResponse>;
  getTransaction: (transactionId: string) => Promise<WalletTransaction>;
}

export function useTransactions(
  options: UseTransactionsOptions = {},
): UseTransactionsReturn {
  const { walletId, autoRefresh = false, refreshInterval = 30000 } = options;

  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);

  const fetchTransactions = useCallback(
    async (pageNum = 1, append = false) => {
      try {
        if (!append) {
          setLoading(true);
        }
        setError(null);

        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: "20",
        });

        if (walletId) {
          params.append("walletId", walletId);
        }

        const response = await fetch(`/api/personal/transactions?${params}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch transactions");
        }

        const data: TransactionsResponse = await response.json();

        if (append) {
          setTransactions((prev) => [...prev, ...data.transactions]);
        } else {
          setTransactions(data.transactions);
        }

        setHasMore(data.pagination.hasMore);
        setTotalCount(data.pagination.totalCount);
        setPage(pageNum);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching transactions:", err);
      } finally {
        setLoading(false);
      }
    },
    [walletId],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchTransactions(page + 1, true);
  }, [hasMore, loading, page, fetchTransactions]);

  const initiateDeposit = useCallback(
    async (request: DepositRequest): Promise<TransactionResponse> => {
      try {
        setError(null);

        const response = await fetch("/api/personal/deposit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to initiate deposit");
        }

        const result: TransactionResponse = await response.json();

        // Extract the transaction from the backend response and add to local state
        const newTransaction = result.ledger?.transactions?.find(
          (tx: SolowalletTx) => tx.id === result.txId,
        );

        if (newTransaction) {
          // Convert SolowalletTx to WalletTransaction format for local state
          const walletTransaction: WalletTransaction = {
            id: newTransaction.id,
            walletId: "", // Will be filled by the calling component
            walletName: "Default Wallet",
            userId: result.userId,
            type: newTransaction.type,
            amountMsats: newTransaction.amountMsats,
            amountFiat: newTransaction.amountFiat || 0,
            status: newTransaction.status,
            paymentReference: newTransaction.reference,
            failureReason: newTransaction.failureReason,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setTransactions((prev) => [walletTransaction, ...prev]);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initiate deposit";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const initiateWithdraw = useCallback(
    async (request: WithdrawRequest): Promise<TransactionResponse> => {
      try {
        setError(null);

        const response = await fetch("/api/personal/withdraw", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to initiate withdrawal");
        }

        const result: TransactionResponse = await response.json();

        // Extract the transaction from the backend response and add to local state
        const newTransaction = result.ledger?.transactions?.find(
          (tx: SolowalletTx) => tx.id === result.txId,
        );

        if (newTransaction) {
          // Convert SolowalletTx to WalletTransaction format for local state
          const walletTransaction: WalletTransaction = {
            id: newTransaction.id,
            walletId: "", // Will be filled by the calling component
            walletName: "Default Wallet",
            userId: result.userId,
            type: newTransaction.type,
            amountMsats: newTransaction.amountMsats,
            amountFiat: newTransaction.amountFiat || 0,
            status: newTransaction.status,
            paymentReference: newTransaction.reference,
            failureReason: newTransaction.failureReason,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          setTransactions((prev) => [walletTransaction, ...prev]);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to initiate withdrawal";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  const getTransaction = useCallback(
    async (transactionId: string): Promise<WalletTransaction> => {
      try {
        setError(null);

        const response = await fetch(
          `/api/personal/transactions/${transactionId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch transaction");
        }

        const transaction: WalletTransaction = await response.json();

        // Update the transaction in local state if it exists
        setTransactions((prev) =>
          prev.map((tx) => (tx.id === transactionId ? transaction : tx)),
        );

        return transaction;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch transaction";
        setError(errorMessage);
        throw err;
      }
    },
    [],
  );

  // Initial fetch
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Auto-refresh for pending transactions
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      const hasPendingTransactions = transactions.some(
        (tx) =>
          tx.status === PersonalTransactionStatus.PENDING ||
          tx.status === PersonalTransactionStatus.PROCESSING,
      );

      if (hasPendingTransactions) {
        fetchTransactions();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, transactions, fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    hasMore,
    totalCount,
    refetch: () => fetchTransactions(),
    loadMore,
    initiateDeposit,
    initiateWithdraw,
    getTransaction,
  };
}
