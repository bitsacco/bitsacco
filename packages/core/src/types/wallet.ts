// Import backend types to avoid conflicts (prefixed with _ to indicate they're for reference only)
import type {
  TransactionStatus as _BackendTransactionStatus,
  TransactionType as _BackendTransactionType,
} from "./lib";

// Transaction metadata specific to wallet operations
export interface TransactionMetadata {
  chamaId?: string;
  shareTransactionId?: string;
  paymentMethodId?: string;
  reference?: string;
  exchangeRate?: number;
  fees?: {
    processing?: number;
    network?: number;
    exchange?: number;
  };
  externalIds?: {
    providerId?: string;
    batchId?: string;
    confirmationNumber?: string;
  };
}

export interface Transaction {
  id: string;
  userId: string;
  chamaId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description?: string;
  metadata?: TransactionMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// Frontend-specific transaction types (extending backend types)
export enum TransactionType {
  Deposit = "deposit",
  Withdraw = "withdraw",
  SharePurchase = "share_purchase",
  ShareTransfer = "share_transfer",
  ChamaContribution = "chama_contribution",
  ChamaWithdrawal = "chama_withdrawal",
}

// Frontend-specific transaction status (extending backend types)
export enum TransactionStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Failed = "failed",
  Cancelled = "cancelled",
}

export interface CreateTransactionRequest {
  type: TransactionType;
  amount: number;
  chamaId?: string;
  description?: string;
  metadata?: TransactionMetadata;
}

export interface WalletBalance {
  userId: string;
  chamaId?: string;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  lastUpdated: Date;
}

export interface GetTransactionsRequest {
  chamaId?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}
