/**
 * Transaction Status Monitor
 * Handles real-time polling and status updates for transactions
 */

import type {
  UnifiedTransaction,
  TransactionContext,
  UnifiedTransactionStatus as TransactionStatus,
} from "@bitsacco/core";

export interface TransactionStatusMonitorOptions {
  pollingInterval?: number;
  maxRetries?: number;
  onStatusChange?: (
    transaction: UnifiedTransaction,
    oldStatus: TransactionStatus,
  ) => void;
  onError?: (error: Error, transactionId: string) => void;
  fetchTransactionStatus?: (
    transaction: UnifiedTransaction,
  ) => Promise<UnifiedTransaction | null>;
}

export class TransactionStatusMonitor {
  private monitoredTransactions = new Map<
    string,
    {
      transaction: UnifiedTransaction;
      pollCount: number;
      retryCount: number;
      intervalId?: NodeJS.Timeout;
    }
  >();

  private options: Required<TransactionStatusMonitorOptions>;

  constructor(options: TransactionStatusMonitorOptions = {}) {
    this.options = {
      pollingInterval: options.pollingInterval || 5000, // 5 seconds
      maxRetries: options.maxRetries || 12, // 1 minute total
      onStatusChange: options.onStatusChange || (() => {}),
      onError: options.onError || (() => {}),
      fetchTransactionStatus:
        options.fetchTransactionStatus || (async () => null),
    };
  }

  /**
   * Start monitoring a transaction for status changes
   */
  monitor(transaction: UnifiedTransaction): void {
    // Don't monitor completed/final transactions
    if (this.isFinalStatus(transaction.status)) {
      return;
    }

    // Stop existing monitoring for this transaction
    this.stopMonitoring(transaction.id);

    // Start monitoring
    const monitorData = {
      transaction,
      pollCount: 0,
      retryCount: 0,
    };

    this.monitoredTransactions.set(transaction.id, monitorData);
    this.startPolling(transaction.id);
  }

  /**
   * Stop monitoring a specific transaction
   */
  stopMonitoring(transactionId: string): void {
    const monitorData = this.monitoredTransactions.get(transactionId);
    if (monitorData?.intervalId) {
      clearInterval(monitorData.intervalId);
    }
    this.monitoredTransactions.delete(transactionId);
  }

  /**
   * Stop monitoring all transactions
   */
  stopAll(): void {
    Array.from(this.monitoredTransactions.keys()).forEach((transactionId) => {
      this.stopMonitoring(transactionId);
    });
  }

  /**
   * Get currently monitored transactions
   */
  getMonitoredTransactions(): UnifiedTransaction[] {
    return Array.from(this.monitoredTransactions.values()).map(
      (data) => data.transaction,
    );
  }

  /**
   * Update transaction status manually (from external sources)
   */
  updateTransactionStatus(
    transactionId: string,
    newStatus: TransactionStatus,
  ): void {
    const monitorData = this.monitoredTransactions.get(transactionId);
    if (!monitorData) return;

    const oldStatus = monitorData.transaction.status;
    if (oldStatus !== newStatus) {
      monitorData.transaction = {
        ...monitorData.transaction,
        status: newStatus,
        updatedAt: new Date(),
      };

      this.options.onStatusChange(monitorData.transaction, oldStatus);

      // Stop monitoring if final status reached
      if (this.isFinalStatus(newStatus)) {
        this.stopMonitoring(transactionId);
      }
    }
  }

  private startPolling(transactionId: string): void {
    const monitorData = this.monitoredTransactions.get(transactionId);
    if (!monitorData) return;

    const poll = async () => {
      try {
        monitorData.pollCount++;

        // Get updated transaction status
        const updatedTransaction = await this.fetchTransactionStatus(
          monitorData.transaction,
        );

        if (updatedTransaction) {
          const oldStatus = monitorData.transaction.status;
          const newStatus = updatedTransaction.status;

          if (oldStatus !== newStatus) {
            monitorData.transaction = updatedTransaction;
            this.options.onStatusChange(updatedTransaction, oldStatus);

            // Stop monitoring if final status reached
            if (this.isFinalStatus(newStatus)) {
              this.stopMonitoring(transactionId);
              return;
            }
          }
        }

        // Check if we've exceeded max retries
        if (monitorData.pollCount >= this.options.maxRetries) {
          this.options.onError(
            new Error(
              `Max polling attempts reached for transaction ${transactionId}`,
            ),
            transactionId,
          );
          this.stopMonitoring(transactionId);
          return;
        }

        // Reset retry count on successful poll
        monitorData.retryCount = 0;
      } catch (error) {
        monitorData.retryCount++;

        if (monitorData.retryCount >= 3) {
          this.options.onError(
            error instanceof Error
              ? error
              : new Error(`Polling failed for transaction ${transactionId}`),
            transactionId,
          );
          this.stopMonitoring(transactionId);
        }
      }
    };

    // Start immediate poll, then set interval
    poll();
    monitorData.intervalId = setInterval(poll, this.options.pollingInterval);
  }

  private async fetchTransactionStatus(
    transaction: UnifiedTransaction,
  ): Promise<UnifiedTransaction | null> {
    // Use the provided fetch function if available
    if (this.options.fetchTransactionStatus) {
      try {
        return await this.options.fetchTransactionStatus(transaction);
      } catch {
        return null;
      }
    }

    // Fallback to simulation only if no fetch function is provided
    return this.simulateStatusProgression(transaction);
  }

  private simulateStatusProgression(
    transaction: UnifiedTransaction,
  ): UnifiedTransaction | null {
    // Simulate realistic status progression based on context and type
    const { status, context, type } = transaction;

    // Random chance of status change to simulate real updates
    if (Math.random() > 0.3) return null; // 70% chance no change

    let newStatus: TransactionStatus = status;

    switch (status) {
      case "pending":
        if (context === "chama" && type === "withdrawal") {
          newStatus = "pending_approval";
        } else {
          newStatus = Math.random() > 0.5 ? "processing" : "pending";
        }
        break;

      case "pending_approval":
        // Simulate admin approval (random)
        newStatus =
          Math.random() > 0.7
            ? "approved"
            : Math.random() > 0.9
              ? "rejected"
              : "pending_approval";
        break;

      case "approved":
        // Once approved, should move to processing when user executes
        newStatus = Math.random() > 0.8 ? "processing" : "approved";
        break;

      case "processing":
        // Processing usually completes or fails
        newStatus =
          Math.random() > 0.8
            ? "completed"
            : Math.random() > 0.95
              ? "failed"
              : "processing";
        break;

      default:
        return null; // No progression for final states
    }

    if (newStatus !== status) {
      return {
        ...transaction,
        status: newStatus,
        updatedAt: new Date(),
      };
    }

    return null;
  }

  private isFinalStatus(status: TransactionStatus): boolean {
    return ["completed", "failed", "rejected", "expired"].includes(status);
  }

  // ============================================================================
  // Priority Monitoring
  // ============================================================================

  /**
   * Get high priority transactions that need attention
   */
  getHighPriorityTransactions(): UnifiedTransaction[] {
    return this.getMonitoredTransactions().filter((tx) => {
      // Pending approvals are high priority
      if (tx.status === "pending_approval") return true;

      // Approved withdrawals ready for execution
      if (tx.status === "approved" && tx.type === "withdrawal") return true;

      // Processing transactions that have been processing for too long
      if (tx.status === "processing" && tx.updatedAt) {
        const processingTime = Date.now() - tx.updatedAt.getTime();
        return processingTime > 5 * 60 * 1000; // 5 minutes
      }

      return false;
    });
  }

  /**
   * Get transactions by status
   */
  getTransactionsByStatus(status: TransactionStatus): UnifiedTransaction[] {
    return this.getMonitoredTransactions().filter((tx) => tx.status === status);
  }

  /**
   * Get transactions by context
   */
  getTransactionsByContext(context: TransactionContext): UnifiedTransaction[] {
    return this.getMonitoredTransactions().filter(
      (tx) => tx.context === context,
    );
  }

  /**
   * Get monitoring statistics
   */
  getStats() {
    const transactions = this.getMonitoredTransactions();
    const statusCounts = transactions.reduce(
      (acc, tx) => {
        acc[tx.status] = (acc[tx.status] || 0) + 1;
        return acc;
      },
      {} as Record<TransactionStatus, number>,
    );

    const contextCounts = transactions.reduce(
      (acc, tx) => {
        acc[tx.context] = (acc[tx.context] || 0) + 1;
        return acc;
      },
      {} as Record<TransactionContext, number>,
    );

    return {
      totalMonitored: transactions.length,
      highPriority: this.getHighPriorityTransactions().length,
      statusCounts,
      contextCounts,
    };
  }
}

// ============================================================================
// React Hook for Transaction Monitoring
// ============================================================================

import { useEffect, useRef, useState } from "react";

export function useTransactionMonitor(
  options: TransactionStatusMonitorOptions = {},
) {
  const monitorRef = useRef<TransactionStatusMonitor | undefined>(undefined);
  const [monitoredTransactions, setMonitoredTransactions] = useState<
    UnifiedTransaction[]
  >([]);
  const [stats, setStats] = useState({
    totalMonitored: 0,
    highPriority: 0,
    statusCounts: {} as Record<TransactionStatus, number>,
    contextCounts: {} as Record<TransactionContext, number>,
  });

  useEffect(() => {
    monitorRef.current = new TransactionStatusMonitor({
      ...options,
      onStatusChange: (transaction, oldStatus) => {
        // Update local state
        setMonitoredTransactions((prev) =>
          prev.map((tx) => (tx.id === transaction.id ? transaction : tx)),
        );

        // Update stats
        if (monitorRef.current) {
          setStats(monitorRef.current.getStats());
        }

        // Call user callback
        options.onStatusChange?.(transaction, oldStatus);
      },
      onError: (error, transactionId) => {
        options.onError?.(error, transactionId);
      },
    });

    return () => {
      monitorRef.current?.stopAll();
    };
  }, [options]);

  const monitor = (transaction: UnifiedTransaction) => {
    monitorRef.current?.monitor(transaction);
    setMonitoredTransactions((prev) => {
      const existing = prev.find((tx) => tx.id === transaction.id);
      if (existing) {
        return prev.map((tx) => (tx.id === transaction.id ? transaction : tx));
      }
      return [...prev, transaction];
    });

    if (monitorRef.current) {
      setStats(monitorRef.current.getStats());
    }
  };

  const stopMonitoring = (transactionId: string) => {
    monitorRef.current?.stopMonitoring(transactionId);
    setMonitoredTransactions((prev) =>
      prev.filter((tx) => tx.id !== transactionId),
    );

    if (monitorRef.current) {
      setStats(monitorRef.current.getStats());
    }
  };

  const stopAll = () => {
    monitorRef.current?.stopAll();
    setMonitoredTransactions([]);
    setStats({
      totalMonitored: 0,
      highPriority: 0,
      statusCounts: {} as Record<TransactionStatus, number>,
      contextCounts: {} as Record<TransactionContext, number>,
    });
  };

  const getHighPriorityTransactions = () => {
    return monitorRef.current?.getHighPriorityTransactions() || [];
  };

  return {
    monitor,
    stopMonitoring,
    stopAll,
    monitoredTransactions,
    stats,
    getHighPriorityTransactions,
  };
}
