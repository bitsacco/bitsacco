/**
 * Confirmation Step
 * Final confirmation before payment processing
 */

"use client";

import React from "react";
import { Button } from "@bitsacco/ui";

import type {
  Money,
  PaymentMethodType,
} from "@/lib/transactions/unified/types";

// ============================================================================
// Types
// ============================================================================

export interface ConfirmationStepProps {
  amount: Money;
  paymentMethod: PaymentMethodType;
  targetName: string;
  onSubmit: () => void;
  loading: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ConfirmationStep({
  amount,
  paymentMethod,
  targetName,
  onSubmit,
  loading,
}: ConfirmationStepProps) {
  const getPaymentMethodDisplay = (method: PaymentMethodType) => {
    switch (method) {
      case "mpesa":
        return "M-PESA";
      case "lightning":
        return "Lightning";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-100 mb-2">
          Confirm Payment
        </h3>
        <p className="text-sm text-gray-400">
          Please review the details below before proceeding
        </p>
      </div>

      {/* Payment Details Card */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-600/50 rounded-xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between py-2">
          <span className="text-gray-400 font-medium">Amount:</span>
          <span className="text-xl font-semibold text-gray-100">
            Ksh {amount.value.toLocaleString()}
          </span>
        </div>

        <div className="h-px bg-slate-600/30"></div>

        <div className="flex items-center justify-between py-2">
          <span className="text-gray-400 font-medium">Method:</span>
          <span className="font-semibold text-gray-100 bg-slate-700/50 px-3 py-1 rounded-full text-sm">
            {getPaymentMethodDisplay(paymentMethod)}
          </span>
        </div>

        <div className="h-px bg-slate-600/30"></div>

        <div className="flex items-center justify-between py-2">
          <span className="text-gray-400 font-medium">To:</span>
          <span className="font-semibold text-gray-100">{targetName}</span>
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        variant="tealPrimary"
        onClick={onSubmit}
        disabled={loading}
        className="w-full h-12 text-base font-semibold bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 shadow-lg shadow-teal-500/25 transition-all duration-200 hover:shadow-teal-500/40 active:scale-[0.98]"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </div>
        ) : (
          "Confirm Payment"
        )}
      </Button>
    </div>
  );
}
