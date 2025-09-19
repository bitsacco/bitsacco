"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { PaymentIntent, PaymentStatus } from "@bitsacco/core";

interface UsePaymentStatusOptions {
  paymentIntentId: string | null;
  enabled?: boolean;
  pollInterval?: number;
  maxPollingDuration?: number;
  onStatusChange?: (status: PaymentStatus) => void;
  onComplete?: (payment: PaymentIntent) => void;
  onFailed?: (payment: PaymentIntent) => void;
}

interface PaymentStatusData {
  payment: PaymentIntent | null;
  loading: boolean;
  error: string | null;
  polling: boolean;
}

export function usePaymentStatus({
  paymentIntentId,
  enabled = true,
  pollInterval = 3000, // Poll every 3 seconds
  maxPollingDuration = 300000, // Stop polling after 5 minutes
  onStatusChange,
  onComplete,
  onFailed,
}: UsePaymentStatusOptions): PaymentStatusData & {
  startPolling: () => void;
  stopPolling: () => void;
  checkStatus: () => Promise<void>;
} {
  const [payment, setPayment] = useState<PaymentIntent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const previousStatusRef = useRef<PaymentStatus | null>(null);

  const checkStatus = useCallback(async () => {
    if (!paymentIntentId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/membership/payments/status?paymentIntentId=${encodeURIComponent(paymentIntentId)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        const paymentData = data.data as PaymentIntent;
        setPayment(paymentData);

        // Check if status changed
        const currentStatus = paymentData.status;
        if (previousStatusRef.current !== currentStatus) {
          previousStatusRef.current = currentStatus;
          onStatusChange?.(currentStatus);

          // Handle final states
          if (currentStatus === "completed") {
            onComplete?.(paymentData);
          } else if (
            currentStatus === "failed" ||
            currentStatus === "cancelled" ||
            currentStatus === "expired"
          ) {
            onFailed?.(paymentData);
          }
        }
      } else {
        // Handle specific API error codes
        let errorMessage = data.error || "Failed to check payment status";

        if (data.code) {
          switch (data.code) {
            case "PAYMENT_NOT_FOUND":
              errorMessage = "Payment not found or has expired";
              break;
            case "SERVICE_UNAVAILABLE":
              errorMessage = "Payment service temporarily unavailable";
              break;
            case "BACKEND_ERROR":
              errorMessage = "Backend service error - please try again";
              break;
            case "INTERNAL_ERROR":
              errorMessage = "System error - please try again later";
              break;
            default:
              errorMessage = data.error || "Unknown error occurred";
          }
        }

        setError(errorMessage);
        console.error("Payment status check failed:", {
          code: data.code,
          error: data.error,
          status: response.status,
        });
      }
    } catch (err) {
      const errorMessage = "Network error while checking payment status";
      setError(errorMessage);
      console.error("Payment status network error:", err);
    } finally {
      setLoading(false);
    }
  }, [paymentIntentId, onStatusChange, onComplete, onFailed]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPolling(false);
    startTimeRef.current = null;
  }, []);

  const startPolling = useCallback(() => {
    if (!paymentIntentId || !enabled) return;

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
        console.log("Payment status polling stopped - max duration exceeded");
        stopPolling();
        return;
      }

      // Stop polling if payment is in a final state
      if (payment && isPaymentFinalState(payment.status)) {
        console.log(
          "Payment status polling stopped - final state reached:",
          payment.status,
        );
        stopPolling();
        return;
      }

      checkStatus();
    }, pollInterval);
  }, [
    paymentIntentId,
    enabled,
    checkStatus,
    stopPolling,
    pollInterval,
    maxPollingDuration,
    payment,
  ]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Auto-start polling when enabled and paymentIntentId is provided
  useEffect(() => {
    if (enabled && paymentIntentId && !polling) {
      startPolling();
    } else if (!enabled && polling) {
      stopPolling();
    }
  }, [enabled, paymentIntentId, polling, startPolling, stopPolling]);

  return {
    payment,
    loading,
    error,
    polling,
    startPolling,
    stopPolling,
    checkStatus,
  };
}

/**
 * Check if a payment status represents a final state (no more updates expected)
 */
function isPaymentFinalState(status: PaymentStatus): boolean {
  return ["completed", "failed", "cancelled", "expired"].includes(status);
}

/**
 * Check if a payment status represents a processing state (updates expected)
 */
export function isPaymentProcessing(status: PaymentStatus): boolean {
  return ["pending", "processing"].includes(status);
}
