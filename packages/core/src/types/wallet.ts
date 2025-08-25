export interface Transaction {
  id: string;
  userId: string;
  chamaId?: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  description?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export enum TransactionType {
  Deposit = "deposit",
  Withdraw = "withdraw",
  SharePurchase = "share_purchase",
  ShareTransfer = "share_transfer",
  ChamaContribution = "chama_contribution",
  ChamaWithdrawal = "chama_withdrawal",
}

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
  metadata?: Record<string, unknown>;
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
