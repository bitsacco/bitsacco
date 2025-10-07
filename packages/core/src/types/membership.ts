import type { PaymentMethod, PaymentStatus } from "./payments";
import type { ValidationError, ValidationWarning } from "./lib";

// Match backend SharesTxStatus exactly from /os/src/common/types/shares.ts
export enum SharesTxStatus {
  PROPOSED = 0,
  PROCESSING = 1,
  APPROVED = 2,
  COMPLETE = 3,
  FAILED = 4,
  UNRECOGNIZED = -1,
}

export enum SharesTxType {
  SUBSCRIPTION = "subscription",
  TRANSFER = "transfer",
  OFFER = "offer",
}

// Enhanced validation rules
export interface ShareValidationRules {
  minPurchaseQuantity: number;
  maxPurchaseQuantity: number;
  requiresKyc: boolean;
  membershipTierRequired?: string;
  geographicRestrictions?: string[];
}

export interface MembershipTier {
  id: string;
  name: string;
  level: number;
  shareRequirements: number;
  benefits: string[];
  restrictions?: ShareValidationRules;
}

export interface SharesOffer {
  id: string;
  /** Number of shares issued */
  quantity: number;
  /** Number of shares subscribed by members */
  subscribedQuantity: number;
  /** Date from which the shares will be available for subscription */
  availableFrom: string;
  /**
   * Date until which the shares will be available for subscription
   * Shares can be sold out before this availability date lapses
   */
  availableTo?: string | undefined;
  createdAt: string;
  updatedAt?: string | undefined;
}

export interface SharesTx {
  id: string;
  userId: string;
  offerId: string;
  quantity: number;
  status: SharesTxStatus;
  transfer?: SharesTxTransferMeta | undefined;
  createdAt: string;
  updatedAt?: string | undefined;
}

export interface SharesPaymentInfo {
  paymentIntentId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  failedAttempts?: number;
  lastAttemptAt?: string;
}

export interface SharesTxTransferMeta {
  fromUserId: string;
  toUserId: string;
  quantity: number;
}

export interface AllSharesOffers {
  offers: SharesOffer[];
  totalOfferQuantity: number;
  totalSubscribedQuantity: number;
}

export interface PaginatedUserSharesTxsResponse {
  transactions: SharesTx[];
  page: number;
  size: number;
  pages: number;
}

export interface UserShareTxsResponse {
  userId: string;
  shareHoldings: number;
  shares: PaginatedUserSharesTxsResponse | undefined;
  offers: AllSharesOffers | undefined;
}

export interface AllSharesTxsResponse {
  shares: PaginatedUserSharesTxsResponse | undefined;
  offers: AllSharesOffers | undefined;
}

// Request types matching backend DTOs exactly
export interface OfferSharesRequest {
  /** Number of shares to issue */
  quantity: number;
  /** Date from which the shares will be available for subscription */
  availableFrom: string;
  /**
   * Date until which the shares will be available for subscription
   * Shares can be sold out before this availability date lapses
   */
  availableTo?: string | undefined;
}

export interface SubscribeSharesRequest {
  userId: string;
  offerId: string;
  quantity: number;
  // Payment fields removed - payment happens separately through chama deposits
}

export interface TransferSharesRequest {
  fromUserId: string;
  toUserId: string;
  sharesId: string;
  quantity: number;
}

export interface SharesTxUpdates {
  quantity?: number | undefined;
  status?: SharesTxStatus | undefined;
  transfer?: SharesTxTransferMeta | undefined;
  offerId?: string | undefined;
}

export interface UpdateSharesRequest {
  sharesId: string;
  updates: SharesTxUpdates | undefined;
}

export interface UserSharesTxsRequest {
  userId: string;
  pagination:
    | {
        page: number;
        size: number;
        status?: string;
        type?: string;
        startDate?: string;
        endDate?: string;
      }
    | undefined;
}

export interface FindShareTxRequest {
  sharesId: string;
}

// Validation and business logic types
export interface SharePurchaseValidation {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  eligibility: UserEligibility;
}

export interface UserEligibility {
  canPurchase: boolean;
  maxQuantity: number;
  currentTier?: MembershipTier;
  nextTier?: MembershipTier;
  kycStatus: "pending" | "approved" | "rejected" | "not_required";
}

// Analytics and insights
export interface SharesAnalytics {
  totalValue: number;
  growth: {
    period: "1M" | "3M" | "6M" | "1Y";
    percentage: number;
    amount: number;
  };
  distribution: {
    tier: string;
    percentage: number;
    quantity: number;
  }[];
  recentActivity: {
    purchases: number;
    transfers: number;
    value: number;
  };
}
