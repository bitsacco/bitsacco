/**
 * Payment Method Selection Step
 * Enhanced payment method selector with limits and recommendations
 */

"use client";

import React, { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  DeviceMobileIcon,
  LightningIcon,
  InfoIcon,
  PhoneIcon,
  CopyIcon,
} from "@phosphor-icons/react";

import type {
  TransactionContext,
  TransactionType,
  Money,
  PaymentMethodType,
} from "@/lib/transactions/unified/types";
import { formatCurrency } from "@/lib/utils/format";

// ============================================================================
// Types
// ============================================================================

export interface PaymentMethodStepProps {
  context: TransactionContext;
  type: TransactionType;
  amount: Money;
  availableMethods?: PaymentMethodType[];
  initialPaymentMethod?: PaymentMethodType;
  onNext: (paymentMethod: PaymentMethodType, details: PaymentDetails) => void;
}

export interface PaymentDetails {
  phoneNumber?: string;
  lightningInvoice?: string;
  bankDetails?: {
    accountNumber: string;
    bankCode: string;
  };
}

interface PaymentMethodInfo {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: React.ReactNode;
  limits: {
    min: number;
    max: number;
    fee?: number;
  };
  processingTime: string;
  features: string[];
  recommendation?: string;
  available: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function PaymentMethodStep({
  context,
  type,
  amount,
  availableMethods = ["mpesa", "lightning"],
  initialPaymentMethod,
  onNext,
}: PaymentMethodStepProps) {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethodType | null>(initialPaymentMethod || null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({});
  const [error, setError] = useState<string | null>(null);
  const [isCollectingDetails, setIsCollectingDetails] = useState(false);

  // Get payment method configurations
  const paymentMethods = getPaymentMethods(context, type, amount.value);
  const availablePaymentMethods = paymentMethods.filter(
    (method) => availableMethods.includes(method.id) && method.available,
  );

  const selectedMethodInfo = paymentMethods.find(
    (m) => m.id === selectedMethod,
  );

  const handleMethodSelect = (method: PaymentMethodType) => {
    setSelectedMethod(method);
    setError(null);
    setIsCollectingDetails(true);
  };

  const handleDetailsSubmit = () => {
    if (!selectedMethod || !selectedMethodInfo) return;

    // Validate payment details based on method
    if (selectedMethod === "mpesa") {
      if (!paymentDetails.phoneNumber) {
        setError("Please enter your M-Pesa number");
        return;
      }

      // Basic phone number validation
      const cleanPhone = paymentDetails.phoneNumber.replace(/\D/g, "");
      if (cleanPhone.length < 9 || cleanPhone.length > 12) {
        setError("Please enter a valid phone number");
        return;
      }
    }

    if (selectedMethod === "lightning") {
      if (type === "withdrawal" && !paymentDetails.lightningInvoice) {
        setError("Please provide a Lightning invoice");
        return;
      }
    }

    onNext(selectedMethod, paymentDetails);
  };

  const handleBack = () => {
    setIsCollectingDetails(false);
    setSelectedMethod(null);
    setPaymentDetails({});
    setError(null);
  };

  if (!isCollectingDetails) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-100 mb-2">
            Choose Payment Method
          </h3>
          <p className="text-sm text-gray-400">
            Select how you want to {type} {formatCurrency(amount.value * 100)}
          </p>
        </div>

        {/* Payment Methods Grid */}
        <div className="space-y-3">
          {availablePaymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isRecommended={Boolean(method.recommendation)}
              onClick={() => handleMethodSelect(method.id)}
            />
          ))}
        </div>

        {/* No Methods Available */}
        {availablePaymentMethods.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <InfoIcon size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-400">
              No payment methods available for this transaction amount
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors mb-4"
        >
          ← Back to payment methods
        </button>
        <div className="flex items-center gap-3">
          {selectedMethodInfo?.icon}
          <div>
            <h3 className="text-lg font-medium text-gray-100">
              {selectedMethodInfo?.name}
            </h3>
            <p className="text-sm text-gray-400">
              {type === "deposit" ? "Send payment using" : "Receive funds via"}{" "}
              {selectedMethodInfo?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Details Form */}
      {selectedMethod === "mpesa" && (
        <MpesaDetailsForm
          type={type}
          amount={amount}
          details={paymentDetails}
          onChange={setPaymentDetails}
        />
      )}

      {selectedMethod === "lightning" && (
        <LightningDetailsForm
          type={type}
          amount={amount}
          details={paymentDetails}
          onChange={setPaymentDetails}
        />
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Continue Button */}
      <Button
        onClick={handleDetailsSubmit}
        variant="tealPrimary"
        className="w-full shadow-lg shadow-teal-500/20"
        size="lg"
      >
        Continue
      </Button>
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function PaymentMethodCard({
  method,
  isRecommended,
  onClick,
}: {
  method: PaymentMethodInfo;
  isRecommended: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-lg border-2 transition-all duration-200 text-left border-slate-600/50 bg-slate-700/30 hover:border-slate-500 hover:bg-slate-700/50 cursor-pointer group relative"
    >
      {isRecommended && (
        <div className="absolute -top-2 -right-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
          Recommended
        </div>
      )}

      <div className="flex items-start gap-4">
        <div className="p-2 bg-slate-700/50 rounded-lg group-hover:bg-slate-600 transition-colors">
          {method.icon}
        </div>

        <div className="flex-1">
          <h4 className="font-medium text-gray-100 mb-1">{method.name}</h4>
          <p className="text-sm text-gray-400 mb-3">{method.description}</p>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-gray-500 mb-1">Limits</div>
              <div className="text-gray-300">
                {formatCurrency(method.limits.min * 100)} -{" "}
                {formatCurrency(method.limits.max * 100)}
              </div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Processing Time</div>
              <div className="text-gray-300">{method.processingTime}</div>
            </div>
          </div>

          {method.recommendation && (
            <div className="mt-2 text-xs text-teal-400">
              {method.recommendation}
            </div>
          )}
        </div>

        <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
          →
        </div>
      </div>
    </button>
  );
}

function MpesaDetailsForm({
  type,
  amount,
  details,
  onChange,
}: {
  type: TransactionType;
  amount: Money;
  details: PaymentDetails;
  onChange: (details: PaymentDetails) => void;
}) {
  const handlePhoneChange = (value: string) => {
    const formatted = value.replace(/\D/g, "");
    onChange({ ...details, phoneNumber: formatted });
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <DeviceMobileIcon size={20} className="text-green-400 mt-0.5" />
          <div className="text-sm">
            <div className="text-green-300 font-medium mb-1">
              M-Pesa {type === "deposit" ? "Payment" : "Withdrawal"}
            </div>
            <div className="text-green-200/80">
              {type === "deposit"
                ? `You'll receive an M-Pesa prompt to pay ${formatCurrency(amount.value * 100)}`
                : `Funds will be sent to your M-Pesa number`}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {type === "deposit"
            ? "Your M-Pesa Number"
            : "M-Pesa Number to receive funds"}
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <PhoneIcon size={16} className="text-gray-400" />
          </div>
          <input
            type="tel"
            value={details.phoneNumber || ""}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="254XXXXXXXXX"
            className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
          />
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Enter your phone number in international format (254XXXXXXXXX)
        </div>
      </div>
    </div>
  );
}

function LightningDetailsForm({
  type,
  amount,
  details,
  onChange,
}: {
  type: TransactionType;
  amount: Money;
  details: PaymentDetails;
  onChange: (details: PaymentDetails) => void;
}) {
  if (type === "deposit") {
    return (
      <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <LightningIcon size={20} className="text-orange-400 mt-0.5" />
          <div className="text-sm">
            <div className="text-orange-300 font-medium mb-1">
              Lightning Network Deposit
            </div>
            <div className="text-orange-200/80">
              You&apos;ll receive a Lightning invoice to pay{" "}
              {formatCurrency(amount.value * 100)} worth of Bitcoin
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
        <div className="flex items-start gap-3">
          <LightningIcon size={20} className="text-orange-400 mt-0.5" />
          <div className="text-sm">
            <div className="text-orange-300 font-medium mb-1">
              Lightning Network Withdrawal
            </div>
            <div className="text-orange-200/80">
              Provide a Lightning invoice for{" "}
              {formatCurrency(amount.value * 100)} worth of Bitcoin
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Lightning Invoice
        </label>
        <div className="relative">
          <textarea
            value={details.lightningInvoice || ""}
            onChange={(e) =>
              onChange({ ...details, lightningInvoice: e.target.value })
            }
            placeholder="lnbc..."
            className="w-full p-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors resize-none font-mono text-sm"
            rows={3}
          />
          <button
            type="button"
            onClick={() =>
              navigator.clipboard.readText().then((text) => {
                if (text.startsWith("lnbc")) {
                  onChange({ ...details, lightningInvoice: text });
                }
              })
            }
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <CopyIcon size={16} />
          </button>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Paste your Lightning invoice here
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getPaymentMethods(
  context: TransactionContext,
  type: TransactionType,
  amount: number,
): PaymentMethodInfo[] {
  const methods: PaymentMethodInfo[] = [
    {
      id: "mpesa",
      name: "M-Pesa",
      description: "Mobile money payment",
      icon: <DeviceMobileIcon size={24} className="text-green-500" />,
      limits: { min: 10, max: 70000, fee: 0 },
      processingTime: "1-2 minutes",
      features: ["Instant", "Widely accepted", "Secure"],
      available: amount >= 10 && amount <= 70000,
      recommendation:
        amount <= 50000 ? "Best for amounts under 50K" : undefined,
    },
    {
      id: "lightning",
      name: "Lightning Network",
      description: "Instant Bitcoin payments",
      icon: <LightningIcon size={24} className="text-orange-400" />,
      limits: { min: 10, max: 100000, fee: 1 },
      processingTime: "Instant",
      features: ["Instant", "Low fees", "Bitcoin"],
      available: amount >= 10 && amount <= 100000,
      recommendation: amount > 50000 ? "Best for large amounts" : undefined,
    },
  ];

  return methods;
}
