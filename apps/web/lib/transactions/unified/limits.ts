/**
 * Transaction Limits Configuration
 * Centralizes all transaction limit logic based on context and payment method
 */

import {
  LIGHTNING_DEPOSIT_LIMITS,
  LIGHTNING_WITHDRAW_LIMITS,
  CHAMA_DEPOSIT_LIMITS,
  CHAMA_WITHDRAW_LIMITS,
} from "@/lib/config";

import type {
  TransactionContext,
  TransactionType,
  PaymentMethodType,
  TransactionLimits,
} from "./types";

export interface LimitConfig {
  MIN_AMOUNT_KES: number;
  MAX_AMOUNT_KES: number;
}

/**
 * Get transaction limits based on context, transaction type, and payment method
 */
export function getTransactionLimits(
  context: TransactionContext,
  type: TransactionType,
  paymentMethod?: PaymentMethodType,
): TransactionLimits {
  const limitConfig = getLimitConfig(context, type, paymentMethod);

  return {
    minAmount: limitConfig.MIN_AMOUNT_KES,
    maxAmount: limitConfig.MAX_AMOUNT_KES,
    dailyLimit: getDailyLimit(context, type, paymentMethod),
    monthlyLimit: getMonthlyLimit(context, type, paymentMethod),
    currency: "KES",
  };
}

/**
 * Get the appropriate limit configuration
 */
function getLimitConfig(
  context: TransactionContext,
  type: TransactionType,
  paymentMethod?: PaymentMethodType,
): LimitConfig {
  // Lightning has its own limits regardless of context
  if (paymentMethod === "lightning") {
    return type === "deposit" || type === "subscription"
      ? LIGHTNING_DEPOSIT_LIMITS
      : LIGHTNING_WITHDRAW_LIMITS;
  }

  // Context-based limits for M-Pesa and other payment methods
  switch (context) {
    case "chama":
      return type === "deposit" ? CHAMA_DEPOSIT_LIMITS : CHAMA_WITHDRAW_LIMITS;

    default:
      return type === "deposit" ? CHAMA_DEPOSIT_LIMITS : CHAMA_WITHDRAW_LIMITS;
  }
}

/**
 * Get daily limits based on payment method and context
 */
function getDailyLimit(
  context: TransactionContext,
  type: TransactionType,
  paymentMethod?: PaymentMethodType,
): number | undefined {
  // M-Pesa has daily limits
  if (paymentMethod === "mpesa") {
    return 300_000; // M-Pesa daily limit
  }

  // Lightning typically has higher daily limits
  if (paymentMethod === "lightning") {
    return 500_000;
  }

  return undefined;
}

/**
 * Get monthly limits based on payment method and context
 */
function getMonthlyLimit(
  context: TransactionContext,
  type: TransactionType,
  paymentMethod?: PaymentMethodType,
): number | undefined {
  // M-Pesa has monthly limits
  if (paymentMethod === "mpesa") {
    return 3_000_000; // M-Pesa monthly limit
  }

  return undefined;
}

/**
 * Validate amount against limits
 */
export function validateTransactionAmount(
  amount: number,
  context: TransactionContext,
  type: TransactionType,
  paymentMethod?: PaymentMethodType,
): { isValid: boolean; error?: string } {
  const limits = getTransactionLimits(context, type, paymentMethod);

  if (amount < limits.minAmount) {
    return {
      isValid: false,
      error: `Minimum amount is KES ${limits.minAmount.toLocaleString()}`,
    };
  }

  if (amount > limits.maxAmount) {
    return {
      isValid: false,
      error: `Maximum amount is KES ${limits.maxAmount.toLocaleString()}`,
    };
  }

  return { isValid: true };
}

/**
 * Get user-friendly limit description
 */
export function getLimitDescription(
  context: TransactionContext,
  type: TransactionType,
  paymentMethod?: PaymentMethodType,
): string {
  const limits = getTransactionLimits(context, type, paymentMethod);
  return `KES ${limits.minAmount.toLocaleString()} - KES ${limits.maxAmount.toLocaleString()}`;
}
