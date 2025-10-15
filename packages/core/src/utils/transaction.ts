/**
 * Pure transaction utilities
 * Platform-agnostic functions that can be used by web and mobile
 */

import type {
  UnifiedTransaction,
  UnifiedTransactionStatus,
  TransactionStatus,
} from "../types";
import { Currency } from "../types";

// ============================================================================
// Type Guards and Predicates
// ============================================================================

export function isDepositTransaction(tx: UnifiedTransaction): boolean {
  return tx.type === "deposit";
}

export function isWithdrawalTransaction(tx: UnifiedTransaction): boolean {
  return tx.type === "withdrawal";
}

export function isChamaTransaction(tx: UnifiedTransaction): boolean {
  return tx.context === "chama";
}

export function isPersonalTransaction(tx: UnifiedTransaction): boolean {
  return tx.context === "personal";
}

export function isMembershipTransaction(tx: UnifiedTransaction): boolean {
  return tx.context === "membership";
}

// ============================================================================
// Status Utilities
// ============================================================================

export function requiresApproval(tx: UnifiedTransaction): boolean {
  return tx.status === "pending_approval";
}

export function canExecute(tx: UnifiedTransaction): boolean {
  return tx.status === "approved";
}

export function isCompleted(tx: UnifiedTransaction): boolean {
  return tx.status === "completed";
}

export function isFailed(tx: UnifiedTransaction): boolean {
  return (
    tx.status === "failed" ||
    tx.status === "rejected" ||
    tx.status === "expired"
  );
}

export function canRetry(tx: UnifiedTransaction): boolean {
  return tx.status === "failed" || tx.status === "expired";
}

// ============================================================================
// Formatting Functions
// ============================================================================

export function getTransactionLabel(tx: UnifiedTransaction): string {
  const typeLabel = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
  const contextLabel = tx.context.charAt(0).toUpperCase() + tx.context.slice(1);
  return `${contextLabel} ${typeLabel}`;
}

export function getStatusColor(status: UnifiedTransactionStatus): string {
  const colors: Record<UnifiedTransactionStatus, string> = {
    pending: "yellow",
    pending_approval: "orange",
    approved: "blue",
    processing: "blue",
    completed: "green",
    failed: "red",
    rejected: "red",
    expired: "gray",
  };
  return colors[status] || "gray";
}

export function getStatusLabel(
  status: UnifiedTransactionStatus | TransactionStatus,
): string {
  // Handle both UnifiedTransactionStatus and TransactionStatus
  const labels: Record<string, string> = {
    // UnifiedTransactionStatus values
    pending: "Pending",
    pending_approval: "Awaiting Approval",
    approved: "Approved",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
    rejected: "Rejected",
    expired: "Expired",
    // Additional TransactionStatus values
    PENDING: "Pending",
    COMPLETED: "Completed",
    FAILED: "Failed",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
  };
  return labels[status] || "Unknown";
}

export function formatTransactionAmount(tx: UnifiedTransaction): string {
  const { value, currency } = tx.amount;

  if (currency === Currency.BTC) {
    return `₿${value.toFixed(8)}`;
  }

  // Handle KES and other currencies
  const currencyCode = currency === Currency.KES ? "KES" : "KES"; // Default to KES
  const formatter = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currencyCode,
  });

  return formatter.format(value);
}
