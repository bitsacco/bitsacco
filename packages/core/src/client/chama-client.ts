import { BaseApiClient } from "./base-client";
import type {
  CreateChamaRequest,
  UpdateChamaRequest,
  FindChamaRequest,
  FilterChamasRequest,
  PaginatedFilterChamasResponse,
  PaginatedChamaTxsResponse,
  JoinChamaRequest,
  InviteMembersRequest,
  GetMemberProfilesRequest,
  MemberProfilesResponse,
  Chama,
  // Chama Wallet types
  ChamaDepositRequest,
  ChamaContinueDepositRequest,
  ChamaWithdrawRequest,
  ChamaTxsFilterRequest,
  ChamaTxsResponse,
  ChamaTxUpdateRequest,
  ChamaTxMetaRequest,
  ChamaTxMetaResponse,
  BulkChamaTxMetaRequest,
  BulkChamaTxMetaResponse,
} from "../types/chama";
import type { ApiResponse } from "../types/lib";

export class ChamaApiClient extends BaseApiClient {
  /**
   * Create a new chama
   */
  async createChama(request: CreateChamaRequest): Promise<ApiResponse<Chama>> {
    return this.post<Chama>("/chamas", request);
  }

  /**
   * Update an existing chama
   * Uses PATCH for partial updates
   */
  async updateChama(request: UpdateChamaRequest): Promise<ApiResponse<Chama>> {
    return this.patch<Chama>(`/chamas/${request.chamaId}`, request.updates);
  }

  /**
   * Get a specific chama by ID
   */
  async getChama(request: FindChamaRequest): Promise<ApiResponse<Chama>> {
    return this.get<Chama>(`/chamas/${request.chamaId}`);
  }

  /**
   * Filter chamas with pagination
   */
  async filterChamas(
    request: FilterChamasRequest,
  ): Promise<ApiResponse<PaginatedFilterChamasResponse>> {
    const params: Record<string, string | number> = {};

    if (request.createdBy) {
      params.createdBy = request.createdBy;
    }

    if (request.memberId) {
      params.memberId = request.memberId;
    }

    if (request.pagination) {
      params.page = request.pagination.page;
      params.size = request.pagination.size;
    }

    console.log("[CHAMA-CLIENT] Calling filterChamas with params:", params);
    const response = await this.get<PaginatedFilterChamasResponse>(
      "/chamas",
      params,
    );
    console.log("[CHAMA-CLIENT] filterChamas response:", response);

    return response;
  }

  /**
   * Join a chama
   */
  async joinChama(request: JoinChamaRequest): Promise<ApiResponse<void>> {
    return this.post<void>(
      `/chamas/${request.chamaId}/join`,
      request.memberInfo,
    );
  }

  /**
   * Invite members to a chama
   * /chamas/:chamaId/invites
   */
  async inviteMembers(
    request: InviteMembersRequest,
  ): Promise<ApiResponse<void>> {
    return this.post<void>(`/chamas/${request.chamaId}/invites`, {
      invites: request.invites,
    });
  }

  /**
   * Get member profiles for a chama
   */
  async getMemberProfiles(
    request: GetMemberProfilesRequest,
  ): Promise<ApiResponse<MemberProfilesResponse>> {
    return this.get<MemberProfilesResponse>(
      `/chamas/${request.chamaId}/members`,
    );
  }

  /**
   * Leave a chama
   */
  async leaveChama(chamaId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/chamas/${chamaId}/leave`);
  }

  /**
   * Remove a member from a chama (admin only)
   */
  async removeMember(
    chamaId: string,
    userId: string,
  ): Promise<ApiResponse<void>> {
    return this.delete<void>(`/chamas/${chamaId}/members/${userId}`);
  }

  // Chama Wallet Methods

  /**
   * Create a deposit transaction for a chama
   * /chamas/:chamaId/wallet/deposit
   */
  async createDeposit(
    request: ChamaDepositRequest,
  ): Promise<ApiResponse<ChamaTxsResponse>> {
    return this.post<ChamaTxsResponse>(
      `/chamas/${request.chamaId}/wallet/deposit`,
      request,
    );
  }

  /**
   * Continue a deposit transaction
   * /chamas/:chamaId/wallet/deposit/continue
   */
  async continueDeposit(
    request: ChamaContinueDepositRequest,
  ): Promise<ApiResponse<ChamaTxsResponse>> {
    return this.post<ChamaTxsResponse>(
      `/chamas/${request.chamaId}/wallet/deposit/continue`,
      request,
    );
  }

  /**
   * Create a withdrawal transaction for a chama
   * /chamas/:chamaId/wallet/withdraw
   */
  async createWithdrawal(
    request: ChamaWithdrawRequest,
  ): Promise<ApiResponse<ChamaTxsResponse>> {
    return this.post<ChamaTxsResponse>(
      `/chamas/${request.chamaId}/wallet/withdraw`,
      request,
    );
  }

  /**
   * Get transactions for a chama with filters
   */
  async getTransactions(
    request: ChamaTxsFilterRequest,
  ): Promise<ApiResponse<ChamaTxsResponse>> {
    const params: Record<string, string | number> = {};

    if (request.memberId) {
      params.memberId = request.memberId;
    }

    if (request.pagination) {
      params.page = request.pagination.page;
      params.size = request.pagination.size;
    }

    // Call the API and get PaginatedChamaTxsResponse
    const response = await this.get<PaginatedChamaTxsResponse>(
      `/chamas/${request.chamaId}/transactions`,
      params,
    );

    // Transform the response to match ChamaTxsResponse structure
    if (response.data) {
      const transformedData: ChamaTxsResponse = {
        ledger: response.data,
        // Note: This API doesn't return groupMeta/memberMeta - those come from separate calls
      };

      return {
        ...response,
        data: transformedData,
      };
    }

    return response as ApiResponse<ChamaTxsResponse>;
  }

  /**
   * Update a transaction
   * Uses PATCH for partial updates
   */
  async updateTransaction(
    request: ChamaTxUpdateRequest,
  ): Promise<ApiResponse<ChamaTxsResponse>> {
    return this.patch<ChamaTxsResponse>(
      `/chamas/${request.chamaId}/transactions/${request.txId}`,
      request.updates,
    );
  }

  /**
   * Get transaction metadata for a chama
   */
  async getTransactionMeta(
    request: ChamaTxMetaRequest,
  ): Promise<ApiResponse<ChamaTxMetaResponse>> {
    return this.post<ChamaTxMetaResponse>(
      `/chamas/${request.chamaId}/transactions/aggregate`,
      request,
    );
  }

  /**
   * Get bulk transaction metadata for multiple chamas
   */
  async getBulkTransactionMeta(
    request: BulkChamaTxMetaRequest,
  ): Promise<ApiResponse<BulkChamaTxMetaResponse>> {
    return this.post<BulkChamaTxMetaResponse>(
      "/chamas/transactions/bulk-aggregate",
      request,
    );
  }

  /**
   * Get a specific transaction by ID
   */
  async getTransaction(
    chamaId: string,
    txId: string,
  ): Promise<ApiResponse<ChamaTxsResponse>> {
    return this.get<ChamaTxsResponse>(
      `/chamas/${chamaId}/transactions/${txId}`,
    );
  }

  /**
   * Poll for transaction status updates
   */
  async pollTransactionStatus(
    chamaId: string,
    txId: string,
    intervalMs: number = 5000,
    timeoutMs: number = 45000,
  ): Promise<ChamaTxsResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      const response = await this.getTransaction(chamaId, txId);

      if (response.data && response.data.ledger?.transactions?.[0]) {
        const tx = response.data.ledger.transactions[0];
        // Return when transaction is in a final state
        // Using type assertion to handle API numeric status values
        const statusValue = tx.status as number;
        if (statusValue === 3 || statusValue === 2) {
          // COMPLETE (3) or FAILED (2) - using numeric values for API compatibility
          return response.data;
        }
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    throw new Error("Transaction polling timeout");
  }
}
