import { BaseApiClient } from "./base-client";
import type { ApiResponse } from "../types/lib";
import type {
  SharesTx,
  AllSharesOffers,
  UserShareTxsResponse,
  OfferSharesRequest,
  SubscribeSharesRequest,
  TransferSharesRequest,
  UpdateSharesRequest,
  UserSharesTxsRequest,
  FindShareTxRequest,
  // SharePurchaseValidation, // Currently unused
  SharesAnalytics,
  MembershipTier,
} from "../types/membership";
import type {
  PaymentProvider,
  CreatePaymentIntentRequest,
  PaymentIntentResponse,
  ProcessPaymentRequest,
  RetryPaymentRequest,
  PaymentConfirmation,
  GetPaymentHistoryRequest,
  PaymentHistoryResponse,
  PaymentIntent,
} from "../types/payments";

export class MembershipApiClient extends BaseApiClient {
  /**
   * Create a share offer
   */
  async offerShares(
    request: OfferSharesRequest,
  ): Promise<ApiResponse<AllSharesOffers>> {
    return this.post<AllSharesOffers>("/shares/offer", request);
  }

  /**
   * Get all share offers
   */
  async getShareOffers(): Promise<ApiResponse<AllSharesOffers>> {
    return this.get<AllSharesOffers>("/shares/offers");
  }

  /**
   * Subscribe to shares (purchase)
   */
  async subscribeShares(
    request: SubscribeSharesRequest,
  ): Promise<ApiResponse<UserShareTxsResponse>> {
    return this.post<UserShareTxsResponse>("/shares/subscribe", request);
  }

  /**
   * Transfer shares between users
   */
  async transferShares(
    request: TransferSharesRequest,
  ): Promise<ApiResponse<UserShareTxsResponse>> {
    return this.post<UserShareTxsResponse>("/shares/transfer", request);
  }

  /**
   * Update share transaction
   */
  async updateSharesTx(
    request: UpdateSharesRequest,
  ): Promise<ApiResponse<SharesTx>> {
    return this.patch<SharesTx>(
      `/shares/transactions/${request.sharesId}`,
      request.updates,
    );
  }

  /**
   * Get user's share transactions
   */
  async getUserSharesTxs(
    request: UserSharesTxsRequest,
  ): Promise<ApiResponse<UserShareTxsResponse>> {
    const params: Record<string, string | number> = {};

    if (request.pagination?.page !== undefined) {
      params.page = request.pagination.page;
    }

    if (request.pagination?.size !== undefined) {
      params.size = request.pagination.size;
    }

    return this.get<UserShareTxsResponse>(
      `/shares/transactions/${request.userId}`,
      params,
    );
  }

  /**
   * Find specific share transaction
   */
  async findShareTx(
    request: FindShareTxRequest,
  ): Promise<ApiResponse<SharesTx>> {
    return this.get<SharesTx>(`/shares/transactions/find/${request.sharesId}`);
  }

  /**
   * Delete share transaction
   */
  async deleteShareTx(sharesId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/shares/transactions/${sharesId}`);
  }

  // Payment Methods
  /**
   * Get available payment providers
   */
  async getPaymentProviders(): Promise<ApiResponse<PaymentProvider[]>> {
    return this.get<PaymentProvider[]>("/payments/providers");
  }

  /**
   * Create payment intent for share purchase
   */
  async createPaymentIntent(
    request: CreatePaymentIntentRequest,
  ): Promise<ApiResponse<PaymentIntentResponse>> {
    return this.post<PaymentIntentResponse>("/payments/intents", request);
  }

  /**
   * Process payment
   */
  async processPayment(
    request: ProcessPaymentRequest,
  ): Promise<ApiResponse<PaymentConfirmation>> {
    return this.post<PaymentConfirmation>("/payments/process", request);
  }

  /**
   * Retry failed payment
   */
  async retryPayment(
    request: RetryPaymentRequest,
  ): Promise<ApiResponse<PaymentIntentResponse>> {
    return this.post<PaymentIntentResponse>("/payments/retry", request);
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(
    request: GetPaymentHistoryRequest,
  ): Promise<ApiResponse<PaymentHistoryResponse>> {
    const params: Record<string, string | number> = {};

    if (request.status) params.status = request.status;
    if (request.method) params.method = request.method;
    if (request.page !== undefined) params.page = request.page;
    if (request.size !== undefined) params.size = request.size;
    if (request.startDate) params.startDate = request.startDate;
    if (request.endDate) params.endDate = request.endDate;

    const path = request.userId
      ? `/payments/history/${request.userId}`
      : "/payments/history";

    return this.get<PaymentHistoryResponse>(path, params);
  }

  /**
   * Get payment status by payment intent ID
   */
  async getPaymentStatus(
    paymentIntentId: string,
  ): Promise<ApiResponse<PaymentIntent>> {
    return this.get<PaymentIntent>(`/payments/status/${paymentIntentId}`);
  }

  // Enhanced Features
  // validateSharePurchase method removed - backend endpoint doesn't exist
  // Validation is now handled client-side in the Next.js API route

  /**
   * Get user's shares analytics
   */
  async getSharesAnalytics(
    userId: string,
  ): Promise<ApiResponse<SharesAnalytics>> {
    return this.get<SharesAnalytics>(`/shares/analytics/${userId}`);
  }

  /**
   * Get membership tiers
   */
  async getMembershipTiers(): Promise<ApiResponse<MembershipTier[]>> {
    return this.get<MembershipTier[]>("/membership/tiers");
  }

  /**
   * Get user's current membership tier
   */
  async getUserMembershipTier(
    userId: string,
  ): Promise<ApiResponse<MembershipTier | null>> {
    return this.get<MembershipTier | null>(`/membership/tiers/${userId}`);
  }
}
