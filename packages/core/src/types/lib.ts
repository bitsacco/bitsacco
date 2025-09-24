// Core enums matching backend implementation exactly
export enum TransactionStatus {
  PENDING = 0,
  PROCESSING = 1,
  FAILED = 2,
  COMPLETE = 3,
  MANUAL_REVIEW = 4,
  UNRECOGNIZED = -1,
}

export enum TransactionType {
  DEPOSIT = 0,
  WITHDRAW = 1,
  UNRECOGNIZED = -1,
}

export enum Currency {
  BTC = 0,
  KES = 1,
  UNRECOGNIZED = -1,
}

// Pagination and request types
export interface PaginatedRequest {
  /** Page offset to start from */
  page: number;
  /** Number of items to be return per page */
  size: number;
}

// API response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ValidationError {
  code: string;
  field: string;
  message: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  canProceed: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errors?: ValidationError[];
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  size: number;
  pages: number;
  total: number;
}

// Swap related types from backend
export interface MobileMoney {
  /** Phone number for the mobile money offramp */
  phone: string;
}

export interface Bolt11 {
  /** Bolt11 lightning invoice */
  invoice: string;
}

export interface FmLightning {
  invoice?: string | undefined;
  operationId?: string | undefined;
  lnurlWithdrawPoint?: LnUrlWithdrawPoint | undefined;
}

/**
 * Message returned as `FmLightning`
 * when a user want's to withdraw from Bitsacco wallet via LNURL
 *
 * REF: https://github.com/lnurl/luds/blob/luds/03.md step 3
 */
export interface LnUrlWithdrawPoint {
  /** The LNURL bech32 encoded string to be encoded as QR code */
  lnurl: string;
  /** Key used for withdrawal (k1 parameter) */
  k1: string;
  /** URL that will handle the withdrawal callback */
  callback: string;
  /** When the withdrawal request expires (Unix timestamp) */
  expiresAt?: number | undefined;
}

export interface OnrampSwapSource {
  /** Currency code for the target currency */
  currency: Currency;
  /** Target destination */
  origin: MobileMoney | undefined;
}

export interface OnrampSwapTarget {
  /** Lightning protocol payout */
  payout: Bolt11 | undefined;
}

export interface OfframpSwapTarget {
  /** Currency code for the target currency */
  currency: Currency;
  /** Mobile money payout destination */
  payout: MobileMoney | undefined;
}

export interface FindTxRequest {
  txId: string;
  userId?: string | undefined;
}
