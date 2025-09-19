"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  ArrowClockwiseIcon,
  WarningIcon,
  ClockIcon,
  XCircleIcon,
  LightningIcon,
  DeviceMobileIcon,
  type IconWeight,
} from "@phosphor-icons/react";
import type { PaymentIntent, PaymentMethod } from "@bitsacco/core";

interface PaymentRetryModalProps {
  isOpen: boolean;
  onClose: () => void;
  failedPayment: PaymentIntent | null;
  onRetry: (
    paymentIntentId: string,
    newPaymentMethod?: PaymentMethod,
  ) => Promise<void>;
}

interface RetryOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{
    size?: number;
    className?: string;
    weight?: IconWeight;
  }>;
  recommended?: boolean;
}

export function PaymentRetryModal({
  isOpen,
  onClose,
  failedPayment,
  onRetry,
}: PaymentRetryModalProps) {
  const [selectedRetryOption, setSelectedRetryOption] =
    useState<string>("same");
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const retryOptions: RetryOption[] = [
    {
      id: "same",
      title: "Retry Same Method",
      description: `Try ${failedPayment?.method.replace("_", " ")} again`,
      icon:
        failedPayment?.method === "mpesa" ? DeviceMobileIcon : LightningIcon,
      recommended: true,
    },
    {
      id: "mpesa",
      title: "Switch to M-Pesa",
      description: "Use M-Pesa mobile money instead",
      icon: DeviceMobileIcon,
    },
    {
      id: "lightning",
      title: "Switch to Lightning",
      description: "Use Bitcoin Lightning payment",
      icon: LightningIcon,
    },
  ].filter((option) => {
    // Don't show current method as alternative
    if (option.id !== "same" && option.id === failedPayment?.method) {
      return false;
    }
    return true;
  });

  const handleRetry = async () => {
    if (!failedPayment) return;

    setIsRetrying(true);
    setRetryError(null);

    try {
      const newPaymentMethod =
        selectedRetryOption === "same"
          ? undefined
          : (selectedRetryOption as PaymentMethod);

      await onRetry(failedPayment.id, newPaymentMethod);
      onClose();
    } catch (error) {
      setRetryError(
        error instanceof Error ? error.message : "Failed to retry payment",
      );
    } finally {
      setIsRetrying(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const getFailureReason = (payment: PaymentIntent | null) => {
    if (!payment || !payment.metadata?.errorCode) {
      return "The payment could not be processed. This could be due to insufficient funds, network issues, or temporary service unavailability.";
    }

    switch (payment.metadata.errorCode) {
      case "INSUFFICIENT_FUNDS":
        return "Insufficient funds in your account. Please ensure you have enough balance and try again.";
      case "NETWORK_ERROR":
        return "Network connection issue. Please check your internet connection and try again.";
      case "SERVICE_UNAVAILABLE":
        return "Payment service is temporarily unavailable. Please try again in a few minutes.";
      case "INVALID_PHONE":
        return "Invalid phone number. Please verify your M-Pesa number and try again.";
      case "TRANSACTION_TIMEOUT":
        return "Transaction timed out. Please try again.";
      default:
        return "The payment could not be processed. Please try again or use a different payment method.";
    }
  };

  if (!isOpen || !failedPayment) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500/30 mb-4">
            <XCircleIcon size={32} className="text-red-400" weight="fill" />
          </div>
          <h3 className="text-xl font-bold text-gray-100 mb-2">
            Payment Failed
          </h3>
          <p className="text-gray-400 text-sm">
            {getFailureReason(failedPayment)}
          </p>
        </div>

        {/* Payment Details */}
        <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Amount</span>
            <span className="text-gray-100 font-semibold">
              {formatCurrency(failedPayment.amount)}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Original Method</span>
            <span className="text-gray-300 capitalize">
              {failedPayment.method.replace("_", " ")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Failed At</span>
            <span className="text-gray-300">
              {new Date(failedPayment.updatedAt).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Retry Options */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-100 mb-4">
            Choose Retry Option
          </h4>
          <div className="space-y-3">
            {retryOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRetryOption === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedRetryOption(option.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    isSelected
                      ? "border-teal-500 bg-teal-500/10"
                      : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      size={24}
                      className={isSelected ? "text-teal-400" : "text-gray-400"}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-medium ${isSelected ? "text-teal-300" : "text-gray-300"}`}
                        >
                          {option.title}
                        </span>
                        {option.recommended && (
                          <span className="px-2 py-1 bg-teal-500/20 text-teal-300 text-xs rounded-full">
                            Recommended
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Display */}
        {retryError && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <WarningIcon size={16} />
              {retryError}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            fullWidth
            onClick={onClose}
            disabled={isRetrying}
            className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all"
          >
            Cancel
          </Button>
          <Button
            variant="tealPrimary"
            fullWidth
            onClick={handleRetry}
            disabled={isRetrying}
            className="shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            {isRetrying ? (
              <>
                <ClockIcon size={16} className="animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <ArrowClockwiseIcon size={16} />
                Retry Payment
              </>
            )}
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            If you continue to experience issues, please contact support
          </p>
        </div>
      </div>
    </div>
  );
}
