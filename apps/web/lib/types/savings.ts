/**
 * Type definitions for Personal Savings feature
 */

export type WalletType = "DEFAULT" | "TARGET" | "LOCKED";

export type TransactionType = "deposit" | "withdraw";

export type TransactionStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type PaymentMethod = "mpesa" | "lightning";

export interface PersonalWallet {
  id: string;
  userId: string;
  walletType: WalletType;
  name: string;
  balance: number; // in satoshis
  balanceFiat: number; // in KES
  isActive: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  // Type-specific fields
  target?: SavingsTarget;
  locked?: LockedSavings;
}

export interface SavingsTarget {
  targetAmount: number; // in KES cents
  targetDate?: Date;
  progress: number; // percentage (0-100)
  autoDeposit?: {
    amount: number; // in KES
    frequency: "daily" | "weekly" | "monthly";
    isActive: boolean;
  };
}

export interface LockedSavings {
  lockStartDate: Date;
  lockEndDate: Date;
  penaltyRate: number; // percentage
  maturityBonusRate: number; // percentage
  isMatured: boolean;
  canWithdraw: boolean;
  lockPeriodMonths: number;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: TransactionType;
  status: TransactionStatus;
  amountSats: number;
  amountFiat: number; // in KES
  currency: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  lightningInvoice?: string;
  mpesaCheckoutRequestId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

// API Request/Response types
export interface CreateWalletRequest {
  type: WalletType;
  name: string;
  // For TARGET wallets
  targetAmount?: number; // in KES
  targetDate?: string;
  autoDeposit?: {
    amount: number;
    frequency: "daily" | "weekly" | "monthly";
  };
  // For LOCKED wallets
  lockPeriod?: {
    months: number; // 3, 6, 12, 24
    penaltyRate?: number;
    maturityBonus?: number;
  };
}

export interface DepositRequest {
  walletId?: string;
  walletIds?: string[]; // For split deposits
  amount: number; // in KES
  paymentMethod: PaymentMethod;
  phoneNumber?: string; // Required for M-Pesa
  splitType?: "automatic" | "specific";
}

export interface WithdrawRequest {
  walletId: string;
  amount: number; // in KES
  paymentMethod: PaymentMethod;
  phoneNumber?: string; // Required for M-Pesa
  lightningAddress?: string; // Required for Lightning
}

export interface WalletsResponse {
  wallets: PersonalWallet[];
  totalBalance: number; // in sats
  totalBalanceFiat: number; // in KES
}

export interface TransactionsResponse {
  transactions: WalletTransaction[];
  totalCount: number;
  hasMore: boolean;
}

export interface TransactionResponse {
  transaction: WalletTransaction;
  lightningInvoice?: string;
  qrCodeUrl?: string;
}

// Component prop types
export interface WalletCardProps {
  wallet: PersonalWallet;
  onViewDetails: () => void;
}

export interface CreateWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface DepositModalProps {
  wallet?: PersonalWallet;
  wallets?: PersonalWallet[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface WithdrawModalProps {
  wallet?: PersonalWallet;
  wallets?: PersonalWallet[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface TransactionHistoryProps {
  wallets: PersonalWallet[];
  walletId?: string;
}

// Utility types
export interface WalletTypeOption {
  value: WalletType;
  label: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
}

export interface LockPeriodOption {
  value: string;
  label: string;
  months: number;
  bonusRate: number;
  description: string;
}

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: React.ReactNode;
  minAmount?: number;
  maxAmount?: number;
}
