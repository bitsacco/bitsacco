"use client";

import { useState, useCallback } from "react";
import type { WalletTransaction } from "@/lib/types/savings";

export interface PaymentStatus {
  transactionId: string;
  status: "pending" | "processing" | "completed" | "failed";
  message?: string;
}

export interface UsePaymentReturn {
  isPolling: boolean;
  paymentStatus: PaymentStatus | null;
  startPolling: (transactionId: string, maxAttempts?: number) => Promise<void>;
  stopPolling: () => void;
  resetStatus: () => void;
}

export function usePayment(): UsePaymentReturn {
  const [isPolling, setIsPolling] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null,
  );
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  const stopPolling = useCallback(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setIsPolling(false);
  }, [pollingInterval]);

  const startPolling = useCallback(
    async (
      transactionId: string,
      maxAttempts = 60, // 5 minutes with 5-second intervals
    ): Promise<void> => {
      setIsPolling(true);
      setPaymentStatus({
        transactionId,
        status: "pending",
        message: "Waiting for payment confirmation...",
      });

      let attempts = 0;

      const poll = async (): Promise<void> => {
        try {
          const response = await fetch(
            `/api/savings/transactions/${transactionId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            },
          );

          if (!response.ok) {
            throw new Error("Failed to fetch transaction status");
          }

          const transaction: WalletTransaction = await response.json();

          setPaymentStatus({
            transactionId,
            status: transaction.status,
            message: getStatusMessage(transaction.status, transaction.type),
          });

          // Stop polling if transaction is completed or failed
          if (
            transaction.status === "completed" ||
            transaction.status === "failed"
          ) {
            stopPolling();
            return;
          }

          attempts++;

          // Stop polling if max attempts reached
          if (attempts >= maxAttempts) {
            setPaymentStatus({
              transactionId,
              status: "pending",
              message:
                "Transaction is taking longer than expected. Please check back later.",
            });
            stopPolling();
            return;
          }

          // Continue polling
          const interval = setTimeout(poll, 5000); // Poll every 5 seconds
          setPollingInterval(interval);
        } catch (error) {
          console.error("Error polling transaction status:", error);
          setPaymentStatus({
            transactionId,
            status: "failed",
            message: "Failed to check payment status. Please try again.",
          });
          stopPolling();
        }
      };

      // Start polling immediately
      await poll();
    },
    [stopPolling],
  );

  const resetStatus = useCallback(() => {
    setPaymentStatus(null);
    stopPolling();
  }, [stopPolling]);

  return {
    isPolling,
    paymentStatus,
    startPolling,
    stopPolling,
    resetStatus,
  };
}

function getStatusMessage(
  status: string,
  type: "deposit" | "withdraw",
): string {
  const action = type === "deposit" ? "deposit" : "withdrawal";

  switch (status) {
    case "pending":
      return type === "deposit"
        ? "Waiting for payment confirmation..."
        : "Withdrawal request submitted...";
    case "processing":
      return `Processing ${action}...`;
    case "completed":
      return `${action.charAt(0).toUpperCase() + action.slice(1)} completed successfully!`;
    case "failed":
      return `${action.charAt(0).toUpperCase() + action.slice(1)} failed. Please try again.`;
    default:
      return `${action.charAt(0).toUpperCase() + action.slice(1)} status: ${status}`;
  }
}
