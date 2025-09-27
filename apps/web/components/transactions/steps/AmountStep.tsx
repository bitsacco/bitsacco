/**
 * Amount Input Step
 * Handles amount input with context-aware validation and limits
 */

"use client";

import React, { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  CurrencyCircleDollarIcon,
  Warning as AlertTriangleIcon,
} from "@phosphor-icons/react";

import type {
  TransactionContext,
  TransactionType,
  Money,
} from "@/lib/transactions/unified/types";
import { formatCurrency } from "@/lib/utils/format";

// ============================================================================
// Types
// ============================================================================

export interface AmountStepProps {
  context: TransactionContext;
  type: TransactionType;
  initialAmount?: number;
  initialReference?: string;
  onNext: (amount: Money, reference: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export function AmountStep({
  context,
  type,
  initialAmount = 0,
  onNext,
}: AmountStepProps) {
  const [amount, setAmount] = useState(initialAmount.toString());
  const [error, setError] = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = cleanValue.split(".");
    if (parts.length > 2) {
      return;
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setAmount(cleanValue);
    setError(null);
  };

  const validateAndProceed = () => {
    // Generate default reference
    const finalReference = generateDefaultReference(
      type,
      context,
      numericAmount,
    );

    onNext(
      {
        value: numericAmount,
        currency: "KES",
      },
      finalReference,
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Amount Input Section */}
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-300">
            Amount (KES)
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <CurrencyCircleDollarIcon
                size={22}
                className="text-gray-400 group-focus-within:text-teal-400 transition-colors duration-200"
              />
            </div>
            <input
              type="text"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0.00"
              className="w-full pl-14 pr-6 py-4 text-xl font-semibold bg-transparent border border-slate-600/50 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 shadow-lg hover:shadow-xl hover:border-slate-500/70 hover:scale-[1.01] focus:scale-[1.01]"
              autoFocus
            />
            {/* Input glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/5 to-blue-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />
          </div>
        </div>

        {/* Validation Messages */}
        {error && (
          <div className="animate-in fade-in-50 slide-in-from-top-2 duration-300">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-red-500/10 to-rose-500/10 border border-red-500/30 rounded-xl shadow-lg">
              <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertTriangleIcon size={18} className="text-red-400" />
              </div>
              <div>
                <div className="font-medium text-red-300 mb-1">
                  Validation Error
                </div>
                <span className="text-sm text-red-200">{error}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Continue Button */}
      <Button
        onClick={validateAndProceed}
        disabled={numericAmount <= 0}
        className="w-full h-12 text-base font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:active:scale-100 group"
        size="lg"
        variant="tealPrimary"
      >
        <span className="group-hover:scale-105 transition-transform duration-200">
          {numericAmount > 0
            ? `Continue with ${formatCurrency(numericAmount)}`
            : "Enter Amount to Continue"}
        </span>
      </Button>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateDefaultReference(
  type: TransactionType,
  context: TransactionContext,
  amount: number,
): string {
  const formattedAmount = formatCurrency(amount);

  if (type === "deposit") {
    if (context === "chama") {
      return `Deposit ${formattedAmount} to chama`;
    } else if (context === "personal") {
      return `Deposit ${formattedAmount} to wallet`;
    } else {
      return `Deposit ${formattedAmount}`;
    }
  }

  if (type === "withdrawal") {
    if (context === "chama") {
      return `Withdraw ${formattedAmount} from chama`;
    } else if (context === "personal") {
      return `Withdraw ${formattedAmount} from wallet`;
    } else {
      return `Withdraw ${formattedAmount}`;
    }
  }

  if (type === "subscription") {
    return `Purchase ${formattedAmount} shares`;
  }

  if (type === "transfer") {
    return `Transfer ${formattedAmount}`;
  }

  return `${type} ${formattedAmount}`;
}
