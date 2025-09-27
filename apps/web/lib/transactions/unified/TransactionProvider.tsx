/**
 * Transaction Context Provider
 * Manages unified transaction state and operations across all contexts
 */

"use client";

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import type { ApiClient } from "@bitsacco/core";

import type {
  UnifiedTransaction,
  TransactionContext as TxContext,
  TransactionFilter,
  PaginatedTransactionQuery,
  CreateTransactionRequest,
} from "./types";

import { ChamaTransactionAdapter } from "./adapters/chama-adapter";

// ============================================================================
// Types
// ============================================================================

interface TransactionContextValue {
  // State
  transactions: UnifiedTransaction[];
  loading: boolean;
  error: Error | null;

  // Filters
  filter: TransactionFilter;
  setFilter: (filter: TransactionFilter) => void;

  // Operations
  fetchTransactions: (query?: PaginatedTransactionQuery) => Promise<void>;
  createTransaction: (
    request: CreateTransactionRequest,
  ) => Promise<UnifiedTransaction>;
  refreshTransaction: (
    id: string,
    context: TxContext,
  ) => Promise<UnifiedTransaction | null>;
  watchTransaction: (
    id: string,
    context: TxContext,
    onUpdate?: (transaction: UnifiedTransaction) => void,
  ) => () => void; // Returns unwatch function

  // Adapters
  adapters: {
    chama?: ChamaTransactionAdapter;
  };
}

interface TransactionProviderProps {
  children: React.ReactNode;
  apiClient: ApiClient;
  initialFilter?: TransactionFilter;
}

// ============================================================================
// Context
// ============================================================================

const TransactionContext = createContext<TransactionContextValue | undefined>(
  undefined,
);

export function TransactionProvider({
  children,
  apiClient,
  initialFilter = {},
}: TransactionProviderProps) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";

  // ============================================================================
  // State
  // ============================================================================

  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<TransactionFilter>(initialFilter);

  // ============================================================================
  // Adapters
  // ============================================================================

  // ============================================================================
  // Smart Polling Strategy
  // ============================================================================

  const getPollingInterval = useCallback(
    (context: string, type: string, status: string): number => {
      // Lightning deposits - very fast polling for quick feedback
      if (
        context === "chama" &&
        type === "deposit" &&
        ["pending", "processing"].includes(status)
      ) {
        return 3000; // 3 seconds for Lightning payments
      }

      // Personal savings - fast polling for active payments
      if (
        context === "personal" &&
        ["pending", "processing"].includes(status)
      ) {
        return 5000; // 5 seconds
      }

      // Share subscriptions - fast polling for active payments
      if (
        context === "membership" &&
        ["pending", "processing"].includes(status)
      ) {
        return 5000; // 5 seconds
      }

      // Chama withdrawals - slow polling (human approval process)
      if (context === "chama" && type === "withdrawal") {
        if (status === "pending_approval") return 600000; // 10 minutes (waiting for admin)
        if (status === "approved") return 300000; // 5 minutes (ready to execute)
        if (status === "processing") return 30000; // 30 seconds (payment processing)
      }

      // Completed transactions - no polling needed
      if (["completed", "failed", "rejected"].includes(status)) {
        return 0; // Stop polling
      }

      return 60000; // Default 1 minute
    },
    [],
  );

  const adapters = useMemo(() => {
    // Return empty adapters if no API client or user ID
    if (!apiClient || !currentUserId) {
      return {};
    }

    const onTransactionUpdate = (tx: UnifiedTransaction) => {
      setTransactions((prev) => {
        const updated = prev.map((existing) =>
          existing.id === tx.id ? tx : existing,
        );
        return updated.some((t) => t.id === tx.id) ? updated : [...updated, tx];
      });
    };

    const result: {
      chama?: ChamaTransactionAdapter;
    } = {};

    try {
      // Initialize chama adapter if available
      if (apiClient.chamas) {
        result.chama = new ChamaTransactionAdapter({
          client: apiClient.chamas,
          currentUserId,
          onTransactionUpdate,
        });
      }
    } catch (error) {
      console.error("Error initializing transaction adapters:", error);
    }

    return result;
  }, [apiClient, currentUserId]);

  // ============================================================================
  // Polling Management
  // ============================================================================

  const schedulePollingForTransaction: (tx: UnifiedTransaction) => void = useCallback(
    (tx: UnifiedTransaction) => {
      const interval = getPollingInterval(tx.context, tx.type, tx.status);

      // If interval is 0, don't schedule polling (transaction is complete)
      if (interval === 0) {
        return;
      }

      // Schedule next poll with minimal dependencies
      setTimeout(async () => {
        try {
          // Simplified polling - just log for now to avoid complexity
          console.log(`Polling transaction ${tx.id} with status ${tx.status}`);
        } catch {
          // Silently handle polling errors to avoid console noise
        }
      }, interval);
    },
    [getPollingInterval],
  );

  // ============================================================================
  // Data Fetching
  // ============================================================================

  const fetchAllTransactions = useCallback(async (): Promise<
    UnifiedTransaction[]
  > => {
    if (!apiClient || !currentUserId) return [];

    const allTransactions: UnifiedTransaction[] = [];

    try {
      // Fetch from each context based on filter using adapters directly
      if (!filter.contexts || filter.contexts.includes("chama")) {
        if (adapters.chama && "getAllTransactions" in adapters.chama) {
          const chamaTransactions = await (
            adapters.chama as {
              getAllTransactions: () => Promise<UnifiedTransaction[]>;
            }
          ).getAllTransactions();
          allTransactions.push(...chamaTransactions);
        }
      }

      // Apply client-side filtering
      return filterTransactions(allTransactions, filter);
    } catch (err) {
      setError(err as Error);
      return [];
    }
  }, [apiClient, currentUserId, filter, adapters]);

  // Initial load and filter changes
  useEffect(() => {
    if (!apiClient || !currentUserId) {
      setTransactions([]);
      setLoading(false);
      return;
    }

    const isMounted = { current: true };

    const loadTransactions = async () => {
      setLoading(true);
      try {
        // Simple fetch without complex dependencies
        const allTransactions: UnifiedTransaction[] = [];

        // Only fetch chama transactions for now to avoid complexity
        if ((!filter.contexts || filter.contexts.includes("chama")) && apiClient.chamas) {
          try {
            // Fetch user's chamas directly
            const chamasResponse = await apiClient.chamas.filterChamas({
              memberId: currentUserId,
              pagination: { page: 0, size: 50 },
            });

            if (chamasResponse.data?.chamas) {
              // Create a temporary adapter for conversion
              const tempAdapter = new ChamaTransactionAdapter({
                client: apiClient.chamas,
                currentUserId,
                onTransactionUpdate: () => {}, // No-op for initial load
              });

              // Fetch transactions for each chama
              for (const chama of chamasResponse.data.chamas) {
                const txResponse = await apiClient.chamas.getTransactions({
                  chamaId: chama.id,
                  pagination: { page: 0, size: 50 },
                });

                if (txResponse.data?.ledger?.transactions) {
                  const unified = await tempAdapter.toUnifiedBatch(
                    txResponse.data.ledger.transactions,
                    chama,
                  );
                  allTransactions.push(...unified);
                }
              }
            }
          } catch (chamaError) {
            console.error("Error fetching chama transactions:", chamaError);
          }
        }

        // Apply basic filtering
        let filteredTxs = allTransactions;
        if (filter.targetId) {
          filteredTxs = filteredTxs.filter(
            (tx) =>
              tx.metadata.chamaId === filter.targetId ||
              tx.metadata.walletId === filter.targetId
          );
        }

        if (isMounted.current) {
          setTransactions(filteredTxs);
          setError(null);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err as Error);
          setTransactions([]);
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadTransactions();

    return () => {
      isMounted.current = false;
    };
  }, [apiClient, currentUserId, filter.contexts, filter.targetId]);

  // ============================================================================
  // Fetch Functions
  // ============================================================================

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchChamaTransactions = useCallback(async (): Promise<
    UnifiedTransaction[]
  > => {
    if (!adapters.chama) return [];

    try {
      // Fetch user's chamas
      const chamasResponse = await apiClient.chamas.filterChamas({
        memberId: currentUserId,
        pagination: { page: 0, size: 50 },
      });

      if (!chamasResponse.data?.chamas) return [];

      const allTransactions: UnifiedTransaction[] = [];

      // Fetch transactions for each chama
      for (const chama of chamasResponse.data.chamas) {
        const txResponse = await apiClient.chamas.getTransactions({
          chamaId: chama.id,
          pagination: { page: 0, size: 50 },
        });

        if (txResponse.data?.ledger?.transactions) {
          const unified = await adapters.chama.toUnifiedBatch(
            txResponse.data.ledger.transactions,
            chama,
          );
          allTransactions.push(...unified);
        }
      }

      return allTransactions;
    } catch {
      // Silently handle fetch errors
      return [];
    }
  }, [adapters.chama, apiClient, currentUserId]);


  // ============================================================================
  // Filter Function
  // ============================================================================

  const filterTransactions = (
    transactions: UnifiedTransaction[],
    filter: TransactionFilter,
  ): UnifiedTransaction[] => {
    return transactions.filter((tx) => {
      // Type filter
      if (filter.types && !filter.types.includes(tx.type)) {
        return false;
      }

      // Status filter
      if (filter.statuses && !filter.statuses.includes(tx.status)) {
        return false;
      }

      // Date range filter
      if (filter.dateRange) {
        const txDate = tx.createdAt.getTime();
        if (txDate < filter.dateRange.start.getTime()) return false;
        if (txDate > filter.dateRange.end.getTime()) return false;
      }

      // Amount range filter
      if (filter.amountRange) {
        if (tx.amount.value < filter.amountRange.min) return false;
        if (tx.amount.value > filter.amountRange.max) return false;
      }

      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const searchableText = [
          tx.metadata.reference,
          tx.metadata.description,
          tx.metadata.chamaName,
          tx.metadata.walletName,
          tx.userName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!searchableText.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  };

  // ============================================================================
  // Operations
  // ============================================================================

  const fetchTransactions = useCallback(async () => {
    try {
      const txs = await fetchAllTransactions();
      setTransactions(txs);
      setError(null);

      // Update polling for all transactions
      txs.forEach((tx) => schedulePollingForTransaction(tx));
    } catch (err) {
      setError(err as Error);
    }
  }, [fetchAllTransactions, schedulePollingForTransaction]);

  const createTransaction = useCallback(
    async (request: CreateTransactionRequest): Promise<UnifiedTransaction> => {
      // Check if API client is available
      if (!apiClient) {
        throw new Error(
          "API client not initialized. Please ensure you are logged in.",
        );
      }

      // Check if user is authenticated
      if (!currentUserId) {
        throw new Error("User not authenticated. Please log in to continue.");
      }

      const adapter = adapters[request.context];
      if (!adapter) {
        throw new Error(
          `No adapter available for context: ${request.context}. This may indicate the API client is not fully initialized.`,
        );
      }

      let transaction: UnifiedTransaction;

      switch (request.context) {
        case "chama":
          if (request.type === "withdrawal") {
            transaction = await (
              adapter as ChamaTransactionAdapter
            ).createWithdrawal(
              request.targetId,
              request.amount.value,
              request.metadata?.reference,
            );
          } else {
            transaction = await (
              adapter as ChamaTransactionAdapter
            ).createDeposit(
              request.targetId,
              request.amount.value,
              request.metadata?.reference,
            );
          }
          break;

        default:
          throw new Error(`Unsupported context: ${request.context}`);
      }

      // Add to state and start polling
      setTransactions((prev) => [...prev, transaction]);

      // Start polling this new transaction if it's not completed
      if (!["completed", "failed", "rejected"].includes(transaction.status)) {
        schedulePollingForTransaction(transaction);
      }

      return transaction;
    },
    [adapters, currentUserId, apiClient, schedulePollingForTransaction],
  );

  const refreshTransaction: (id: string, context: TxContext) => Promise<UnifiedTransaction | null> = useCallback(
    async (
      id: string,
      context: TxContext,
    ): Promise<UnifiedTransaction | null> => {
      const adapter = adapters[context];
      if (!adapter) return null;

      try {
        // Find current transaction
        const currentTx = transactions.find((tx) => tx.id === id);
        if (!currentTx) return null;

        // Fetch updated chama transaction via API endpoint
        const chamaId = currentTx.metadata.chamaId;
        if (!chamaId) return null;

        // Use the existing chama client which should have the latest transaction data
        const response = await apiClient.chamas.getTransaction(chamaId, id);

        let updatedTx: UnifiedTransaction | null = null;
        if (response.data?.ledger?.transactions?.[0]) {
          const chama = await apiClient.chamas.getChama({ chamaId });
          if (chama.data) {
            updatedTx = await (adapter as ChamaTransactionAdapter).toUnified(
              response.data.ledger.transactions[0],
              chama.data,
            );
          }
        }

        if (updatedTx) {
          // Update transaction in state
          setTransactions((prev) =>
            prev.map((tx) => (tx.id === id ? updatedTx! : tx)),
          );

          // Track status changes for potential UI updates

          // Reschedule polling based on new status
          schedulePollingForTransaction(updatedTx);
          return updatedTx;
        }

        return null;
      } catch {
        // Silently handle refresh errors
        return null;
      }
    },
    [
      adapters,
      transactions,
      apiClient,
      schedulePollingForTransaction,
    ],
  );

  // ============================================================================
  // Transaction Watching
  // ============================================================================

  const watchTransaction = useCallback(
    (
      id: string,
      context: TxContext,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _onUpdate?: (transaction: UnifiedTransaction) => void,
    ) => {
      // Simplified watch function - just return a no-op unwatch function for now
      console.log(`Watching transaction ${id} in context ${context}`);

      // Return unwatch function
      return () => {
        console.log(`Unwatching transaction ${id}`);
      };
    },
    [],
  );

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: TransactionContextValue = {
    transactions,
    loading,
    error,
    filter,
    setFilter,
    fetchTransactions,
    createTransaction,
    refreshTransaction,
    watchTransaction,
    adapters,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactions must be used within TransactionProvider");
  }
  return context;
}

// ============================================================================
// Specialized Hooks
// ============================================================================

export function useChamaTransactions(chamaId?: string) {
  const { transactions, ...rest } = useTransactions();

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (tx.context !== "chama") return false;
      if (chamaId && tx.metadata.chamaId !== chamaId) return false;
      return true;
    });
  }, [transactions, chamaId]);

  return { transactions: filtered, ...rest };
}


export function usePendingApprovals() {
  const { transactions, ...rest } = useTransactions();

  const pending = useMemo(() => {
    return transactions.filter((tx) => tx.status === "pending_approval");
  }, [transactions]);

  return { transactions: pending, ...rest };
}
