"use client";

import { useState, useCallback } from "react";
import type { WalletTransaction } from "@bitsacco/core";
import {
  PersonalTransactionType,
  PersonalTransactionStatus,
} from "@bitsacco/core";

export interface PaymentStatus {
  transactionId: string;
  status: WalletTransaction["status"];
  message?: string;
}

export interface UsePaymentReturn {
  isPolling: boolean;
  paymentStatus: PaymentStatus | null;
  startPolling: (transactionId: string, maxAttempts?: number) => Promise<void>;
  stopPolling: () => void;
  resetStatus: () => void;
}

export function usePayment(
  onTransactionComplete?: () => void,
): UsePaymentReturn {
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
        status: PersonalTransactionStatus.PENDING,
        message: "Waiting for payment confirmation...",
      });

      let attempts = 0;

      const poll = async (): Promise<void> => {
        try {
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
            transaction.status === PersonalTransactionStatus.COMPLETE ||
            transaction.status === PersonalTransactionStatus.FAILED
          ) {
            // Call refresh callback when transaction completes
            if (
              transaction.status === PersonalTransactionStatus.COMPLETE &&
              onTransactionComplete
            ) {
              onTransactionComplete();
            }
            stopPolling();
            return;
          }

          attempts++;

          // Stop polling if max attempts reached
          if (attempts >= maxAttempts) {
            setPaymentStatus({
              transactionId,
              status: PersonalTransactionStatus.PENDING,
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
            status: PersonalTransactionStatus.FAILED,
            message: "Failed to check payment status. Please try again.",
          });
          stopPolling();
        }
      };

      // Start polling immediately
      await poll();
    },
    [stopPolling, onTransactionComplete],
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
  status: PersonalTransactionStatus,
  type: PersonalTransactionType,
): string {
  const action =
    type === PersonalTransactionType.DEPOSIT
      ? "deposit"
      : type === PersonalTransactionType.WITHDRAW
        ? "withdrawal"
        : type === PersonalTransactionType.WALLET_CREATION
          ? "wallet creation"
          : "transaction";

  switch (status) {
    case PersonalTransactionStatus.PENDING:
      return type === PersonalTransactionType.DEPOSIT
        ? "Waiting for payment confirmation..."
        : type === PersonalTransactionType.WITHDRAW
          ? "Withdrawal request submitted..."
          : "Transaction pending...";
    case PersonalTransactionStatus.PROCESSING:
      return `Processing ${action}...`;
    case PersonalTransactionStatus.COMPLETE:
      return `${action.charAt(0).toUpperCase() + action.slice(1)} completed successfully!`;
    case PersonalTransactionStatus.FAILED:
      return `${action.charAt(0).toUpperCase() + action.slice(1)} failed. Please try again.`;
    case PersonalTransactionStatus.MANUAL_REVIEW:
      return `${action.charAt(0).toUpperCase() + action.slice(1)} is under manual review...`;
    case PersonalTransactionStatus.UNRECOGNIZED:
    default:
      return `${action.charAt(0).toUpperCase() + action.slice(1)} status unknown`;
  }
}
