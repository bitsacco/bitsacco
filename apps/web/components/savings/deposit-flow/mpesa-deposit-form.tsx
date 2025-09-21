"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  DeviceMobileIcon,
  CurrencyCircleDollarIcon,
  InfoIcon,
} from "@phosphor-icons/react";
import type { PersonalWallet, DepositRequest } from "@/lib/types/savings";
import { useTransactions } from "@/hooks/savings/use-transactions";
import { usePayment } from "@/hooks/savings/use-payment";
import { formatAmountInput } from "@/lib/utils/format";
import { validateAmount, validatePhoneNumber } from "@/lib/utils/calculations";

interface MpesaDepositFormProps {
  wallet?: PersonalWallet;
  wallets?: PersonalWallet[];
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
  const { initiateDeposit } = useTransactions();
  const { startPolling } = usePayment();
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; phone?: string }>({});

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value);
    setAmount(formatted);

    // Clear amount error when user types
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);

    // Clear phone error when user types
    if (errors.phone) {
      setErrors((prev) => ({ ...prev, phone: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; phone?: string } = {};

    // Validate amount
    const amountNum = parseFloat(amount);
    const amountValidation = validateAmount(amountNum, 10, 70000);
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
        depositRequest.walletIds = wallets.map((w) => w.id);
      } else {
        depositRequest.walletId = depositTarget;
      }

      const response = await initiateDeposit(depositRequest);

      // Start polling for transaction status
      await startPolling(response.transaction.id);

      // Show success message and close
      onSuccess();
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

  return (
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
        <p className="text-xs text-gray-500 mt-1">
          Min: KES 10 • Max: KES 70,000
        </p>
      </div>

      {/* Phone Number Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          M-Pesa Phone Number *
        </label>
        <div className="relative">
          <DeviceMobileIcon
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="254712345678"
            className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.phone
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-slate-700 focus:ring-teal-500 focus:border-teal-500"
            }`}
            required
          />
        </div>
        {errors.phone && (
          <p className="text-sm text-red-400 mt-1">{errors.phone}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Enter the phone number registered with M-Pesa
        </p>
      </div>

      {/* Information Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <InfoIcon size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300">
            <div className="font-medium mb-1">How it works:</div>
            <ol className="text-blue-400 space-y-1 list-decimal list-inside">
              <li>You&apos;ll receive an M-Pesa prompt on your phone</li>
              <li>Enter your M-Pesa PIN to confirm payment</li>
              <li>Your Bitcoin will be credited within 1-2 minutes</li>
            </ol>
          </div>
        </div>
      </div>

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

      {/* Additional Info */}
      <div className="text-center text-xs text-gray-500">
        Standard M-Pesa rates apply. You will receive a confirmation SMS.
      </div>
    </form>
  );
}
