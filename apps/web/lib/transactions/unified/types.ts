/**
 * Unified Transaction Types
 * Provides a common interface for all transaction types across contexts
 */

import { SharesTxStatus, ChamaTxReview, FmLightning } from "@bitsacco/core";

// ============================================================================
// Core Types
// ============================================================================

export interface Money {
  value: number;
  currency: "KES" | "USD" | "BTC";
}

// Re-use core transaction types with string mappings for UI
export type TransactionType =
  | "deposit"
  | "withdrawal"
  | "subscription"
  | "transfer";
export type TransactionContext = "personal" | "chama" | "membership";

export type TransactionStatus =
  | "pending"
  | "pending_approval" // Chama withdrawals awaiting approval
  | "approved" // Ready to execute
  | "processing" // Payment in progress
  | "completed"
  | "failed"
  | "rejected"
  | "expired";

export type PaymentMethodType = "mpesa" | "lightning";

// ============================================================================
// Transaction Limits
// ============================================================================

export interface TransactionLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  currency: string;
}

// ============================================================================
// Transaction Actions
// ============================================================================

export type ActionType =
  | "approve"
  | "reject"
  | "execute"
  | "cancel"
  | "retry"
  | "view";

export interface TransactionAction {
  type: ActionType;
  enabled: boolean;
  label: string;
  variant?: "primary" | "secondary" | "danger";
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
  handler: () => Promise<void>;
}

// ============================================================================
// Unified Transaction Interface
// ============================================================================

export interface UnifiedTransaction {
  // Core fields
  id: string;
  type: TransactionType;
  context: TransactionContext;
  status: TransactionStatus;
  amount: Money;
  createdAt: Date;
  updatedAt?: Date;

  // User information
  userId: string;
  userName?: string;

  // Context-specific metadata
  metadata: TransactionMetadata;

  // Available actions based on current state and user permissions
  actions: TransactionAction[];
}

export interface TransactionMetadata {
  // Personal context
  walletId?: string;
  walletName?: string;
  walletType?: "regular" | "target" | "locked";

  // Chama context
  chamaId?: string;
  chamaName?: string;
  memberId?: string;
  memberName?: string;
  reviews?: ChamaTxReview[]; // Use core type
  // Simplified approval tracking - backend handles threshold logic
  hasApproval?: boolean; // Any admin has approved
  hasRejection?: boolean; // Any admin has rejected
  reviewCount?: number; // Total number of reviews

  // Membership context
  shareQuantity?: number;
  shareValue?: number;

  // Payment information
  paymentMethod?: PaymentMethodType;
  paymentReference?: string;
  phoneNumber?: string;
  lightningInvoice?: FmLightning;

  // General
  reference?: string;
  description?: string;
  category?: string;
  tags?: string[];
}

// ============================================================================
// Transaction Requests
// ============================================================================

export interface CreateTransactionRequest {
  type: TransactionType;
  context: TransactionContext;
  amount: Money;
  targetId: string; // walletId, chamaId, etc.
  paymentMethod?: PaymentMethodType;
  metadata?: Partial<TransactionMetadata>;
}

export interface UpdateTransactionRequest {
  id: string;
  context: TransactionContext;
  updates: {
    status?: TransactionStatus;
    metadata?: Partial<TransactionMetadata>;
  };
}

// ============================================================================
// Transaction Filters
// ============================================================================

export interface TransactionFilter {
  contexts?: TransactionContext[];
  types?: TransactionType[];
  statuses?: TransactionStatus[];
  userId?: string;
  targetId?: string; // walletId, chamaId, etc.
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  search?: string;
}

// ============================================================================
// Transaction Limits
// ============================================================================

export interface TransactionLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit?: number;
  weeklyLimit?: number;
  monthlyLimit?: number;
  requiresApprovalAbove?: number;
}

// ============================================================================
// Status Mappings
// ============================================================================

export const SHARES_STATUS_MAP: Record<SharesTxStatus, TransactionStatus> = {
  [SharesTxStatus.PROPOSED]: "pending",
  [SharesTxStatus.PROCESSING]: "processing",
  [SharesTxStatus.APPROVED]: "approved",
  [SharesTxStatus.COMPLETE]: "completed",
  [SharesTxStatus.FAILED]: "failed",
  [SharesTxStatus.UNRECOGNIZED]: "failed",
};

// ============================================================================
// Type Guards
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
// Utility Functions
// ============================================================================

export function getTransactionLabel(tx: UnifiedTransaction): string {
  const typeLabel = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
  const contextLabel = tx.context.charAt(0).toUpperCase() + tx.context.slice(1);
  return `${contextLabel} ${typeLabel}`;
}

export function getStatusColor(status: TransactionStatus): string {
  const colors: Record<TransactionStatus, string> = {
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

export function getStatusLabel(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    pending: "Pending",
    pending_approval: "Awaiting Approval",
    approved: "Approved",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
    rejected: "Rejected",
    expired: "Expired",
  };
  return labels[status] || "Unknown";
}

export function formatTransactionAmount(tx: UnifiedTransaction): string {
  const { value, currency } = tx.amount;
  const formatter = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency === "BTC" ? "KES" : currency, // Handle BTC separately
  });

  if (currency === "BTC") {
    return `₿${value.toFixed(8)}`;
  }

  return formatter.format(value);
}

// ============================================================================
// Additional Types for TransactionProvider
// ============================================================================

export interface PaginatedTransactionQuery {
  page?: number;
  size?: number;
  contexts?: TransactionContext[];
  types?: TransactionType[];
  statuses?: TransactionStatus[];
}

export interface TransactionEvent {
  type: "created" | "updated" | "deleted";
  transaction: UnifiedTransaction;
  timestamp: Date;
  userId: string;
}
