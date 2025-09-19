"use client";

import { useState, useEffect } from "react";
import { Button } from "@bitsacco/ui";
import {
  CheckCircleIcon,
  ShareIcon,
  ClockIcon,
  XCircleIcon,
  ArrowLeftIcon,
  CopyIcon,
} from "@phosphor-icons/react";
import type {
  PaymentConfirmation,
  PaymentStatus,
  PaymentIntent,
  PaymentMethod,
  PaymentMethodDetails,
} from "@bitsacco/core";
import {
  usePaymentStatus,
  isPaymentProcessing,
} from "@/hooks/use-payment-status";
import {
  useChamaTransactionStatus,
  mapChamaStatusToPaymentStatus,
} from "@/hooks/use-chama-transaction-status";
import { LightningQRCode } from "./lightning-qr-code";

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentConfirmation | null;
  onRetry?: () => void;
  enableRealTimeUpdates?: boolean;
  onPaymentComplete?: (payment: PaymentIntent) => void;
}

export function PaymentConfirmationModal({
  isOpen,
  onClose,
  payment,
  onRetry,
  enableRealTimeUpdates = true,
  onPaymentComplete,
}: PaymentConfirmationModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentPaymentStatus, setCurrentPaymentStatus] =
    useState<PaymentStatus | null>(payment?.status || null);
  const [lightningInvoice, setLightningInvoice] = useState<string>("");

  // Determine if this is a chama transaction (has chama-specific fields)
  const isChamaTransaction = Boolean(
    payment?.chamaId && payment?.sharesSubscriptionTracker,
  );

  // Real-time status polling for processing payments
  const shouldPoll = Boolean(
    enableRealTimeUpdates &&
      payment &&
      isPaymentProcessing(currentPaymentStatus || payment.status),
  );

  // Use chama transaction status monitoring for share purchases
  const { error: chamaStatusError } = useChamaTransactionStatus({
    chamaId: isChamaTransaction ? payment?.chamaId || null : null,
    transactionId: isChamaTransaction
      ? payment?.transactionHash || payment?.paymentId || null
      : null,
    enabled: isChamaTransaction && shouldPoll,
    onStatusChange: (status, transaction) => {
      console.log("[PaymentConfirmationModal] Chama status change:", {
        status,
        hasTransaction: !!transaction,
        hasLightning: !!transaction?.lightning,
        hasBolt11: !!transaction?.lightning?.bolt11,
        hasPaymentRequest: !!transaction?.lightning?.bolt11?.paymentRequest,
        paymentMethod: payment?.method,
      });
      const mappedStatus = mapChamaStatusToPaymentStatus(
        status,
      ) as PaymentStatus;
      setCurrentPaymentStatus(mappedStatus);
      // Extract Lightning invoice if available and payment method is Lightning
      if (payment?.method === "lightning") {
        let invoice = null;

        // Check if lightning.invoice exists (correct field path)
        if (transaction?.lightning?.bolt11) {
          invoice = transaction.lightning.bolt11.paymentRequest;
        }

        if (invoice && invoice !== lightningInvoice) {
          console.log(
            "[PaymentConfirmationModal] Setting Lightning invoice from status change:",
            {
              invoiceLength: invoice.length,
              firstChars: invoice.substring(0, 20),
            },
          );
          console.log("[PaymentConfirmationModal] FULL INVOICE:", invoice);
          console.log(
            "[PaymentConfirmationModal] FULL TRANSACTION IN STATUS CHANGE:",
            transaction,
          );
          setLightningInvoice(invoice);
        } else if (!invoice) {
          console.log(
            "[PaymentConfirmationModal] No Lightning invoice found in transaction:",
            {
              transaction,
              lightning: transaction?.lightning,
              typeof_lightning: typeof transaction?.lightning,
            },
          );
        }
      }
    },
    onComplete: (completedTransaction) => {
      setCurrentPaymentStatus("completed" as PaymentStatus);
      // Extract Lightning invoice if available
      if (completedTransaction.lightning?.bolt11?.paymentRequest) {
        setLightningInvoice(
          completedTransaction.lightning.bolt11.paymentRequest,
        );
      }
      // Create a mock PaymentIntent for compatibility
      const mockPaymentIntent: PaymentIntent = {
        id: completedTransaction.id,
        amount: payment?.amount || 0,
        currency: payment?.currency || "KES",
        method: payment?.method || ("mpesa" as PaymentMethod),
        status: "completed" as PaymentStatus,
        details: {} as PaymentMethodDetails,
        createdAt: completedTransaction.createdAt,
        updatedAt:
          completedTransaction.updatedAt || completedTransaction.createdAt,
      };
      onPaymentComplete?.(mockPaymentIntent);
    },
    onFailed: () => {
      setCurrentPaymentStatus("failed" as PaymentStatus);
    },
  });

  // Use legacy payment status monitoring for non-chama transactions
  const { error: legacyStatusError } = usePaymentStatus({
    paymentIntentId: !isChamaTransaction ? payment?.paymentId || null : null,
    enabled: !isChamaTransaction && shouldPoll,
    onStatusChange: (status) => {
      setCurrentPaymentStatus(status);
    },
    onComplete: (completedPayment) => {
      setCurrentPaymentStatus("completed" as PaymentStatus);
      onPaymentComplete?.(completedPayment);
    },
    onFailed: (failedPayment) => {
      setCurrentPaymentStatus(failedPayment.status);
    },
  });

  // Combine status from both monitoring systems
  const statusError = isChamaTransaction ? chamaStatusError : legacyStatusError;

  // Update current status when payment prop changes
  useEffect(() => {
    if (payment) {
      console.log("[PaymentConfirmationModal] Payment data:", {
        method: payment.method,
        hasLightningInvoice: !!payment.lightningInvoice,
        lightningInvoice: payment.lightningInvoice,
        chamaId: payment.chamaId,
        sharesSubscriptionTracker: payment.sharesSubscriptionTracker,
      });
      setCurrentPaymentStatus(payment.status);
      // Initialize Lightning invoice if available
      if (payment.method === "lightning" && payment.lightningInvoice) {
        setLightningInvoice(payment.lightningInvoice);
      }
    }
  }, [payment]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const getStatusConfig = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircleIcon,
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          borderColor: "border-green-500/30",
          title: "Payment Successful!",
          message: "Your share purchase has been completed successfully.",
        };
      case "pending":
      case "processing":
        return {
          icon: ClockIcon,
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/20",
          borderColor: "border-yellow-500/30",
          title: "Payment Processing",
          message:
            "Your payment is being processed. This may take a few minutes.",
        };
      case "failed":
        return {
          icon: XCircleIcon,
          color: "text-red-400",
          bgColor: "bg-red-500/20",
          borderColor: "border-red-500/30",
          title: "Payment Failed",
          message: "Your payment could not be processed. Please try again.",
        };
      case "cancelled":
        return {
          icon: XCircleIcon,
          color: "text-gray-400",
          bgColor: "bg-gray-500/20",
          borderColor: "border-gray-500/30",
          title: "Payment Cancelled",
          message: "Your payment was cancelled.",
        };
      default:
        return {
          icon: ClockIcon,
          color: "text-gray-400",
          bgColor: "bg-gray-500/20",
          borderColor: "border-gray-500/30",
          title: "Payment Status Unknown",
          message: "Please check your transaction status.",
        };
    }
  };

  const copyTransactionId = async () => {
    const transactionId = payment?.transactionHash || payment?.transactionId;
    if (transactionId) {
      try {
        await navigator.clipboard.writeText(transactionId);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (error) {
        console.error("Failed to copy transaction ID:", error);
      }
    }
  };

  if (!isOpen || !payment) return null;

  // Use current status for display, with fallback to original payment status
  const displayStatus = currentPaymentStatus || payment.status;
  const statusConfig = getStatusConfig(displayStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${statusConfig.bgColor} ${statusConfig.borderColor} border-2 mb-4`}
          >
            <StatusIcon
              size={40}
              className={statusConfig.color}
              weight="fill"
            />
          </div>
          <h3 className="text-2xl font-bold text-gray-100 mb-2">
            {statusConfig.title}
          </h3>
          <p className="text-gray-400">{statusConfig.message}</p>
        </div>

        {/* Lightning QR Code - Only show during pending/processing states */}
        {payment?.method === "lightning" &&
          lightningInvoice &&
          (displayStatus === "pending" || displayStatus === "processing") && (
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-100 mb-4 text-center">
                Scan to Pay with Lightning
              </h4>
              <LightningQRCode invoice={lightningInvoice} size={200} />
              <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-400 text-sm text-center">
                  Scan the QR code with your Lightning wallet to complete the
                  payment
                </p>
              </div>
            </div>
          )}

        {/* Lightning invoice loading state */}
        {payment?.method === "lightning" &&
          !lightningInvoice &&
          (displayStatus === "pending" || displayStatus === "processing") && (
            <div className="mb-8">
              <h4 className="text-lg font-medium text-gray-100 mb-4 text-center">
                Generating Lightning Invoice...
              </h4>
              <div className="flex flex-col items-center justify-center p-8 bg-slate-900/50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
                <p className="text-gray-400 text-sm text-center">
                  Please wait while we generate your Lightning invoice
                </p>
                <p className="text-gray-500 text-xs text-center mt-2">
                  This may take a few seconds...
                </p>
              </div>
            </div>
          )}

        {/* Payment Details - Simplified */}
        <div className="space-y-4 mb-8">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Amount</span>
              <span className="text-xl font-bold text-gray-100">
                {formatCurrency(payment.amount)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Payment Method</span>
              <span className="text-gray-300 capitalize">
                {payment.method.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Date</span>
              <span className="text-gray-300">
                {new Date(payment.createdAt).toLocaleDateString()}
              </span>
            </div>
            {(payment?.transactionHash || payment?.transactionId) && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Transaction ID</span>
                <button
                  onClick={copyTransactionId}
                  className="flex items-center gap-2 text-gray-300 hover:text-teal-400 transition-colors text-sm"
                >
                  <span className="font-mono text-xs">
                    {(
                      payment.transactionHash || payment.transactionId
                    )?.substring(0, 8)}
                    ...
                  </span>
                  <CopyIcon size={14} />
                </button>
              </div>
            )}
          </div>

          {copySuccess && (
            <div className="text-center text-sm text-green-400">
              Transaction ID copied to clipboard!
            </div>
          )}

          {statusError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-red-400">
                <XCircleIcon size={16} />
                Failed to check status
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {displayStatus === "completed" && (
            <>
              <Button
                variant="tealPrimary"
                fullWidth
                onClick={onClose}
                className="shadow-lg shadow-teal-500/20"
              >
                Done
              </Button>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  // Share functionality can be implemented later
                  if (navigator.share) {
                    navigator.share({
                      title: "Share Purchase Confirmation",
                      text: `Successfully purchased shares for ${formatCurrency(payment.amount)}`,
                    });
                  }
                }}
                className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <ShareIcon size={16} />
                Share
              </Button>
            </>
          )}

          {displayStatus === "failed" && onRetry && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                fullWidth
                onClick={onClose}
                className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeftIcon size={16} />
                Back
              </Button>
              <Button
                variant="tealPrimary"
                fullWidth
                onClick={onRetry}
                className="shadow-lg shadow-teal-500/20"
              >
                Try Again
              </Button>
            </div>
          )}

          {(displayStatus === "pending" || displayStatus === "processing") && (
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
              className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all"
            >
              Close
            </Button>
          )}

          {displayStatus === "cancelled" && (
            <Button
              variant="tealPrimary"
              fullWidth
              onClick={onClose}
              className="shadow-lg shadow-teal-500/20"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
