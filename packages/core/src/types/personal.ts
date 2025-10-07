import type { FmLightning, TransactionStatus, TransactionType } from "./lib";

// Types copied from backend for consistency - DO NOT modify without updating backend
export enum WalletType {
  STANDARD = "STANDARD", // Regular savings wallet (default)
  TARGET = "TARGET", // Goal-based savings
  LOCKED = "LOCKED", // Time-locked savings
}

export enum LockPeriod {
  ONE_MONTH = "ONE_MONTH",
  THREE_MONTHS = "THREE_MONTHS",
  SIX_MONTHS = "SIX_MONTHS",
  ONE_YEAR = "ONE_YEAR",
  CUSTOM = "CUSTOM",
}

// Wallet configuration interfaces
export interface WalletConfig {
  walletType: WalletType;
  walletName?: string;
  tags?: string[];
  category?: string;
  notes?: string;
}

export interface TargetWalletConfig extends WalletConfig {
  walletType: WalletType.TARGET;
  targetAmountMsats?: number;
  targetAmountFiat?: number;
  targetDate?: Date;
}

export interface LockedWalletConfig extends WalletConfig {
  walletType: WalletType.LOCKED;
  lockPeriod: LockPeriod;
  lockEndDate?: Date;
  autoRenew?: boolean;
  penaltyRate?: number;
}

export interface WalletProgress {
  currentAmountMsats: number;
  currentAmountFiat?: number;
  targetAmountMsats?: number;
  targetAmountFiat?: number;
  progressPercentage: number;
  milestoneReached: Date[];
  projectedCompletionDate?: Date;
}

export interface LockInfo {
  lockPeriod: LockPeriod;
  lockEndDate: Date;
  isLocked: boolean;
  autoRenew: boolean;
  penaltyRate: number;
  canWithdrawEarly: boolean;
  daysRemaining: number;
}

// Update DTOs matching backend
export interface UpdateTargetDto {
  targetAmountMsats?: number;
  targetAmountFiat?: number;
  targetDate?: Date;
}

export interface UpdateLockedWalletDto {
  autoRenew?: boolean;
  penaltyRate?: number;
}

export interface EarlyWithdrawDto {
  amount: number;
  acceptPenalty: boolean;
}

export interface RenewLockDto {
  autoRenew?: boolean;
  penaltyRate?: number;
}

// Response DTOs
export interface TargetProgressResponseDto {
  currentAmount: number;
  targetAmount: number;
  progressPercentage: number;
  remainingAmount: number;
  targetDate?: Date;
  projectedCompletionDate?: Date;
  daysRemaining?: number;
  milestoneReached: Date[];
  recommendedDailySavings?: number;
}

export interface LockStatusResponseDto {
  isLocked: boolean;
  lockPeriod: LockPeriod;
  lockEndDate: Date;
  daysRemaining: number;
  autoRenew: boolean;
  penaltyRate?: number;
  canWithdrawEarly: boolean;
  earlyWithdrawalPenalty?: number;
}

export interface EarlyWithdrawResponseDto {
  withdrawnAmount: number;
  penaltyAmount: number;
  netAmount: number;
  remainingBalance: number;
  transactionReference: string;
}

// Analytics DTOs
export interface WalletAnalyticsDto {
  totalBalance: number;
  totalSavings: number;
  totalLocked: number;
  totalTargets: number;
  averageMonthlyGrowth: number;
  goalCompletionRate: number;
  portfolioDistribution: {
    standard: number;
    target: number;
    locked: number;
  };
  walletBreakdown?: {
    walletId: string;
    walletName: string;
    walletType: string;
    balance: number;
    portfolioPercentage: number;
    progressPercentage?: number;
    daysUntilUnlock?: number;
  }[];
}

// UserAnalyticsDto is an alias for WalletAnalyticsDto for now
export type UserAnalyticsDto = WalletAnalyticsDto;

// Transaction response types
export interface DepositWithdrawResponseDto {
  id?: string;
  transactionId?: string;
  status?: string;
  reference?: string;
  lightningInvoice?: string;
  qrCodeUrl?: string;
  mpesaCheckoutRequestId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// DTOs from backend
export interface CreateWalletDto {
  walletType: WalletType;
  walletName: string;
  targetAmountMsats?: number;
  targetDate?: string;
  lockPeriod?: number;
  lockEndDate?: string;
  autoRenew?: boolean;
  penaltyRate?: number;
}

export interface UpdateWalletDto {
  walletName?: string;
  targetAmountMsats?: number;
  targetDate?: string;
  autoRenew?: boolean;
}

export interface WalletResponseDto {
  walletId: string;
  userId: string;
  walletType: WalletType;
  walletName?: string;
  balance: number;
  tags?: string[];
  category?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  progress?: WalletProgress;
  lockInfo?: LockInfo;
  isDefaultWallet?: boolean;
}

export interface WalletListResponseDto {
  wallets: WalletResponseDto[];
  total: number;
  totalBalance: number;
}

export interface TargetResponseDto {
  currentAmount: number;
  targetAmount: number;
  progressPercentage: number;
  remainingAmount: number;
  targetDate?: Date;
  milestoneReached: string[];
}

export interface LockedWalletResponseDto {
  walletId: string;
  userId: string;
  walletType: WalletType;
  walletName: string;
  balance: number;
  lockPeriod: number;
  lockEndDate: Date;
  autoRenew: boolean;
  penaltyRate?: number;
  lockInfo: {
    lockPeriod: number;
    lockEndDate: Date;
    isLocked: boolean;
    autoRenew: boolean;
    penaltyRate: number;
    canWithdrawEarly: boolean;
    daysRemaining: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Transaction types for personal wallets
export interface WalletTransaction {
  id: string;
  walletId: string;
  walletName: string;
  userId: string;
  type: TransactionType;
  amountMsats: number; // Backend returns millisats
  amountFiat: number;
  status: TransactionStatus;
  paymentReference?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionHistoryResponse {
  transactions: WalletTransaction[];
  pagination: {
    page: number;
    size: number;
    totalCount: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface WalletQueryDto {
  walletType?: WalletType;
  category?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

// Core transaction types from backend
export interface SolowalletTx {
  id: string;
  userId: string;
  status: number; // TransactionStatus enum
  amountMsats: number;
  amountFiat?: number;
  lightning?: FmLightning; // Object, not JSON string
  type: number; // TransactionType enum
  reference?: string;
  failureReason?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Paginated response for transactions
export interface PaginatedSolowalletTxsResponse {
  transactions: SolowalletTx[];
  page: number;
  size: number;
  pages: number;
}

// Wallet metadata from backend
export interface WalletMeta {
  totalDeposits: number;
  totalWithdrawals: number;
  currentBalance: number;
}

// Main response type for deposit/withdraw operations
export interface UserTxsResponse {
  txId?: string;
  ledger: PaginatedSolowalletTxsResponse | undefined;
  meta?: WalletMeta;
  userId: string;
}
