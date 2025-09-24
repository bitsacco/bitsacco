"use client";

import { useState, useEffect } from "react";
import { Button } from "@bitsacco/ui";
import { LightningIcon, CurrencyCircleDollarIcon } from "@phosphor-icons/react";
import type { WalletResponseDto, SolowalletTx } from "@bitsacco/core";
import { PersonalTransactionStatus } from "@bitsacco/core";

// Define simple types inline
type PaymentMethod = "mpesa" | "lightning";
type SplitType = "automatic" | "specific";

interface DepositRequest {
  amount: number;
  paymentMethod: PaymentMethod;
  splitType: SplitType;
  walletIds?: string[];
  walletId?: string;
  phoneNumber?: string;
}
import { useTransactions } from "@/hooks/savings/use-transactions";
import { usePayment } from "@/hooks/savings/use-payment";
import { formatAmountInput } from "@/lib/utils/format";
import { validateAmount } from "@/lib/utils/calculations";
import { LightningPaymentModal } from "@/components/lightning-payment-modal";
import { LIGHTNING_DEPOSIT_LIMITS } from "@/lib/config";

interface LightningDepositFormProps {
  wallet?: WalletResponseDto;
  wallets?: WalletResponseDto[];
  depositTarget: "automatic" | string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function LightningDepositForm({
  // wallet,
  wallets = [],
  depositTarget,
  onSuccess,
  onError,
}: LightningDepositFormProps) {
  const { initiateDeposit, refetch: refetchTransactions } = useTransactions();
  const { startPolling, paymentStatus } = usePayment(() => {
    // Refresh transaction history when payment completes in background
    refetchTransactions();
  });
  const [amount, setAmount] = useState("");
  const [invoice, setInvoice] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [amountError, setAmountError] = useState<string | null>(null);

  // Monitor payment status updates from the polling hook
  useEffect(() => {
    if (paymentStatus?.transactionId === transactionId) {
      if (paymentStatus.status === PersonalTransactionStatus.COMPLETE) {
        // Don't call onSuccess immediately - let modal show success state first
        // Modal will handle calling onSuccess when user clicks "Done"
      } else if (paymentStatus.status === PersonalTransactionStatus.FAILED) {
        // Keep modal open but show failed state
      }
    }
  }, [paymentStatus, transactionId]);

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
    const validation = validateAmount(
      amountNum,
      LIGHTNING_DEPOSIT_LIMITS.MIN_AMOUNT_KES,
      LIGHTNING_DEPOSIT_LIMITS.MAX_AMOUNT_KES,
    );
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
        depositRequest.walletIds = wallets.map((w) => w.walletId);
      } else {
        depositRequest.walletId = depositTarget;
      }

      // Log the deposit request to debug
      console.log("[Lightning Deposit] Deposit request:", {
        depositTarget,
        wallets: wallets.length,
        depositRequest,
      });

      // Validate that we have a walletId before proceeding
      if (!depositRequest.walletId && !depositRequest.walletIds) {
        throw new Error(
          "No wallet selected. Please select a wallet to deposit to.",
        );
      }

      const response = await initiateDeposit(depositRequest);

      // Extract Lightning invoice from the transaction in the backend response
      const transaction = response.ledger?.transactions?.find(
        (tx: SolowalletTx) => tx.id === response.txId,
      );

      if (transaction?.lightning) {
        // Lightning is now properly typed as FmLightning object, no JSON parsing needed
        setInvoice(transaction.lightning.invoice || "");
        setTransactionId(response.txId || "");
        setShowPaymentModal(true);

        // Start monitoring for payment using txId from backend response
        if (response.txId) {
          await startPolling(response.txId, 120); // 10 minutes
        }
      } else {
        throw new Error("No Lightning invoice received from deposit response");
      }
    } catch (error) {
      console.error("[Lightning Deposit] Error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate Lightning invoice";
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    // Reset form state
    setInvoice("");
    setAmount("");
    setTransactionId("");
    setShowPaymentModal(false);
    // Call onSuccess to refresh data
    onSuccess();
  };

  // Map payment status from hook to modal status
  const getModalStatus = ():
    | "pending"
    | "processing"
    | "completed"
    | "failed" => {
    if (!paymentStatus || paymentStatus.transactionId !== transactionId) {
      return "processing"; // Default state
    }

    switch (paymentStatus.status) {
      case PersonalTransactionStatus.PENDING:
        return "pending";
      case PersonalTransactionStatus.PROCESSING:
        return "processing";
      case PersonalTransactionStatus.COMPLETE:
        return "completed";
      case PersonalTransactionStatus.FAILED:
      case PersonalTransactionStatus.MANUAL_REVIEW:
      default:
        return "failed";
    }
  };

  const handleModalClose = () => {
    setShowPaymentModal(false);
    // Reset form to allow new payment
    setInvoice("");
    setAmount("");
    setTransactionId("");
  };

  return (
    <>
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

      {/* Lightning Payment Modal */}
      <LightningPaymentModal
        isOpen={showPaymentModal}
        onClose={handleModalClose}
        invoice={invoice}
        amount={parseFloat(amount) || 0}
        transactionId={transactionId}
        status={getModalStatus()}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
}
