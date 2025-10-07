/**
 * Legacy Transaction Types
 * These types are being phased out in favor of @bitsacco/core unified types
 * Only keeping web-specific UI configuration and provider interfaces
 */

import type {
  UnifiedTransaction,
  UnifiedTransactionStatus,
  Money,
  TransactionFilter,
  UnifiedCreateTransactionRequest,
} from "@bitsacco/core";

// ============================================================================
// UI Configuration (Web-specific)
// ============================================================================

export interface ThemeConfig {
  primary: string;
  secondary: string;
  accent: string;
  error: string;
  warning: string;
  success: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

export interface TransactionUIConfig {
  showProgress?: boolean;
  showDetails?: boolean;
  showFees?: boolean;
  showExchangeRate?: boolean;
  allowCancel?: boolean;
  allowRetry?: boolean;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

// ============================================================================
// Provider Interfaces (Web-specific implementations)
// ============================================================================

export interface TransactionProvider {
  // Transaction management
  createTransaction: (
    params: UnifiedCreateTransactionRequest,
  ) => Promise<UnifiedTransaction>;
  getTransaction: (id: string) => Promise<UnifiedTransaction | null>;
  updateTransaction: (
    id: string,
    updates: Partial<UnifiedTransaction>,
  ) => Promise<UnifiedTransaction>;
  cancelTransaction: (id: string) => Promise<void>;
  retryTransaction: (id: string) => Promise<UnifiedTransaction>;

  // Status monitoring
  monitorTransaction: (
    id: string,
    callback: (transaction: UnifiedTransaction) => void,
  ) => () => void;
  getTransactionStatus: (id: string) => Promise<UnifiedTransactionStatus>;

  // History
  getTransactionHistory: (
    filter?: TransactionFilter,
  ) => Promise<UnifiedTransaction[]>;

  // Queue management
  queueTransaction: (params: UnifiedCreateTransactionRequest) => void;
  processQueue: () => Promise<void>;

  // State
  activeTransaction: UnifiedTransaction | null;
  isProcessing: boolean;
  error: Error | null;
}

// ============================================================================
// Payment Form Props (Web-specific UI)
// ============================================================================

export interface PaymentFormProps {
  amount: Money;
  onSubmit: (details: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: Error;
}

export interface PaymentConfirmationProps {
  transaction: UnifiedTransaction;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}
