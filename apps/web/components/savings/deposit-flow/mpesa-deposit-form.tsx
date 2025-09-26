"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button, PhoneInput, PhoneRegionCode } from "@bitsacco/ui";
import { CurrencyCircleDollarIcon } from "@phosphor-icons/react";
import type { WalletResponseDto } from "@bitsacco/core";
import { PersonalTransactionStatus } from "@bitsacco/core";
import { MpesaPaymentModal } from "@/components/mpesa-payment-modal";

interface DepositRequest {
  walletId?: string;
  walletIds?: string[]; // For split deposits
  amount: number; // in KES
  paymentMethod: "mpesa" | "lightning";
  phoneNumber?: string; // Required for M-Pesa
  splitType?: "automatic" | "specific";
}
import { useTransactions } from "@/hooks/savings/use-transactions";
import { usePayment } from "@/hooks/savings/use-payment";
import { formatAmountInput } from "@/lib/utils/format";
import { validateAmount, validatePhoneNumber } from "@/lib/utils/calculations";
import { PERSONAL_DEPOSIT_LIMITS } from "@/lib/config";

interface MpesaDepositFormProps {
  wallet?: WalletResponseDto;
  wallets?: WalletResponseDto[];
  depositTarget: "automatic" | string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function MpesaDepositForm({
  // wallet,
  wallets = [],
  depositTarget,
  onSuccess,
  onError,
}: MpesaDepositFormProps) {
  const { data: session } = useSession();
  const { initiateDeposit, refetch: refetchTransactions } = useTransactions();
  const { startPolling, paymentStatus } = usePayment(() => {
    // Refresh transaction history when payment completes in background
    refetchTransactions();
  });
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; phone?: string }>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [transactionId, setTransactionId] = useState("");

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value);
    setAmount(formatted);

    // Clear amount error when user types
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  // Auto-fill phone number from user session
  useEffect(() => {
    if (session?.user?.phone?.number && !phoneNumber) {
      setPhoneNumber(session.user.phone.number);
    }
  }, [session, phoneNumber]);

  // Monitor payment status updates from the polling hook
  useEffect(() => {
    if (paymentStatus?.transactionId === transactionId && transactionId) {
      if (paymentStatus.status === PersonalTransactionStatus.COMPLETE) {
        // Don't call onSuccess immediately - let modal show success state first
        // Modal will handle calling onSuccess when user clicks "Done"
      } else if (paymentStatus.status === PersonalTransactionStatus.FAILED) {
        // Keep modal open but show failed state
      }
    }
  }, [paymentStatus, transactionId]);

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; phone?: string } = {};

    // Validate amount
    const amountNum = parseFloat(amount);
    const amountValidation = validateAmount(
      amountNum,
      PERSONAL_DEPOSIT_LIMITS.MIN_AMOUNT_KES,
      PERSONAL_DEPOSIT_LIMITS.MAX_AMOUNT_KES,
    );
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error;
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    onError(""); // Clear any previous errors

    try {
      const depositRequest: DepositRequest = {
        amount: parseFloat(amount),
        paymentMethod: "mpesa",
        phoneNumber: phoneNumber.replace(/\D/g, ""), // Remove non-digits
        splitType: depositTarget === "automatic" ? "automatic" : "specific",
      };

      if (depositTarget === "automatic") {
        depositRequest.walletIds = wallets.map((w) => w.walletId);
      } else {
        depositRequest.walletId = depositTarget;
      }

      const response = await initiateDeposit(depositRequest);

      // Extract transaction ID and show payment modal
      if (response.txId) {
        setTransactionId(response.txId);
        setShowPaymentModal(true);

        // Start polling for transaction status
        await startPolling(response.txId);
      } else {
        throw new Error("No transaction ID received from deposit response");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initiate M-Pesa payment";
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = amount && phoneNumber && !errors.amount && !errors.phone;

  const handlePaymentComplete = () => {
    // Reset form state
    setAmount("");
    setPhoneNumber("");
    setTransactionId("");
    setShowPaymentModal(false);
    // Call onSuccess to refresh data
    onSuccess();
  };

  const handleModalClose = () => {
    setShowPaymentModal(false);
    // Reset form to allow new payment
    setTransactionId("");
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

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Amount Input */}
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
                errors.amount
                  ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                  : "border-slate-700 focus:ring-teal-500 focus:border-teal-500"
              }`}
              required
            />
          </div>
          {errors.amount && (
            <p className="text-sm text-red-400 mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Phone Number Input */}
        <PhoneInput
          phone={phoneNumber}
          setPhone={(phone) => {
            setPhoneNumber(phone);
            // Clear phone error when user types
            if (errors.phone) {
              setErrors((prev) => ({ ...prev, phone: undefined }));
            }
          }}
          regionCode={PhoneRegionCode.Kenya}
          label="M-Pesa Phone Number"
          placeholder="Enter Safaricom number"
          required
          error={errors.phone}
          disabled={loading}
          selectCountryCode={false}
          validationContext="mpesa"
          showValidationIcon={true}
          onValidationChange={(result) => {
            if (!result.isValid && result.error) {
              setErrors((prev) => ({ ...prev, phone: result.error }));
            } else if (result.isValid && errors.phone) {
              setErrors((prev) => ({ ...prev, phone: undefined }));
            }
          }}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="tealPrimary"
          loading={loading}
          disabled={!isFormValid}
          className="w-full shadow-lg shadow-teal-500/20"
        >
          {loading ? "Sending M-Pesa Prompt..." : "Send M-Pesa Prompt"}
        </Button>
      </form>

      {/* M-Pesa Payment Modal */}
      <MpesaPaymentModal
        isOpen={showPaymentModal}
        onClose={handleModalClose}
        amount={parseFloat(amount) || 0}
        phoneNumber={phoneNumber.replace(/\D/g, "")}
        transactionId={transactionId}
        status={getModalStatus()}
        onPaymentComplete={handlePaymentComplete}
      />
    </>
  );
}
