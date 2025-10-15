"use client";

import { useState } from "react";
import { Button, PhoneInput, PhoneRegionCode } from "@bitsacco/ui";
import {
  CurrencyCircleDollarIcon,
  WarningIcon,
  InfoIcon,
} from "@phosphor-icons/react";
import type { WalletResponseDto } from "@bitsacco/core";
import { useTransactions } from "@/hooks/savings/use-transactions";
import { usePayment } from "@/hooks/savings/use-payment";
import { formatAmountInput, formatCurrency } from "@/lib/utils/format";
import { validateAmount, validatePhoneNumber } from "@/lib/utils/calculations";
import { btcToFiat } from "@bitsacco/core";
import { useExchangeRate } from "@/lib/hooks/useExchangeRate";
import { apiClient } from "@/lib/auth";

interface MpesaWithdrawFormProps {
  wallet: WalletResponseDto;
  onSuccess: () => void;
  onError: (error: string) => void;
  earlyWithdrawPenalty: number;
}

export function MpesaWithdrawForm({
  wallet,
  onSuccess,
  onError,
  earlyWithdrawPenalty,
}: MpesaWithdrawFormProps) {
  const { initiateWithdraw } = useTransactions();
  const { startPolling } = usePayment();
  const { quote } = useExchangeRate({ apiClient });
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; phone?: string }>({});

  // Calculate fiat balance using live exchange rate
  const walletBalanceFiat = quote?.rate
    ? btcToFiat({
        amountSats: Math.floor(wallet.balance / 1000),
        fiatToBtcRate: Number(quote.rate),
      }).amountFiat
    : 0;

  const maxWithdrawAmount = Math.floor(
    (walletBalanceFiat - earlyWithdrawPenalty) / 100,
  );

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value);
    setAmount(formatted);

    // Clear amount error when user types
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; phone?: string } = {};

    // Validate amount
    const amountNum = parseFloat(amount);
    const amountValidation = validateAmount(
      amountNum,
      10,
      Math.min(maxWithdrawAmount, 70000),
    );
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error;
    }

    // Check if amount exceeds available balance (after penalty)
    if (amountNum > maxWithdrawAmount) {
      newErrors.amount = `Maximum withdrawal: KES ${maxWithdrawAmount}`;
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    onError(""); // Clear any previous errors

    try {
      const response = await initiateWithdraw({
        walletId: wallet.walletId,
        amount: parseFloat(amount),
        paymentMethod: "mpesa",
        phoneNumber: phoneNumber.replace(/\D/g, ""), // Remove non-digits
      });

      // Start polling for transaction status using txId from backend response
      if (response.txId) {
        await startPolling(response.txId);
      } else {
        throw new Error("No transaction ID received from withdraw response");
      }

      // Show success message and close
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initiate M-Pesa withdrawal";
      onError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Show confirmation if there's a penalty
    if (earlyWithdrawPenalty > 0) {
      setShowConfirmation(true);
    } else {
      handleSubmit();
    }
  };

  const isFormValid = amount && phoneNumber && !errors.amount && !errors.phone;
  const finalAmount = parseFloat(amount) || 0;
  const actualReceiveAmount = finalAmount - earlyWithdrawPenalty / 100;

  if (showConfirmation) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <WarningIcon
              size={20}
              className="text-amber-400 mt-0.5 flex-shrink-0"
            />
            <div className="text-sm text-amber-300">
              <div className="font-medium mb-2">Confirm Early Withdrawal</div>
              <div className="space-y-2 text-amber-400">
                <div className="flex justify-between">
                  <span>Withdrawal Amount:</span>
                  <span>{formatCurrency(finalAmount * 100)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Early Withdrawal Penalty:</span>
                  <span className="text-red-400">
                    -{formatCurrency(earlyWithdrawPenalty)}
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t border-amber-500/20 pt-2">
                  <span>You will receive:</span>
                  <span>{formatCurrency(actualReceiveAmount * 100)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowConfirmation(false)}
            className="flex-1 !bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            variant="tealPrimary"
            onClick={handleSubmit}
            loading={loading}
            className="flex-1 shadow-lg shadow-teal-500/20"
          >
            {loading ? "Processing..." : "Confirm Withdrawal"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleInitialSubmit} className="space-y-4">
      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Withdrawal Amount (KES) *
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
        {/* <p className="text-xs text-gray-500 mt-1">
          Available: KES {maxWithdrawAmount} • Min: KES 10 • Max: KES 70,000
        </p> */}
        <p className="text-xs text-gray-500 mt-1">
          Available: KES {maxWithdrawAmount} • Min: KES 10
        </p>
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
        className="space-y-1"
      />
      <p className="text-xs text-gray-500">
        Money will be sent to this M-Pesa number
      </p>

      {/* Early Withdrawal Warning */}
      {earlyWithdrawPenalty > 0 && finalAmount > 0 && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <div className="text-xs text-amber-400">
            <div className="flex justify-between mb-1">
              <span>Withdrawal:</span>
              <span>{formatCurrency(finalAmount * 100)}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Penalty:</span>
              <span className="text-red-400">
                -{formatCurrency(earlyWithdrawPenalty)}
              </span>
            </div>
            <div className="flex justify-between font-medium border-t border-amber-500/20 pt-1">
              <span>You&apos;ll receive:</span>
              <span>{formatCurrency(actualReceiveAmount * 100)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Information Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <InfoIcon size={20} className="text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-300">
            <div className="font-medium mb-1">Withdrawal Process:</div>
            <ol className="text-blue-400 space-y-1 list-decimal list-inside">
              <li>Your withdrawal request will be processed</li>
              <li>Money will be sent to your M-Pesa number</li>
              <li>You&apos;ll receive a confirmation SMS</li>
              <li>Processing time: 5-10 minutes</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="tealPrimary"
        disabled={!isFormValid}
        className="w-full shadow-lg shadow-teal-500/20"
      >
        {earlyWithdrawPenalty > 0 ? "Review Withdrawal" : "Withdraw to M-Pesa"}
      </Button>

      {/* Additional Info */}
      <div className="text-center text-xs text-gray-500">
        Standard M-Pesa rates may apply. Processing typically takes 5-10
        minutes.
      </div>
    </form>
  );
}
