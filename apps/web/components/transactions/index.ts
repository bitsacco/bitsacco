/**
 * Unified Transaction System Exports
 * Central export point for all transaction-related components and utilities
 */

// Core Components
export { TransactionCard } from "./TransactionCard";
export { TransactionModal } from "./TransactionModal";
export { TransactionHistory } from "./TransactionHistory";
export { TransactionDashboard } from "./TransactionDashboard";

// Specialized Components
export { ApprovalWorkflow } from "./ApprovalWorkflow";
export { PaymentMethodSelector } from "./PaymentMethodSelector";
export {
  ErrorDisplay,
  NetworkError,
  ValidationError,
  TransactionError,
  InsufficientFundsError,
} from "./ErrorDisplay";

// Legacy Components (for backward compatibility)
export { WithdrawalApprovalStatus } from "./WithdrawalApprovalStatus";

// Types (re-export from unified types)
export type {
  UnifiedTransaction,
  TransactionAction,
  TransactionStatus,
  TransactionType,
  TransactionContext,
  Money,
  PaymentMethodType,
  TransactionMetadata,
  TransactionFilter,
  CreateTransactionRequest,
  TransactionLimits,
} from "@/lib/transactions/unified/types";

// Hooks and Providers
export {
  TransactionProvider,
  useTransactions,
  useChamaTransactions,
  usePendingApprovals,
} from "@/lib/transactions/unified/TransactionProvider";

export {
  TransactionStatusMonitor,
  useTransactionMonitor,
} from "@/lib/transactions/unified/TransactionStatusMonitor";

// Adapters
export { ChamaTransactionAdapter } from "@/lib/transactions/unified/adapters/chama-adapter";

// Utility Functions
export {
  formatTransactionAmount,
  getStatusColor,
  getStatusLabel,
  isDepositTransaction,
  isWithdrawalTransaction,
  isChamaTransaction,
  requiresApproval,
  canExecute,
  isCompleted,
  isFailed,
  canRetry,
  getTransactionLabel,
} from "@/lib/transactions/unified/types";
