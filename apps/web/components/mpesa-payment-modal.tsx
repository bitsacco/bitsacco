"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CopyIcon,
  DeviceMobileIcon,
  InfoIcon,
} from "@phosphor-icons/react";

interface MpesaPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  phoneNumber: string;
  transactionId?: string;
  status?: "pending" | "processing" | "completed" | "failed";
  onPaymentComplete?: () => void;
  currency?: string;
}

export function MpesaPaymentModal({
  isOpen,
  onClose,
  amount,
  phoneNumber,
  transactionId,
  status = "processing",
  onPaymentComplete,
  currency = "KES",
}: MpesaPaymentModalProps) {
  const [copied, setCopied] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatPhoneNumber = (phone: string) => {
    // Format as +254 7XX XXX XXX
    if (phone.startsWith("254") && phone.length >= 12) {
      return `+${phone.slice(0, 3)} ${phone.slice(3, 6)} ${phone.slice(6, 9)} ${phone.slice(9)}`;
    }
    return phone;
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircleIcon,
          color: "text-green-400",
          bgColor: "bg-green-500/20",
          borderColor: "border-green-500/30",
          title: "Payment Successful!",
          message: "Your M-Pesa payment has been completed successfully.",
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
      case "pending":
      case "processing":
      default:
        return {
          icon: ClockIcon,
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/20",
          borderColor: "border-yellow-500/30",
          title: "Payment Processing",
          message: "Check your phone for the M-Pesa prompt and enter your PIN.",
        };
    }
  };

  const copyTransactionId = async () => {
    if (transactionId) {
      try {
        await navigator.clipboard.writeText(transactionId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error("Failed to copy transaction ID:", error);
      }
    }
  };

  if (!isOpen) return null;

  const statusConfig = getStatusConfig(status);
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

        {/* M-Pesa Instructions - Only show during pending/processing states */}
        {(status === "pending" || status === "processing") && (
          <div className="mb-8">
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <DeviceMobileIcon size={32} className="text-green-400" />
                </div>
              </div>

              <h4 className="text-lg font-medium text-gray-100 mb-4 text-center">
                Check Your Phone
              </h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">1</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    An M-Pesa prompt has been sent to{" "}
                    <span className="font-mono text-green-400">
                      {formatPhoneNumber(phoneNumber)}
                    </span>
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">2</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Enter your M-Pesa PIN to confirm the payment
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-400 text-xs font-bold">3</span>
                  </div>
                  <p className="text-sm text-gray-300">
                    Your deposit will be credited automatically once confirmed
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-green-500/20">
                <p className="text-xs text-green-400 text-center">
                  This prompt will expire in 60 seconds
                </p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <InfoIcon
                  size={16}
                  className="text-blue-400 mt-0.5 flex-shrink-0"
                />
                <p className="text-blue-400 text-xs">
                  If you don&apos;t receive the prompt, check if your phone
                  number is registered with M-Pesa
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Details */}
        <div className="space-y-4 mb-8">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Amount</span>
              <span className="text-xl font-bold text-gray-100">
                {formatCurrency(amount)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Payment Method</span>
              <span className="text-gray-300">M-Pesa</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Phone Number</span>
              <span className="text-gray-300 font-mono text-sm">
                {formatPhoneNumber(phoneNumber)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400">Date</span>
              <span className="text-gray-300">
                {new Date().toLocaleDateString()}
              </span>
            </div>
            {transactionId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Transaction ID</span>
                <button
                  onClick={copyTransactionId}
                  className="flex items-center gap-2 text-gray-300 hover:text-teal-400 transition-colors text-sm"
                >
                  <span className="font-mono text-xs">
                    {transactionId.substring(0, 8)}...
                  </span>
                  <CopyIcon size={14} />
                </button>
              </div>
            )}
          </div>

          {copied && (
            <div className="text-center text-sm text-green-400">
              Transaction ID copied to clipboard!
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {status === "completed" && (
            <Button
              variant="tealPrimary"
              fullWidth
              onClick={() => {
                onPaymentComplete?.();
                onClose();
              }}
              className="shadow-lg shadow-teal-500/20"
            >
              Done
            </Button>
          )}

          {status === "failed" && (
            <Button
              variant="tealPrimary"
              fullWidth
              onClick={onClose}
              className="shadow-lg shadow-teal-500/20"
            >
              Try Again
            </Button>
          )}

          {(status === "pending" || status === "processing") && (
            <Button
              variant="outline"
              fullWidth
              onClick={onClose}
              className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
