// Enhanced payment types to support multiple payment methods

export enum PaymentMethod {
  MPESA = "mpesa",
  LIGHTNING = "lightning",
  BANK_TRANSFER = "bank_transfer",
  CARD = "card",
}

export enum PaymentStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export interface PaymentProvider {
  id: string;
  name: string;
  type: PaymentMethod;
  enabled: boolean;
  icon?: string;
  fees?: PaymentFee;
  limits?: PaymentLimits;
}

export interface PaymentFee {
  type: "fixed" | "percentage";
  amount: number;
  currency: string;
  minimum?: number;
  maximum?: number;
}

export interface PaymentLimits {
  minimum: number;
  maximum: number;
  currency: string;
}

export interface MpesaPaymentDetails {
  phone: string;
  reference?: string;
}

export interface LightningPaymentDetails {
  invoice?: string;
  paymentHash?: string;
}

export interface BankTransferDetails {
  accountNumber: string;
  bankCode: string;
  reference?: string;
}

export interface CardPaymentDetails {
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
}

export type PaymentMethodDetails =
  | MpesaPaymentDetails
  | LightningPaymentDetails
  | BankTransferDetails
  | CardPaymentDetails;

// Specific metadata interfaces based on backend usage
export interface PaymentMetadata {
  userId?: string;
  reference?: string;
  description?: string;
  orderId?: string;
  errorCode?: string;
  customFields?: { [key: string]: string | number | boolean };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  details: PaymentMethodDetails;
  description?: string;
  metadata?: PaymentMetadata;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface PaymentRetryConfig {
  enabled: boolean;
  maxAttempts: number;
  delaySeconds: number;
  backoffMultiplier: number;
}

export interface PaymentConfirmation {
  paymentId: string;
  transactionId?: string;
  transactionHash?: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  receiptUrl?: string;
  shareTransaction?: {
    id: string;
    quantity: number;
    status: string;
    createdAt: string;
  }; // Simplified SharesTx type
  chamaId?: string;
  sharesSubscriptionTracker?: string;
  lightningInvoice?: string;
}

// Request/Response types
export interface CreatePaymentIntentRequest {
  amount: number;
  currency: string;
  method: PaymentMethod;
  details: PaymentMethodDetails;
  description?: string;
  metadata?: PaymentMetadata;
}

export interface PaymentIntentResponse {
  paymentIntent: PaymentIntent;
  clientSecret?: string;
  instructions?: PaymentInstructions;
}

// Specific instruction data interfaces
export interface UssdInstructionData {
  code: string;
  steps: string[];
}

export interface QrInstructionData {
  qrCode: string;
  qrText: string;
}

export interface RedirectInstructionData {
  url: string;
  method: "GET" | "POST";
  parameters?: { [key: string]: string };
}

export interface ManualInstructionData {
  instructions: string[];
  accountDetails?: {
    accountNumber?: string;
    bankCode?: string;
    reference?: string;
  };
}

export type PaymentInstructionData =
  | UssdInstructionData
  | QrInstructionData
  | RedirectInstructionData
  | ManualInstructionData;

export interface PaymentInstructions {
  type: "ussd" | "qr" | "redirect" | "manual";
  data: PaymentInstructionData;
  expiresAt?: string;
}

// Specific confirmation interfaces
export interface MpesaConfirmation {
  transactionCode: string;
  phoneNumber: string;
  amount: number;
}

export interface LightningConfirmation {
  paymentHash: string;
  preimage?: string;
}

export interface BankTransferConfirmation {
  transactionReference: string;
  bankCode: string;
  accountNumber: string;
}

export interface CardConfirmation {
  transactionId: string;
  authorizationCode?: string;
  last4: string;
}

export type PaymentConfirmationData =
  | MpesaConfirmation
  | LightningConfirmation
  | BankTransferConfirmation
  | CardConfirmation;

export interface ProcessPaymentRequest {
  paymentIntentId: string;
  confirmation?: PaymentConfirmationData;
}

export interface RetryPaymentRequest {
  paymentIntentId: string;
  reason?: string;
}

export interface GetPaymentHistoryRequest {
  userId?: string;
  status?: PaymentStatus;
  method?: PaymentMethod;
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
}

export interface PaymentHistoryResponse {
  payments: PaymentIntent[];
  totalCount: number;
  page: number;
  size: number;
  pages: number;
}
