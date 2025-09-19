"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ChamaWalletTx, ChamaTxStatus } from "@bitsacco/core";

interface UseChamaTransactionStatusOptions {
  chamaId: string | null;
  transactionId: string | null;
  enabled?: boolean;
  pollInterval?: number;
  maxPollingDuration?: number;
  onStatusChange?: (status: ChamaTxStatus, transaction?: ChamaWalletTx) => void;
  onComplete?: (transaction: ChamaWalletTx) => void;
  onFailed?: (transaction: ChamaWalletTx) => void;
}

interface ChamaTransactionStatusData {
  transaction: ChamaWalletTx | null;
  loading: boolean;
  error: string | null;
  polling: boolean;
}

export function useChamaTransactionStatus({
  chamaId,
  transactionId,
  enabled = true,
  pollInterval = 5000, // Poll every 5 seconds (matching webapp)
  maxPollingDuration = 45000, // Stop polling after 45 seconds (matching webapp)
  onStatusChange,
  onComplete,
  onFailed,
}: UseChamaTransactionStatusOptions): ChamaTransactionStatusData & {
  startPolling: () => void;
  stopPolling: () => void;
  checkStatus: () => Promise<void>;
} {
  const [transaction, setTransaction] = useState<ChamaWalletTx | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const previousStatusRef = useRef<ChamaTxStatus | null>(null);

  const checkStatus = useCallback(async () => {
    if (!chamaId || !transactionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/chama/transactions/status?chamaId=${encodeURIComponent(chamaId)}&transactionId=${encodeURIComponent(transactionId)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        const transactionData =
          data.data.ledger?.transactions?.[0] || data.data;
        if (transactionData) {
          console.log("[ChamaTransactionStatus] Transaction data:", {
            id: transactionData.id,
            status: transactionData.status,
            hasLightning: !!transactionData.lightning,
            lightningType: typeof transactionData.lightning,
            lightningData: transactionData.lightning,
          });

          // Log COMPLETE transaction from polling
          console.log(
            "[ChamaTransactionStatus] FULL TRANSACTION FROM POLL:",
            transactionData,
          );
          console.log(
            "[ChamaTransactionStatus] FULL TRANSACTION (stringified):",
            JSON.stringify(transactionData, null, 2),
          );
          setTransaction(transactionData);

          // Check if status changed
          const currentStatus = transactionData.status;
          if (previousStatusRef.current !== currentStatus) {
            previousStatusRef.current = currentStatus;
            onStatusChange?.(currentStatus, transactionData);

            // Handle final states (matching backend ChamaTxStatus enum)
            if (currentStatus === 3) {
              // COMPLETE
              onComplete?.(transactionData);
            } else if (currentStatus === 2 || currentStatus === 5) {
              // FAILED or REJECTED
              onFailed?.(transactionData);
            }
          } else {
            // Even if status hasn't changed, call onStatusChange to update Lightning invoice
            // This is important because the Lightning invoice might be generated after the transaction is created
            onStatusChange?.(currentStatus, transactionData);
          }
        }
      } else {
        const errorMessage = data.error || "Failed to check transaction status";
        setError(errorMessage);
        console.error("Chama transaction status check failed:", {
          error: data.error,
          status: response.status,
        });
      }
    } catch (err) {
      const errorMessage = "Network error while checking transaction status";
      setError(errorMessage);
      console.error("Chama transaction status network error:", err);
    } finally {
      setLoading(false);
    }
  }, [chamaId, transactionId, onStatusChange, onComplete, onFailed]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPolling(false);
    startTimeRef.current = null;
  }, []);

  const startPolling = useCallback(() => {
    if (!chamaId || !transactionId || !enabled) return;

    // Stop any existing polling
    stopPolling();

    setPolling(true);
    startTimeRef.current = Date.now();

    // Immediate check
    checkStatus();

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = startTimeRef.current ? now - startTimeRef.current : 0;

      // Stop polling if we've exceeded max duration
      if (elapsed > maxPollingDuration) {
        console.log(
          "Chama transaction polling stopped - max duration exceeded",
        );
        stopPolling();
        return;
      }

      // Stop polling if transaction is in a final state
      if (transaction && isChamaTransactionFinalState(transaction.status)) {
        console.log(
          "Chama transaction polling stopped - final state reached:",
          transaction.status,
        );
        stopPolling();
        return;
      }

      checkStatus();
    }, pollInterval);
  }, [
    chamaId,
    transactionId,
    enabled,
    checkStatus,
    stopPolling,
    pollInterval,
    maxPollingDuration,
    transaction,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Auto-start polling when enabled and IDs are provided
  useEffect(() => {
    if (enabled && chamaId && transactionId && !polling) {
      startPolling();
    } else if (!enabled && polling) {
      stopPolling();
    }
  }, [enabled, chamaId, transactionId, polling, startPolling, stopPolling]);

  return {
    transaction,
    loading,
    error,
    polling,
    startPolling,
    stopPolling,
    checkStatus,
  };
}

/**
 * Check if a chama transaction status represents a final state (no more updates expected)
 */
function isChamaTransactionFinalState(status: ChamaTxStatus): boolean {
  // Based on backend enum: COMPLETE = 3, FAILED = 2, REJECTED = 5
  return [2, 3, 5].includes(status);
}

/**
 * Check if a chama transaction status represents a processing state (updates expected)
 */
export function isChamaTransactionProcessing(status: ChamaTxStatus): boolean {
  // Based on backend enum: PENDING = 0, PROCESSING = 1, APPROVED = 4
  return [0, 1, 4].includes(status);
}

/**
 * Map chama transaction status to payment status for UI consistency
 */
export function mapChamaStatusToPaymentStatus(status: ChamaTxStatus): string {
  switch (status) {
    case 0: // PENDING
      return "pending";
    case 1: // PROCESSING
    case 4: // APPROVED
      return "processing";
    case 3: // COMPLETE
      return "completed";
    case 2: // FAILED
    case 5: // REJECTED
      return "failed";
    default:
      return "pending";
  }
}
