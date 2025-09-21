"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@bitsacco/ui";
import {
  LightningIcon,
  CurrencyCircleDollarIcon,
  CopyIcon,
  CheckIcon,
  QrCodeIcon,
  InfoIcon,
} from "@phosphor-icons/react";
import type { PersonalWallet, DepositRequest } from "@/lib/types/savings";
import { useTransactions } from "@/hooks/savings/use-transactions";
import { usePayment } from "@/hooks/savings/use-payment";
import { formatAmountInput } from "@/lib/utils/format";
import { validateAmount } from "@/lib/utils/calculations";

interface LightningDepositFormProps {
  wallet?: PersonalWallet;
  wallets?: PersonalWallet[];
  depositTarget: "automatic" | string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function LightningDepositForm({
  // wallet,
  wallets = [],
  depositTarget,
  // onSuccess,
  onError,
}: LightningDepositFormProps) {
  const { initiateDeposit } = useTransactions();
  const { startPolling } = usePayment();
  const [amount, setAmount] = useState("");
  const [invoice, setInvoice] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value);
    setAmount(formatted);

    // Clear amount error when user types
    if (amountError) {
      setAmountError(null);
    }
  };

  const generateInvoice = async () => {
    // Validate amount
    const amountNum = parseFloat(amount);
    const validation = validateAmount(amountNum, 10, 100000);
    if (!validation.isValid) {
      setAmountError(validation.error!);
      return;
    }

    setLoading(true);
    onError(""); // Clear any previous errors

    try {
      const depositRequest: DepositRequest = {
        amount: amountNum,
        paymentMethod: "lightning",
        splitType: depositTarget === "automatic" ? "automatic" : "specific",
      };

      if (depositTarget === "automatic") {
        depositRequest.walletIds = wallets.map((w) => w.id);
      } else {
        depositRequest.walletId = depositTarget;
      }

      const response = await initiateDeposit(depositRequest);

      setInvoice(response.lightningInvoice || "");
      setQrCodeUrl(response.qrCodeUrl || "");

      // Start monitoring for payment
      await startPolling(response.transaction.id, 120); // 10 minutes
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate Lightning invoice";
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyInvoice = async () => {
    try {
      await navigator.clipboard.writeText(invoice);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy invoice:", error);
    }
  };

  if (!invoice) {
    // Amount input and generate invoice
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (KES) *
          </label>
          <div className="relative">
            <CurrencyCircleDollarIcon
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="1000"
              className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                amountError
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-700 focus:ring-teal-500 focus:border-teal-500"
              }`}
              required
            />
          </div>
          {amountError && (
            <p className="text-sm text-red-400 mt-1">{amountError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Min: KES 10 • No maximum limit
          </p>
        </div>

        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <LightningIcon
              size={20}
              className="text-orange-400 mt-0.5 flex-shrink-0"
            />
            <div className="text-sm text-orange-300">
              <div className="font-medium mb-1">
                Lightning Network Benefits:
              </div>
              <ul className="text-orange-400 space-y-1">
                <li>• Instant payments (usually under 5 seconds)</li>
                <li>• Minimal network fees</li>
                <li>• Works with any Lightning wallet</li>
              </ul>
            </div>
          </div>
        </div>

        <Button
          onClick={generateInvoice}
          variant="tealPrimary"
          loading={loading}
          disabled={!amount || !!amountError}
          className="w-full shadow-lg shadow-teal-500/20"
        >
          {loading ? "Generating Invoice..." : "Generate Lightning Invoice"}
        </Button>
      </div>
    );
  }

  // Invoice display and payment
  return (
    <div className="space-y-4">
      {/* QR Code */}
      <div className="text-center">
        <div className="bg-white p-4 rounded-lg inline-block mb-4 border-2 border-slate-600">
          {qrCodeUrl ? (
            <Image
              src={qrCodeUrl}
              alt="Lightning Invoice QR Code"
              width={192}
              height={192}
              className="w-48 h-48"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-100 flex items-center justify-center">
              <QrCodeIcon size={48} className="text-gray-400" />
            </div>
          )}
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Scan with your Lightning wallet or copy the invoice below
        </p>
      </div>

      {/* Invoice String */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Lightning Invoice
        </label>
        <div className="relative">
          <textarea
            value={invoice}
            readOnly
            className="w-full h-24 p-3 bg-slate-900/50 border border-slate-700 rounded-lg text-sm font-mono text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={copyInvoice}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-300"
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </Button>
        </div>
        {copied && (
          <p className="text-xs text-green-400">Invoice copied to clipboard!</p>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <InfoIcon size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300">
            <div className="font-medium mb-1">Payment Instructions:</div>
            <ol className="text-blue-400 space-y-1 list-decimal list-inside">
              <li>
                Open your Lightning wallet (e.g., Phoenix, Muun, Wallet of
                Satoshi)
              </li>
              <li>Scan the QR code or paste the invoice</li>
              <li>Confirm the payment in your wallet</li>
              <li>Your deposit will be credited instantly</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="text-center py-4">
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-sm">Waiting for payment...</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          This invoice will expire in 10 minutes
        </p>
      </div>

      {/* Generate New Invoice */}
      <Button
        onClick={() => {
          setInvoice("");
          setQrCodeUrl("");
          setAmount("");
        }}
        variant="outline"
        className="w-full !bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700"
      >
        Generate New Invoice
      </Button>
    </div>
  );
}
