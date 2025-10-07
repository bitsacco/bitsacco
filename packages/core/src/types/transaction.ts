/**
 * Unified Transaction Types
 * Core types for the unified transaction system used across all contexts
 */

import { TransactionStatus } from "./lib";
import type { FmLightning, ValidationWarning, Currency } from "./lib";
import type { ChamaTxReview } from "./chama";
import { SharesTxStatus } from "./membership";

// ============================================================================
// Core Types
// ============================================================================

export interface Money {
  value: number;
  currency: Currency;
}

export type TransactionContext = "chama" | "personal" | "membership";

export type PaymentMethodType = "mpesa" | "lightning";

// ============================================================================
// Transaction Status (String literals for UI, with mapping to core enums)
// ============================================================================

export type UnifiedTransactionStatus =
  | "pending"
  | "pending_approval"
  | "approved"
  | "processing"
  | "completed"
  | "failed"
  | "rejected"
  | "expired";

export type UnifiedTransactionType = "deposit" | "withdrawal" | "transfer";

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
  currency?: string;
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
  type: UnifiedTransactionType;
  context: TransactionContext;
  status: UnifiedTransactionStatus;
  amount: Money;
  createdAt: Date;
  updatedAt?: Date;

  // User information
  userId: string;
  userName?: string;

  // Context-specific metadata
  metadata: UnifiedTransactionMetadata;

  // Available actions based on current state and user permissions
  actions: TransactionAction[];
}

export interface UnifiedTransactionMetadata {
  // Personal context
  walletId?: string;
  walletName?: string;
  walletType?: "regular" | "target" | "locked";

  // Chama context
  chamaId?: string;
  chamaName?: string;
  memberId?: string;
  memberName?: string;
  reviews?: ChamaTxReview[];
  hasApproval?: boolean;
  hasRejection?: boolean;
  reviewCount?: number;

  // Membership context
  shareQuantity?: number;
  shareValue?: number;
  shareOfferId?: string;

  // Payment information
  paymentMethod?: PaymentMethodType;
  paymentReference?: string;
  phoneNumber?: string;
  lightningInvoice?: FmLightning;
  mpesaReference?: string;

  // Additional metadata
  reference?: string;
  description?: string;
  category?: string;
  tags?: string[];
  exchangeRate?: number;
  fees?: TransactionFees;
  sharesSubscriptionTracker?: string;
  externalIds?: Record<string, string>;
}

export interface TransactionFees {
  processing?: Money;
  network?: Money;
  exchange?: Money;
  penalty?: Money;
  total: Money;
}

// ============================================================================
// Transaction Requests
// ============================================================================

export interface UnifiedCreateTransactionRequest {
  type: UnifiedTransactionType;
  context: TransactionContext;
  amount: Money;
  targetId: string; // walletId, chamaId, etc.
  paymentMethod?: PaymentMethodType;
  metadata?: Partial<UnifiedTransactionMetadata>;
}

export interface UpdateTransactionRequest {
  id: string;
  context: TransactionContext;
  updates: {
    status?: UnifiedTransactionStatus;
    metadata?: Partial<UnifiedTransactionMetadata>;
  };
}

// ============================================================================
// Transaction Filters
// ============================================================================

export interface TransactionFilter {
  contexts?: TransactionContext[];
  types?: UnifiedTransactionType[];
  statuses?: UnifiedTransactionStatus[];
  userId?: string;
  targetId?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  search?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// Paginated Response
// ============================================================================

export interface PaginatedTransactionQuery {
  page?: number;
  size?: number;
  contexts?: TransactionContext[];
  types?: UnifiedTransactionType[];
  statuses?: UnifiedTransactionStatus[];
}

export interface TransactionEvent {
  type: "created" | "updated" | "deleted";
  transaction: UnifiedTransaction;
  timestamp: Date;
  userId: string;
}

// ============================================================================
// Status Mappings - Convert between core enums and UI strings
// ============================================================================

export const CORE_STATUS_TO_UI_MAP: Record<
  TransactionStatus,
  UnifiedTransactionStatus
> = {
  [TransactionStatus.PENDING]: "pending",
  [TransactionStatus.PROCESSING]: "processing",
  [TransactionStatus.COMPLETE]: "completed",
  [TransactionStatus.FAILED]: "failed",
  [TransactionStatus.MANUAL_REVIEW]: "pending_approval",
  [TransactionStatus.UNRECOGNIZED]: "failed",
};

export const UI_STATUS_TO_CORE_MAP: Record<
  UnifiedTransactionStatus,
  TransactionStatus
> = {
  pending: TransactionStatus.PENDING,
  pending_approval: TransactionStatus.MANUAL_REVIEW,
  approved: TransactionStatus.PROCESSING,
  processing: TransactionStatus.PROCESSING,
  completed: TransactionStatus.COMPLETE,
  failed: TransactionStatus.FAILED,
  rejected: TransactionStatus.FAILED,
  expired: TransactionStatus.FAILED,
};

export const SHARES_STATUS_MAP: Record<
  SharesTxStatus,
  UnifiedTransactionStatus
> = {
  [SharesTxStatus.PROPOSED]: "pending",
  [SharesTxStatus.PROCESSING]: "processing",
  [SharesTxStatus.APPROVED]: "approved",
  [SharesTxStatus.COMPLETE]: "completed",
  [SharesTxStatus.FAILED]: "failed",
  [SharesTxStatus.UNRECOGNIZED]: "failed",
};

// ============================================================================
// Validation Types
// ============================================================================

export interface UnifiedValidationResult {
  valid: boolean;
  errors?: UnifiedValidationError[];
  warnings?: ValidationWarning[];
}

export interface UnifiedValidationError {
  code: string;
  field?: string;
  message: string;
}
