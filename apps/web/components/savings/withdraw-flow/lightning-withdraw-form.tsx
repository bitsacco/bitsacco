"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  LightningIcon,
  CurrencyCircleDollarIcon,
  WarningIcon,
  LinkIcon,
} from "@phosphor-icons/react";
import type { PersonalWallet } from "@/lib/types/savings";
import { useTransactions } from "@/hooks/savings/use-transactions";
import { usePayment } from "@/hooks/savings/use-payment";
import { formatAmountInput, formatCurrency } from "@/lib/utils/format";
import { validateAmount } from "@/lib/utils/calculations";

interface LightningWithdrawFormProps {
  wallet: PersonalWallet;
  onSuccess: () => void;
  onError: (error: string) => void;
  earlyWithdrawPenalty: number;
}

export function LightningWithdrawForm({
  wallet,
  onSuccess,
  onError,
  earlyWithdrawPenalty,
}: LightningWithdrawFormProps) {
  const { initiateWithdraw } = useTransactions();
  const { startPolling } = usePayment();
  const [amount, setAmount] = useState("");
  const [lightningAddress, setLightningAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<{ amount?: string; address?: string }>(
    {},
  );

  const maxWithdrawAmount = Math.floor(
    (wallet.balanceFiat - earlyWithdrawPenalty) / 100,
  );

  const handleAmountChange = (value: string) => {
    const formatted = formatAmountInput(value);
    setAmount(formatted);

    // Clear amount error when user types
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const handleAddressChange = (value: string) => {
    setLightningAddress(value.trim());

    // Clear address error when user types
    if (errors.address) {
      setErrors((prev) => ({ ...prev, address: undefined }));
    }
  };

  const validateLightningAddress = (address: string): boolean => {
    // Basic validation for Lightning addresses/invoices
    if (!address) return false;

    // Lightning invoice (starts with ln)
    if (address.toLowerCase().startsWith("ln")) {
      return address.length > 10;
    }

    // Lightning address (email-like format)
    if (address.includes("@")) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(address);
    }

    // Node public key with potential payment info
    if (address.length === 66 || address.length > 100) {
      return /^[0-9a-fA-F]+/.test(address);
    }

    return false;
  };

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; address?: string } = {};

    // Validate amount
    const amountNum = parseFloat(amount);
    const amountValidation = validateAmount(amountNum, 10, maxWithdrawAmount);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error;
    }

    // Validate Lightning address
    if (!validateLightningAddress(lightningAddress)) {
      newErrors.address = "Please enter a valid Lightning address or invoice";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setLoading(true);
    onError(""); // Clear any previous errors

    try {
      const response = await initiateWithdraw({
        walletId: wallet.id,
        amount: parseFloat(amount),
        paymentMethod: "lightning",
        lightningAddress: lightningAddress,
      });

      // Start polling for transaction status
      await startPolling(response.transaction.id);

      // Show success message and close
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to initiate Lightning withdrawal";
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

  const isFormValid =
    amount && lightningAddress && !errors.amount && !errors.address;
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

        <div className="p-3 bg-slate-700/30 rounded-lg">
          <div className="text-xs text-gray-400">
            <div className="font-medium mb-1">Destination:</div>
            <div className="font-mono text-gray-300 break-all">
              {lightningAddress}
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
        <p className="text-xs text-gray-500 mt-1">
          Available: KES {maxWithdrawAmount} • Min: KES 10
        </p>
      </div>

      {/* Lightning Address Input */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Lightning Address or Invoice *
        </label>
        <div className="relative">
          <LinkIcon
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={lightningAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="user@wallet.com or lnbc1..."
            className={`w-full pl-10 pr-4 py-3 bg-slate-900/50 border rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
              errors.address
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-slate-700 focus:ring-teal-500 focus:border-teal-500"
            }`}
            required
          />
        </div>
        {errors.address && (
          <p className="text-sm text-red-400 mt-1">{errors.address}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Lightning address (user@domain.com) or Lightning invoice (lnbc...)
        </p>
      </div>

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
      <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <div className="flex items-start gap-3">
          <LightningIcon
            size={20}
            className="text-orange-400 mt-0.5 flex-shrink-0"
          />
          <div className="text-sm text-orange-300">
            <div className="font-medium mb-1">
              Lightning Network Withdrawal:
            </div>
            <ul className="text-orange-400 space-y-1">
              <li>• Instant payments (usually under 5 seconds)</li>
              <li>• Minimal network fees</li>
              <li>• Works with any Lightning wallet or address</li>
              <li>• Irreversible once processed</li>
            </ul>
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
        {earlyWithdrawPenalty > 0
          ? "Review Withdrawal"
          : "Withdraw via Lightning"}
      </Button>

      {/* Additional Info */}
      <div className="text-center text-xs text-gray-500">
        Lightning withdrawals are instant and irreversible. Double-check your
        address.
      </div>
    </form>
  );
}
