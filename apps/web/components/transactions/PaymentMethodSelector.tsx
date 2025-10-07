/**
 * Enhanced Payment Method Selector Component
 * Beautifully styled to match the membership payment flow with dark theme and teal accents
 * Supports MPesa and Lightning with context-aware limits and recommendations
 */

"use client";

import React, { useMemo, useState } from "react";
import { Label, PhoneInput, PhoneRegionCode } from "@bitsacco/ui";
import {
  DeviceMobileIcon,
  Lightning as BoltIcon,
  CheckCircle as CheckCircleIcon,
  Warning as ExclamationTriangleIcon,
} from "@phosphor-icons/react";

import type {
  PaymentMethodType,
  UnifiedTransactionType as TransactionType,
  TransactionContext,
  Money,
} from "@bitsacco/core";
import { getTransactionLimits } from "@/lib/transactions/unified/limits";

// ============================================================================
// Types
// ============================================================================

export interface PaymentMethodLimits {
  min: number;
  max: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  currency: string;
}

export interface PaymentMethodInfo {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: React.ReactNode;
  limits: PaymentMethodLimits;
  processingTime: string;
  fees: {
    type: "fixed" | "percentage";
    amount: number;
    minimum?: number;
    maximum?: number;
  };
  availability: "available" | "unavailable" | "maintenance";
  features: string[];
}

export interface PaymentMethodSelectorProps {
  amount: Money;
  type: TransactionType;
  context?: TransactionContext; // For backwards compatibility
  selectedMethod?: PaymentMethodType;
  availableMethods?: PaymentMethodType[];
  onSelect: (method: PaymentMethodType) => void;
  // Phone number handling for M-Pesa
  phoneNumber?: string;
  onPhoneNumberChange?: (phone: string) => void;
  regionCode?: PhoneRegionCode;
  onRegionCodeChange?: (code: PhoneRegionCode) => void;
  className?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Get payment method configuration with dynamic limits
 */
function getPaymentMethodInfo(
  method: PaymentMethodType,
  context: TransactionContext,
  type: TransactionType,
): PaymentMethodInfo {
  const limits = getTransactionLimits(context, type, method);

  const baseInfo = {
    mpesa: {
      id: "mpesa" as PaymentMethodType,
      name: "M-Pesa",
      description: "Pay with your M-Pesa mobile money",
      icon: <DeviceMobileIcon size={24} className="text-green-600" />,
      processingTime: "~2 minutes",
      fees: {
        type: "fixed" as const,
        amount: 15,
        minimum: 15,
        maximum: 100,
      },
      availability: "available" as const,
      features: [
        "Instant confirmation",
        "SMS notifications",
        "Wide acceptance",
      ],
    },
    lightning: {
      id: "lightning" as PaymentMethodType,
      name: "Lightning",
      description: "Instant Bitcoin Lightning payment",
      icon: <BoltIcon size={24} className="text-orange-600" />,
      processingTime: "Instant",
      fees: {
        type: "fixed" as const,
        amount: 1,
        minimum: 1,
        maximum: 10,
      },
      availability: "available" as const,
      features: ["Near-instant settlement", "Low fees", "24/7 availability"],
    },
  }[method];

  return {
    ...baseInfo,
    limits: {
      min: limits.minAmount,
      max: limits.maxAmount,
      dailyLimit: limits.dailyLimit,
      monthlyLimit: limits.monthlyLimit,
      currency: limits.currency || "KES",
    },
  };
}

// ============================================================================
// Component
// ============================================================================

export function PaymentMethodSelector({
  amount,
  type,
  context = "chama",
  selectedMethod,
  availableMethods = ["mpesa", "lightning"],
  onSelect,
  phoneNumber = "",
  onPhoneNumberChange,
  regionCode = PhoneRegionCode.Kenya,
  onRegionCodeChange,
  className,
}: PaymentMethodSelectorProps) {
  const [localPhoneNumber, setLocalPhoneNumber] = useState(phoneNumber);
  const [localRegionCode, setLocalRegionCode] = useState(regionCode);

  // Filter methods by availability and context
  const availableMethodsInfo = useMemo(() => {
    return availableMethods
      .map((method) => getPaymentMethodInfo(method, context, type))
      .filter(
        (method): method is PaymentMethodInfo =>
          method != null && method.availability === "available",
      );
  }, [availableMethods, context, type]);

  // Check if amount is within limits for each method
  const getMethodStatus = (method: PaymentMethodInfo) => {
    const amountValue = amount.value;

    if (amountValue < method.limits.min) {
      return {
        status: "below_limit" as const,
        message: `Minimum amount: ${formatCurrency(method.limits.min)}`,
      };
    }

    if (amountValue > method.limits.max) {
      return {
        status: "above_limit" as const,
        message: `Maximum amount: ${formatCurrency(method.limits.max)}`,
      };
    }

    return { status: "valid" as const, message: "" };
  };

  const handlePhoneChange = (phone: string) => {
    setLocalPhoneNumber(phone);
    onPhoneNumberChange?.(phone);
  };

  const handleRegionChange = (code: PhoneRegionCode) => {
    setLocalRegionCode(code);
    onRegionCodeChange?.(code);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div>
        <Label className="text-base font-semibold text-gray-100">
          Select Payment Method
        </Label>
      </div>

      {/* Payment Method Cards */}
      <div className="grid gap-3">
        {availableMethodsInfo.map((method) => {
          const status = getMethodStatus(method);
          const isSelected = selectedMethod === method.id;
          const isDisabled = status.status !== "valid";

          return (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isSelected={isSelected}
              isDisabled={isDisabled}
              status={status}
              onClick={() => !isDisabled && onSelect(method.id)}
            />
          );
        })}
      </div>

      {/* M-Pesa Phone Number Input */}
      {selectedMethod === "mpesa" && (
        <div className="mt-4">
          <PhoneInput
            phone={localPhoneNumber}
            setPhone={handlePhoneChange}
            regionCode={localRegionCode}
            setRegionCode={handleRegionChange}
            label="M-Pesa Phone Number"
            placeholder="708033339"
            validationContext="mpesa"
            showValidationIcon={true}
            required
          />
        </div>
      )}

      {/* Lightning Information */}
      {selectedMethod === "lightning" && (
        <div className="p-4 bg-slate-800/50 border border-slate-600/50 rounded-lg">
          <p className="text-sm text-gray-300">
            A Lightning invoice will be generated after confirmation.
          </p>
          <p className="text-sm text-gray-300">
            You&apos;ll be able to pay using any Lightning wallet.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

interface PaymentMethodCardProps {
  method: PaymentMethodInfo;
  isSelected: boolean;
  isDisabled: boolean;
  status: { status: string; message: string };
  onClick: () => void;
}

function PaymentMethodCard({
  method,
  isSelected,
  isDisabled,
  status,
  onClick,
}: PaymentMethodCardProps) {
  const getBenefitLabel = (methodId: PaymentMethodType) => {
    switch (methodId) {
      case "mpesa":
        return {
          text: "Free",
          className: "bg-green-500/20 text-green-300 border-green-500/30",
        };
      case "lightning":
        return {
          text: "Low fees",
          className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        };
      default:
        return null;
    }
  };

  const benefit = getBenefitLabel(method.id);

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
        ${
          isSelected
            ? "border-teal-500 bg-teal-500/10"
            : "border-slate-600/50 bg-slate-700/30 hover:border-slate-500 hover:bg-slate-700/50"
        }
        ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Icon */}
          <div
            className={`
            p-2 rounded-lg 
            ${method.id === "mpesa" ? "bg-green-500/20" : "bg-orange-500/20"}
          `}
          >
            {method.id === "mpesa" ? (
              <DeviceMobileIcon size={20} className="text-green-400" />
            ) : (
              <BoltIcon size={20} className="text-orange-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-100">{method.name}</h3>
              {benefit && (
                <span
                  className={`
                  px-2 py-0.5 text-xs rounded-full border font-medium
                  ${benefit.className}
                `}
                >
                  {benefit.text}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400">{method.description}</p>
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <CheckCircleIcon size={20} className="text-teal-400 flex-shrink-0" />
        )}
      </div>

      {/* Status message */}
      {status.message && (
        <div className="mt-3">
          <div
            className={`
            flex items-center gap-2 text-xs px-3 py-2 rounded-lg
            ${
              status.status === "valid"
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }
          `}
          >
            {status.status !== "valid" && <ExclamationTriangleIcon size={14} />}
            <span>{status.message}</span>
          </div>
        </div>
      )}
    </button>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);
}
