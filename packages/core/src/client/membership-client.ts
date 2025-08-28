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
} from "../types/membership";

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

    if (request.page !== undefined) {
      params.page = request.page;
    }

    if (request.size !== undefined) {
      params.size = request.size;
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
}
