/**
 * Membership service for web application
 * Legacy service file - types updated for compatibility
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseApiClient } from "./base-client";
import type {
  ApiResponse,
  PaymentProvider,
  // MembershipShare, // Not available in core
  // ShareSubscriptionRequest, // Not available in core
  // ShareSubscriptionResponse, // Not available in core
  // SharePaymentIntent, // Not available in core
  // SharePayment, // Not available in core
  // ShareTransaction, // Not available in core
  // ShareTransfer, // Not available in core
  // CreateShareTransferRequest, // Not available in core
  // MembershipTier, // Not available in core
  // MembershipStats, // Not available in core
} from "@bitsacco/core";

export class MembershipService extends BaseApiClient {
  /**
   * Get available membership shares
   */
  async getAvailableShares(): Promise<ApiResponse<any[]>> {
    return this.get<any[]>("/membership/shares");
  }

  /**
   * Get my membership shares
   */
  async getMyShares(): Promise<ApiResponse<any[]>> {
    return this.get<any[]>("/membership/shares/my");
  }

  /**
   * Subscribe to membership shares
   */
  async subscribeToShares(request: any): Promise<ApiResponse<any>> {
    return this.post<any>("/membership/shares/subscribe", request);
  }

  /**
   * Create a payment intent for share purchase
   */
  async createPaymentIntent(
    shareId: string,
    request: {
      quantity: number;
      paymentProvider: PaymentProvider;
    },
  ): Promise<ApiResponse<any>> {
    return this.post<any>(
      `/membership/shares/${shareId}/payment-intent`,
      request,
    );
  }

  /**
   * Get payment intent status
   */
  async getPaymentIntentStatus(intentId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/membership/payment-intents/${intentId}`);
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any[]>> {
    return this.get<any[]>("/membership/payments", params);
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any[]>> {
    return this.get<any[]>("/membership/transactions", params);
  }

  /**
   * Transfer shares to another member
   */
  async transferShares(request: any): Promise<ApiResponse<any>> {
    return this.post<any>("/membership/shares/transfer", request);
  }

  /**
   * Get transfer history
   */
  async getTransferHistory(params?: {
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<any[]>> {
    return this.get<any[]>("/membership/transfers", params);
  }

  /**
   * Get membership tiers
   */
  async getMembershipTiers(): Promise<ApiResponse<any[]>> {
    return this.get<any[]>("/membership/tiers");
  }

  /**
   * Get current membership tier
   */
  async getCurrentTier(): Promise<ApiResponse<any>> {
    return this.get<any>("/membership/tiers/current");
  }

  /**
   * Get membership statistics
   */
  async getMembershipStats(): Promise<ApiResponse<any>> {
    return this.get<any>("/membership/stats");
  }

  /**
   * Validate share purchase eligibility
   */
  async validateSharePurchase(
    shareId: string,
    quantity: number,
  ): Promise<
    ApiResponse<{ isValid: boolean; errors?: string[]; maxQuantity?: number }>
  > {
    return this.post<{
      isValid: boolean;
      errors?: string[];
      maxQuantity?: number;
    }>(`/membership/shares/${shareId}/validate`, { quantity });
  }

  /**
   * Process payment for share purchase
   */
  async processPayment(
    intentId: string,
    request: {
      paymentDetails?: unknown;
    },
  ): Promise<ApiResponse<any>> {
    return this.post<any>(
      `/membership/payment-intents/${intentId}/process`,
      request,
    );
  }

  /**
   * Retry failed payment
   */
  async retryPayment(paymentId: string): Promise<ApiResponse<any>> {
    return this.post<any>(`/membership/payments/${paymentId}/retry`);
  }
}
