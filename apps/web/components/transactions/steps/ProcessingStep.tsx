/**
 * Processing Step Component
 * Shows transaction processing status with loading states
 * Displays Lightning QR code for Lightning deposits
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle as CheckCircleIcon,
  Warning as ExclamationTriangleIcon,
  Copy,
} from "@phosphor-icons/react";

import type { UnifiedTransaction } from "@bitsacco/core";
import { LightningQRCode } from "@/components/lightning-qr-code";
import { useTransactions } from "@/lib/transactions/unified/TransactionProvider";

// ============================================================================
// Types
// ============================================================================

export interface ProcessingStepProps {
  transaction?: UnifiedTransaction | null;
  onSuccess?: (transaction: UnifiedTransaction) => void;
  onClose: () => void;
  paymentMethod?: string;
  lightningInvoice?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ProcessingStep({
  transaction,
  onSuccess,
  onClose,
  paymentMethod,
  lightningInvoice,
}: ProcessingStepProps) {
  const { transactions, watchTransaction } = useTransactions();
  const [currentTransaction, setCurrentTransaction] = useState(transaction);

  // Watch for transaction updates using the new watching system
  useEffect(() => {
    if (!transaction?.id) return;

    // Set up transaction watching
    const unwatch = watchTransaction(
      transaction.id,
      transaction.context,
      (updatedTransaction) => {
        setCurrentTransaction(updatedTransaction);
      },
    );

    // Also check for immediate updates from global state
    const updated = transactions.find((tx) => tx.id === transaction.id);
    if (updated) {
      setCurrentTransaction(updated);
    }

    return unwatch;
  }, [transaction?.id, transaction?.context, watchTransaction, transactions]);

  // Handle successful completion
  useEffect(() => {
    if (currentTransaction?.status === "completed") {
      const timer = setTimeout(() => {
        onSuccess?.(currentTransaction);
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentTransaction, onSuccess, onClose]);

  const isCompleted = currentTransaction?.status === "completed";
  const isFailed = currentTransaction?.status === "failed";
  const isProcessing = currentTransaction?.status === "processing";

  // Check if this is a Lightning deposit using local context
  // For Lightning deposits, status might be "pending" waiting for payment
  const isLightningDepositAttempt =
    currentTransaction?.type === "deposit" &&
    paymentMethod === "lightning" &&
    (isProcessing || currentTransaction?.status === "pending");

  // Extract Lightning invoice from the properly typed FmLightning object
  const lightningInvoiceFromProps = lightningInvoice;
  const lightningInvoiceFromTransaction =
    currentTransaction?.metadata?.lightningInvoice?.invoice;

  const lightningInvoiceFromAnySource =
    lightningInvoiceFromProps || lightningInvoiceFromTransaction;

  const hasLightningInvoice = !!lightningInvoiceFromAnySource;
  const isLightningDeposit = isLightningDepositAttempt && hasLightningInvoice;

  // Handle Lightning deposit without invoice (graceful fallback)
  if (isLightningDepositAttempt && !hasLightningInvoice) {
    return (
      <div className="text-center space-y-6 animate-in fade-in-50 duration-500">
        <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 flex items-center justify-center shadow-lg">
          <ExclamationTriangleIcon size={36} className="text-yellow-400" />
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-xl text-gray-100">
            Generating Payment Invoice
          </h3>
          <p className="text-gray-400">
            Please wait a moment while we prepare your Lightning invoice.
          </p>
        </div>

        {currentTransaction && (
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status</span>
              <span className="text-yellow-400 capitalize">
                {currentTransaction.status.replace("_", " ")}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Lightning QR Code interface for Lightning deposits
  if (isLightningDeposit) {
    return (
      <div className="text-center space-y-6 animate-in fade-in-50 duration-500">
        {/* Header - Clean and simple */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-100">
            Scan to Pay with Lightning
          </h3>
          <p className="text-gray-400 text-sm">
            Use your Lightning wallet to complete the payment
          </p>
        </div>

        {/* Lightning QR Code - Prominent and clean */}
        <div className="space-y-4">
          <LightningQRCode
            invoice={lightningInvoiceFromAnySource!}
            showTitle={false}
            showInstructions={false}
            className="max-w-sm mx-auto"
          />
        </div>

        {/* Payment details */}
        {currentTransaction && (
          <div className="bg-slate-900/50 rounded-lg p-4 space-y-3 text-left">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount</span>
              <span className="text-xl font-semibold text-gray-100">
                Ksh {currentTransaction.amount.value.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Payment Method</span>
              <span className="text-gray-100 font-medium">Lightning</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Date</span>
              <span className="text-gray-100 font-medium">
                {new Date().toLocaleDateString()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Transaction ID</span>
              <div className="flex items-center gap-2">
                <span className="text-gray-100 font-medium font-mono text-sm">
                  {currentTransaction.id.slice(-8)}...
                </span>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(currentTransaction.id)
                  }
                  className="p-1 text-gray-400 hover:text-gray-200 transition-colors duration-200 rounded"
                  title="Copy full transaction ID"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default processing UI for non-Lightning transactions
  return (
    <div
      className={`text-center space-y-6 animate-in fade-in-50 duration-500 ${isCompleted ? "animate-in zoom-in-95" : ""}`}
    >
      <div
        className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg relative ${
          isCompleted
            ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 shadow-green-500/20"
            : isFailed
              ? "bg-gradient-to-br from-red-500/20 to-rose-500/20 border border-red-500/30 shadow-red-500/20"
              : "bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-blue-500/30 shadow-blue-500/20"
        }`}
      >
        {isCompleted ? (
          <>
            <CheckCircleIcon size={36} className="text-green-400" />
            {/* Success pulse */}
            <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping" />
          </>
        ) : isFailed ? (
          <ExclamationTriangleIcon size={36} className="text-red-400" />
        ) : (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent" />
            {/* Processing pulse */}
            <div className="absolute inset-0 rounded-full border-2 border-teal-500/20 animate-ping" />
          </>
        )}
      </div>

      <div className="space-y-3">
        <h3
          className={`font-semibold text-xl transition-colors duration-300 ${
            isCompleted
              ? "text-green-400"
              : isFailed
                ? "text-red-400"
                : "text-gray-100"
          }`}
        >
          {isCompleted
            ? "Transaction Completed!"
            : isFailed
              ? "Transaction Failed"
              : "Processing Transaction"}
        </h3>
        <p className="text-gray-400">
          {isCompleted
            ? "Your transaction has been completed successfully."
            : isFailed
              ? "Your transaction could not be processed. Please try again."
              : "This may take a few moments."}
        </p>
      </div>

      {/* Simplified transaction details */}
      {currentTransaction && (
        <div className="bg-slate-900/50 rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Amount</span>
              <span className="font-semibold text-teal-400">
                {currentTransaction.amount.value}{" "}
                {currentTransaction.amount.currency}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Status</span>
              <span
                className={`capitalize ${
                  isCompleted
                    ? "text-green-400"
                    : isFailed
                      ? "text-red-400"
                      : "text-blue-400"
                }`}
              >
                {currentTransaction.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
