"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import QRCode from "qrcode";
import { Button } from "@bitsacco/ui";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CopyIcon,
  CheckIcon,
} from "@phosphor-icons/react";

interface LightningPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: string;
  amount: number;
  transactionId?: string;
  status?: "pending" | "processing" | "completed" | "failed";
  onPaymentComplete?: () => void;
  currency?: string;
}

export function LightningPaymentModal({
  isOpen,
  onClose,
  invoice,
  amount,
  transactionId,
  status = "processing",
  onPaymentComplete,
  currency = "KES",
}: LightningPaymentModalProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState<string>("");

  // Generate QR code when invoice changes
  useEffect(() => {
    if (!invoice) return;

    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(invoice.toUpperCase(), {
          width: 256,
          margin: 2,
          color: {
            dark: "#1f2937",
            light: "#ffffff",
          },
          errorCorrectionLevel: "M",
        });
        setQrCodeDataUrl(url);
        setQrError("");
      } catch (err) {
        console.error("Failed to generate QR code:", err);
        setQrError("Failed to generate QR code");
      }
    };

    generateQRCode();
  }, [invoice]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: currency,
    }).format(amount);
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
          message: "Your payment has been completed successfully.",
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
          message:
            "Your payment is being processed. This may take a few minutes.",
        };
    }
  };

  const copyInvoice = async () => {
    try {
      await navigator.clipboard.writeText(invoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy invoice:", err);
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

        {/* Lightning QR Code - Only show during pending/processing states */}
        {invoice && (status === "pending" || status === "processing") && (
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-100 mb-4 text-center">
              Scan to Pay with Lightning
            </h4>

            {qrError ? (
              <div className="flex items-center justify-center p-8 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{qrError}</p>
              </div>
            ) : !qrCodeDataUrl ? (
              <div className="flex items-center justify-center p-8 bg-slate-900/50 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* QR Code */}
                <div
                  className="mx-auto p-4 bg-white rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={copyInvoice}
                  style={{ width: "fit-content" }}
                >
                  <Image
                    src={qrCodeDataUrl}
                    alt="Lightning Invoice QR Code"
                    width={200}
                    height={200}
                    className="block"
                    unoptimized
                  />
                </div>

                {/* Copy Button */}
                <button
                  onClick={copyInvoice}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-300 hover:bg-slate-800 hover:text-teal-400 transition-all"
                >
                  {copied ? (
                    <>
                      <CheckIcon size={20} className="text-green-400" />
                      <span className="text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon size={20} />
                      <span>Click to copy invoice</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm text-center">
                Scan the QR code with your Lightning wallet to complete the
                payment
              </p>
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
              <span className="text-gray-300">Lightning</span>
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
              Copied to clipboard!
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
