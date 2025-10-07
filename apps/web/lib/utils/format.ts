/**
 * Utility functions for formatting values in the Personal Savings feature
 */

import { WalletType, TransactionStatus } from "@bitsacco/core";

/**
 * Format currency amount in KES
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format satoshis with proper comma separation
 */
export function formatSats(sats: number): string {
  return new Intl.NumberFormat("en-US").format(sats) + " sats";
}

/**
 * Format BTC amount
 */
export function formatBTC(sats: number): string {
  const btc = sats / 100000000;
  return (
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 8,
      maximumFractionDigits: 8,
    }).format(btc) + " BTC"
  );
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  // Remove any non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Format as +254 XXX XXX XXX
  if (cleaned.length === 12 && cleaned.startsWith("254")) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  // Format as 07XX XXX XXX
  if (cleaned.length === 10 && cleaned.startsWith("07")) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * Format date relative to now
 */
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString("en-KE", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format time remaining until a future date
 */
export function formatTimeRemaining(endDate: Date): string {
  const now = new Date();
  const diffMs = endDate.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "Matured";
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(
    (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );

  if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    const remainingDays = diffDays % 30;
    return `${months}mo ${remainingDays}d`;
  } else if (diffDays > 0) {
    return `${diffDays}d ${diffHours}h`;
  } else {
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  }
}

/**
 * Format amount input (removes non-numeric characters except decimal)
 */
export function formatAmountInput(value: string): string {
  return value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
}

/**
 * Format transaction status for display
 */
export function formatTransactionStatus(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.PENDING:
      return "Pending";
    case TransactionStatus.PROCESSING:
      return "Processing";
    case TransactionStatus.COMPLETE:
      return "Completed";
    case TransactionStatus.FAILED:
      return "Failed";
    case TransactionStatus.MANUAL_REVIEW:
      return "Manual Review";
    case TransactionStatus.UNRECOGNIZED:
    default:
      return "Unknown";
  }
}

/**
 * Format wallet type for display
 */
export function formatWalletType(type: WalletType): string {
  switch (type) {
    case WalletType.STANDARD:
      return "Standard Savings";
    case WalletType.TARGET:
      return "Savings Target";
    case WalletType.LOCKED:
      return "Locked Savings";
    default:
      return type;
  }
}
