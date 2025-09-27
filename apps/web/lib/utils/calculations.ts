/**
 * Utility functions for calculations in the Personal Savings feature
 */

import {
  PersonalTransactionType,
  PersonalTransactionStatus,
} from "@bitsacco/core";

/**
 * Convert satoshis to KES using current exchange rate
 */
export function satsToKes(sats: number, exchangeRate: number): number {
  const btcAmount = sats / 100000000;
  return Math.round(btcAmount * exchangeRate * 100) / 100; // Round to 2 decimal places
}

/**
 * Calculate progress percentage for target wallets
 */
export function calculateProgress(
  currentAmount: number,
  targetAmount: number,
): number {
  if (targetAmount === 0) return 0;
  return Math.min((currentAmount / targetAmount) * 100, 100);
}

/**
 * Calculate maturity bonus for locked wallets
 */
export function calculateMaturityBonus(
  principal: number,
  bonusRate: number,
  lockPeriodMonths: number,
): number {
  // Simple interest calculation: bonus = principal * rate * (months/12)
  return (principal * bonusRate * lockPeriodMonths) / (100 * 12);
}

/**
 * Calculate early withdrawal penalty
 * TODO: implement reducing penalty rate with time
 */
export function calculateEarlyWithdrawPenalty(
  amount: number,
  penaltyRate: number,
): number {
  return (amount * penaltyRate) / 100;
}

/**
 * Check if locked wallet can be withdrawn from
 */
export function canWithdrawFromLockedWallet(lockEndDate: Date): boolean {
  return new Date() >= lockEndDate;
}

/**
 * Calculate days until wallet matures
 */
export function getDaysUntilMaturity(lockEndDate: Date): number {
  const now = new Date();
  const diffMs = lockEndDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Calculate recommended deposit amount based on target and timeline
 */
export function calculateRecommendedDeposit(
  targetAmount: number,
  currentAmount: number,
  targetDate?: Date,
): {
  daily: number;
  weekly: number;
  monthly: number;
} {
  const remaining = Math.max(0, targetAmount - currentAmount);

  if (!targetDate) {
    // Default to 1 year if no target date
    targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() + 1);
  }

  const now = new Date();
  const daysRemaining = Math.max(
    1,
    Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );
  const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));
  const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));

  return {
    daily: Math.ceil(remaining / daysRemaining),
    weekly: Math.ceil(remaining / weeksRemaining),
    monthly: Math.ceil(remaining / monthsRemaining),
  };
}

/**
 * Validate deposit/withdrawal amount
 */
export function validateAmount(
  amount: number,
  minAmount = 10,
  maxAmount = 70000,
): { isValid: boolean; error?: string } {
  if (amount < minAmount) {
    return {
      isValid: false,
      error: `Minimum amount is KES ${minAmount}`,
    };
  }

  if (amount > maxAmount) {
    return {
      isValid: false,
      error: `Maximum amount is KES ${maxAmount}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate phone number for M-Pesa
 */
export function validatePhoneNumber(phone: string): {
  isValid: boolean;
  error?: string;
} {
  const cleaned = phone.replace(/\D/g, "");

  // Check for valid Kenyan mobile number formats
  const isValid =
    (cleaned.length === 10 && cleaned.startsWith("07")) || // 07XXXXXXXX
    (cleaned.length === 12 && cleaned.startsWith("254")); // 254XXXXXXXXX

  if (!isValid) {
    return {
      isValid: false,
      error: "Please enter a valid Kenyan mobile number",
    };
  }

  return { isValid: true };
}

/**
 * Calculate total savings across all wallets
 */
export function calculateTotalSavings(
  wallets: Array<{ balance: number }>,
): number {
  return wallets.reduce((total, wallet) => total + wallet.balance, 0);
}

/**
 * Calculate average monthly savings
 */
export function calculateAverageMonthlyDeposits(
  transactions: Array<{
    type: PersonalTransactionType;
    amountMsats: number;
    createdAt: Date;
    status: PersonalTransactionStatus;
  }>,
): number {
  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const recentDeposits = transactions.filter(
    (tx) =>
      (tx.type === PersonalTransactionType.DEPOSIT ||
        tx.type === PersonalTransactionType.WALLET_CREATION) &&
      tx.status === PersonalTransactionStatus.COMPLETE &&
      tx.createdAt >= sixMonthsAgo,
  );

  if (recentDeposits.length === 0) return 0;

  const totalDeposits = recentDeposits.reduce(
    (sum, tx) => sum + Math.floor(tx.amountMsats / 1000), // Convert msats to sats
    0,
  );
  const monthsOfData = Math.max(
    1,
    (now.getTime() - sixMonthsAgo.getTime()) / (1000 * 60 * 60 * 24 * 30),
  );

  return totalDeposits / monthsOfData;
}
