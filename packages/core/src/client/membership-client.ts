import { BaseApiClient } from "./base-client";
import type { ApiResponse, PaginatedResponse } from "../types/lib";
import type {
  Share,
  ShareOffer,
  CreateShareOfferRequest,
  AcceptShareOfferRequest,
  FilterShareOffersRequest,
  UserSharesRequest,
  PurchaseSharesRequest,
} from "../types/membership";

export class MembershipApiClient extends BaseApiClient {
  /**
   * Purchase shares in a chama
   */
  async purchaseShares(
    request: PurchaseSharesRequest,
  ): Promise<ApiResponse<Share[]>> {
    return this.post<Share[]>("/shares/purchase", request);
  }

  /**
   * Get user's shares
   */
  async getUserShares(
    request: UserSharesRequest,
  ): Promise<ApiResponse<PaginatedResponse<Share>>> {
    const params: Record<string, string | number> = {};

    if (request.chamaId) {
      params.chamaId = request.chamaId;
    }

    if (request.pagination) {
      params.page = request.pagination.page;
      params.size = request.pagination.size;
    }

    return this.get<PaginatedResponse<Share>>("/shares/user", params);
  }

  /**
   * Create a share offer
   */
  async createShareOffer(
    request: CreateShareOfferRequest,
  ): Promise<ApiResponse<ShareOffer>> {
    return this.post<ShareOffer>("/shares/offers", request);
  }

  /**
   * Accept a share offer
   */
  async acceptShareOffer(
    request: AcceptShareOfferRequest,
  ): Promise<ApiResponse<void>> {
    return this.post<void>(`/shares/offers/${request.offerId}/accept`);
  }

  /**
   * Cancel a share offer
   */
  async cancelShareOffer(offerId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/shares/offers/${offerId}`);
  }

  /**
   * Filter share offers
   */
  async filterShareOffers(
    request: FilterShareOffersRequest,
  ): Promise<ApiResponse<PaginatedResponse<ShareOffer>>> {
    const params: Record<string, string | number> = {};

    if (request.chamaId) {
      params.chamaId = request.chamaId;
    }

    if (request.status) {
      params.status = request.status;
    }

    if (request.pagination) {
      params.page = request.pagination.page;
      params.size = request.pagination.size;
    }

    return this.get<PaginatedResponse<ShareOffer>>("/shares/offers", params);
  }

  /**
   * Get active offers for a specific chama
   */
  async getChamaOffers(chamaId: string): Promise<ApiResponse<ShareOffer[]>> {
    return this.get<ShareOffer[]>(`/chamas/${chamaId}/offers`);
  }
}
