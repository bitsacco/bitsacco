/**
 * Core types for the unified transaction system
 */

// ============================================================================
// Core Transaction Types
// ============================================================================

export type TransactionMode = "deposit" | "withdraw";

export type TransactionContext = "membership" | "personal" | "chama";

export type PaymentMethodType =
  | "mpesa"
  | "lightning"
  | "bank_transfer"
  | "card";

export interface Money {
  amount: number;
  currency: "KES" | "USD" | "BTC";
}

export interface TransactionLimits {
  min: Money;
  max: Money;
  daily?: Money;
  monthly?: Money;
}

// ============================================================================
// Transaction Core
// ============================================================================

export interface Transaction {
  id: string;
  mode: TransactionMode;
  context: TransactionContext;
  status: TransactionStatus;
  amount: Money;
  paymentMethod: PaymentMethodType;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // References
  userId: string;
  contextId?: string; // chamaId, walletId, etc.
  paymentIntentId?: string;

  // Metadata
  metadata?: TransactionMetadata;

  // Error info
  error?: TransactionError;
}

export interface TransactionMetadata {
  // Context specific
  walletId?: string;
  walletName?: string;
  chamaId?: string;
  chamaName?: string;
  shareQuantity?: number;
  shareOfferId?: string;

  // Payment specific
  phoneNumber?: string;
  lightningInvoice?: string;
  mpesaReference?: string;

  // Additional
  reference?: string;
  description?: string;
  exchangeRate?: number;
  fees?: TransactionFees;

  // Tracking
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

export enum TransactionStatus {
  // Initial states
  DRAFT = "draft",
  VALIDATING = "validating",

  // Processing states
  PENDING = "pending",
  PROCESSING = "processing",
  CONFIRMING = "confirming",

  // Final states
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",

  // Special states
  MANUAL_REVIEW = "manual_review",
  PARTIALLY_COMPLETED = "partially_completed",
}

// ============================================================================
// Transaction Creation
// ============================================================================

export interface CreateTransactionParams {
  mode: TransactionMode;
  context: TransactionContext;
  contextId?: string;
  amount: Money;
  paymentMethod?: PaymentMethodType;
  metadata?: Partial<TransactionMetadata>;
}

export interface PreparedTransaction extends Transaction {
  paymentIntent?: PaymentIntent;
  validationResult: ValidationResult;
  estimatedFees?: TransactionFees;
}

// ============================================================================
// Payment Method Types
// ============================================================================

export interface PaymentMethod {
  id: PaymentMethodType;
  name: string;
  description: string;
  icon: string; // Icon name or component reference

  // Capabilities
  supports: {
    deposit: boolean;
    withdraw: boolean;
    instant: boolean;
    scheduled: boolean;
  };

  // Configuration
  limits: TransactionLimits;

  // Processing info
  processingTime: string; // e.g., "Instant", "2-5 minutes"
  fees?: string; // e.g., "Standard M-Pesa rates"

  // Availability
  enabled: boolean;
  availableCountries?: string[];

  // Requirements
  requiredFields?: PaymentFieldRequirement[];
}

export interface PaymentFieldRequirement {
  field: string;
  label: string;
  type: "text" | "tel" | "email" | "number";
  validation?: {
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
  };
  placeholder?: string;
  helperText?: string;
}

export interface PaymentIntent {
  id: string;
  transactionId: string;
  amount: Money;
  method: PaymentMethodType;
  status: PaymentStatus;

  // Payment details
  details: Record<string, unknown>;

  // Provider specific
  providerReference?: string;
  providerResponse?: Record<string, unknown>;

  // Timestamps
  createdAt: Date;
  expiresAt?: Date;

  // Instructions
  instructions?: PaymentInstructions;
}

export interface PaymentInstructions {
  type: "push" | "pull" | "manual";
  steps?: string[];
  qrCode?: string;
  invoice?: string;
  reference?: string;
  timeout?: number;
}

export enum PaymentStatus {
  CREATED = "created",
  INITIATED = "initiated",
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

// ============================================================================
// Context Configuration
// ============================================================================

export interface TransactionContextConfig {
  id: TransactionContext;
  name: string;
  description?: string;

  // Supported operations
  supports: {
    deposit: boolean;
    withdraw: boolean;
    transfer?: boolean;
  };

  // API configuration
  endpoints: {
    create: string;
    status?: string;
    cancel?: string;
    retry?: string;
    history?: string;
  };

  // Validation rules
  rules?: ValidationRule[];

  // UI customization
  ui?: {
    title?: string;
    icon?: string;
    theme?: Partial<ThemeConfig>;
    labels?: Record<string, string>;
  };

  // Hooks
  hooks?: TransactionHooks;
}

export interface TransactionHooks {
  beforeCreate?: (
    params: CreateTransactionParams,
  ) => Promise<CreateTransactionParams>;
  afterCreate?: (transaction: Transaction) => Promise<void>;
  onStatusChange?: (
    transaction: Transaction,
    oldStatus: TransactionStatus,
  ) => void;
  onComplete?: (transaction: Transaction) => void;
  onError?: (error: TransactionError) => void;
}

// ============================================================================
// Validation
// ============================================================================

export interface ValidationRule {
  field: string;
  type: "required" | "min" | "max" | "pattern" | "custom";
  value?: unknown;
  message: string;
  validator?: (value: unknown, transaction: Transaction) => boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  canProceed: boolean;
}

// ============================================================================
// Error Handling
// ============================================================================

export enum TransactionErrorCode {
  // Validation
  INVALID_AMOUNT = "INVALID_AMOUNT",
  AMOUNT_TOO_LOW = "AMOUNT_TOO_LOW",
  AMOUNT_TOO_HIGH = "AMOUNT_TOO_HIGH",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  INVALID_PAYMENT_METHOD = "INVALID_PAYMENT_METHOD",
  INVALID_PHONE_NUMBER = "INVALID_PHONE_NUMBER",

  // Network
  NETWORK_ERROR = "NETWORK_ERROR",
  TIMEOUT = "TIMEOUT",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",

  // Payment
  PAYMENT_FAILED = "PAYMENT_FAILED",
  PAYMENT_CANCELLED = "PAYMENT_CANCELLED",
  PAYMENT_EXPIRED = "PAYMENT_EXPIRED",
  PAYMENT_DECLINED = "PAYMENT_DECLINED",

  // Business logic
  LIMIT_EXCEEDED = "LIMIT_EXCEEDED",
  DUPLICATE_TRANSACTION = "DUPLICATE_TRANSACTION",
  UNAUTHORIZED = "UNAUTHORIZED",
  ACCOUNT_LOCKED = "ACCOUNT_LOCKED",
  KYC_REQUIRED = "KYC_REQUIRED",

  // System
  INTERNAL_ERROR = "INTERNAL_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface TransactionError {
  code: TransactionErrorCode;
  message: string;
  details?: Record<string, unknown>;
  recoverable: boolean;
  retryable: boolean;
  userAction?: string;
  technicalDetails?: string;
}

// ============================================================================
// UI Configuration
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
// Transaction Results
// ============================================================================

export interface TransactionResult {
  success: boolean;
  transaction: Transaction;
  receipt?: TransactionReceipt;
  nextActions?: NextAction[];
}

export interface TransactionReceipt {
  id: string;
  transactionId: string;
  timestamp: Date;
  amount: Money;
  fees?: TransactionFees;
  reference: string;
  status: TransactionStatus;
  provider?: string;
  providerReference?: string;
  downloadUrl?: string;
}

export interface NextAction {
  type: "verify_otp" | "complete_kyc" | "retry_payment" | "contact_support";
  description: string;
  url?: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// Monitoring & Analytics
// ============================================================================

export interface TransactionMonitor {
  transactionId: string;
  subscribe: (callback: (status: TransactionStatus) => void) => () => void;
  getStatus: () => Promise<TransactionStatus>;
  cancel: () => Promise<void>;
  retry: () => Promise<void>;
}

export interface TransactionStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  totalVolume: Money;
  averageAmount: Money;
  successRate: number;
  averageProcessingTime: number;
}

// ============================================================================
// Provider Interfaces
// ============================================================================

export interface TransactionProvider {
  // Transaction management
  createTransaction: (params: CreateTransactionParams) => Promise<Transaction>;
  getTransaction: (id: string) => Promise<Transaction | null>;
  updateTransaction: (
    id: string,
    updates: Partial<Transaction>,
  ) => Promise<Transaction>;
  cancelTransaction: (id: string) => Promise<void>;
  retryTransaction: (id: string) => Promise<Transaction>;

  // Status monitoring
  monitorTransaction: (
    id: string,
    callback: (transaction: Transaction) => void,
  ) => () => void;
  getTransactionStatus: (id: string) => Promise<TransactionStatus>;

  // History
  getTransactionHistory: (filter?: TransactionFilter) => Promise<Transaction[]>;

  // Queue management
  queueTransaction: (params: CreateTransactionParams) => void;
  processQueue: () => Promise<void>;

  // State
  activeTransaction: Transaction | null;
  isProcessing: boolean;
  error: TransactionError | null;
}

export interface TransactionFilter {
  mode?: TransactionMode;
  context?: TransactionContext;
  status?: TransactionStatus;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: PaymentMethodType;
}

// ============================================================================
// Adapter Interfaces
// ============================================================================

export interface PaymentMethodAdapter {
  id: PaymentMethodType;

  // Validation
  validate(params: PaymentParams): Promise<ValidationResult>;

  // Payment flow
  initiate(transaction: Transaction): Promise<PaymentIntent>;
  confirm(intent: PaymentIntent): Promise<PaymentResult>;
  cancel(intent: PaymentIntent): Promise<void>;

  // Status
  getStatus(intentId: string): Promise<PaymentStatus>;

  // UI
  renderForm?: (props: PaymentFormProps) => React.ReactElement;
  renderConfirmation?: (props: PaymentConfirmationProps) => React.ReactElement;
}

export interface PaymentParams {
  amount: Money;
  method: PaymentMethodType;
  details: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  status: PaymentStatus;
  reference?: string;
  details?: Record<string, unknown>;
  error?: TransactionError;
}

export interface PaymentFormProps {
  amount: Money;
  onSubmit: (details: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: TransactionError;
}

export interface PaymentConfirmationProps {
  intent: PaymentIntent;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

// ============================================================================
// Context Adapter
// ============================================================================

export interface ContextAdapter {
  id: TransactionContext;

  // Configuration
  getConfig(): TransactionContextConfig;

  // Validation
  validateTransaction(transaction: Transaction): Promise<ValidationResult>;

  // API calls
  createDeposit(params: DepositParams): Promise<Transaction>;
  createWithdrawal(params: WithdrawalParams): Promise<Transaction>;
  getTransactionStatus(id: string): Promise<TransactionStatus>;

  // Context-specific data
  getContextData(contextId: string): Promise<ContextData>;
}

export interface DepositParams {
  contextId: string;
  amount: Money;
  paymentMethod: PaymentMethodType;
  paymentDetails: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface WithdrawalParams {
  contextId: string;
  amount: Money;
  paymentMethod: PaymentMethodType;
  destination: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface ContextData {
  id: string;
  name: string;
  type: TransactionContext;
  balance?: Money;
  limits?: TransactionLimits;
  metadata?: Record<string, unknown>;
}
