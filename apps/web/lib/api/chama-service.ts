/**
 * Chama service for web application
 * Legacy service file - types updated for compatibility
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseApiClient } from "./base-client";
import type {
  ApiResponse,
  Chama,
  CreateChamaRequest,
  UpdateChamaRequest,
  InviteMembersRequest,
  // unknown, // Not available in core
  // unknown, // Not available in core
  ChamaDepositRequest,
  ChamaWithdrawRequest,
  // unknown, // Not available in core
  // unknown, // Not available in core
  // unknown, // Not available in core
  // unknown, // Not available in core
  // unknown, // Not available in core
  // unknown, // Not available in core
  // unknownStatus, // Not available in core
  // unknownType, // Not available in core
  // unknown, // Not available in core
} from "@bitsacco/core";

export class ChamaService extends BaseApiClient {
  /**
   * Create a new chama
   */
  async createChama(request: CreateChamaRequest): Promise<ApiResponse<Chama>> {
    return this.post<Chama>("/chamas", request);
  }

  /**
   * Get all chamas for the authenticated user
   */
  async getMyChamas(): Promise<ApiResponse<Chama[]>> {
    return this.get<Chama[]>("/chamas/my");
  }

  /**
   * Get a specific chama by ID
   */
  async getChamaById(chamaId: string): Promise<ApiResponse<Chama>> {
    return this.get<Chama>(`/chamas/${chamaId}`);
  }

  /**
   * Update chama details
   */
  async updateChama(
    chamaId: string,
    request: UpdateChamaRequest,
  ): Promise<ApiResponse<Chama>> {
    return this.patch<Chama>(`/chamas/${chamaId}`, request);
  }

  /**
   * Delete a chama
   */
  async deleteChama(chamaId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/chamas/${chamaId}`);
  }

  /**
   * Invite members to a chama
   */
  async inviteMember(
    chamaId: string,
    request: InviteMembersRequest,
  ): Promise<ApiResponse<unknown>> {
    return this.post<unknown>(`/chamas/${chamaId}/invite`, request);
  }

  /**
   * Remove member from chama
   */
  async removeMember(
    chamaId: string,
    request: unknown,
  ): Promise<ApiResponse<void>> {
    return this.delete<void>(
      `/chamas/${chamaId}/members/${(request as any)?.memberId}`,
    );
  }

  /**
   * Update member role in chama
   */
  async updateMemberRole(
    chamaId: string,
    request: unknown,
  ): Promise<ApiResponse<unknown>> {
    return this.patch<unknown>(
      `/chamas/${chamaId}/members/${(request as any)?.memberId}/role`,
      { roles: (request as any)?.roles },
    );
  }

  /**
   * Get all members of a chama
   */
  async getunknowns(chamaId: string): Promise<ApiResponse<unknown[]>> {
    return this.get<unknown[]>(`/chamas/${chamaId}/members`);
  }

  /**
   * Create a deposit to a chama
   */
  async createDeposit(
    chamaId: string,
    request: unknown,
  ): Promise<ApiResponse<ChamaDepositRequest>> {
    return this.post<ChamaDepositRequest>(
      `/chamas/${chamaId}/deposits`,
      request,
    );
  }

  /**
   * Get deposit history for a chama
   */
  async getDeposits(
    chamaId: string,
  ): Promise<ApiResponse<ChamaDepositRequest[]>> {
    return this.get<ChamaDepositRequest[]>(`/chamas/${chamaId}/deposits`);
  }

  /**
   * Create a withdrawal request from a chama
   */
  async createWithdrawal(
    chamaId: string,
    request: unknown,
  ): Promise<ApiResponse<ChamaWithdrawRequest>> {
    return this.post<ChamaWithdrawRequest>(
      `/chamas/${chamaId}/withdrawals`,
      request,
    );
  }

  /**
   * Get withdrawal history for a chama
   */
  async getWithdrawals(
    chamaId: string,
  ): Promise<ApiResponse<ChamaWithdrawRequest[]>> {
    return this.get<ChamaWithdrawRequest[]>(`/chamas/${chamaId}/withdrawals`);
  }

  /**
   * Approve a withdrawal request (admin only)
   */
  async approveWithdrawal(
    chamaId: string,
    withdrawalId: string,
    request: unknown,
  ): Promise<ApiResponse<ChamaWithdrawRequest>> {
    return this.post<ChamaWithdrawRequest>(
      `/chamas/${chamaId}/withdrawals/${withdrawalId}/approve`,
      request,
    );
  }

  /**
   * Reject a withdrawal request (admin only)
   */
  async rejectWithdrawal(
    chamaId: string,
    withdrawalId: string,
    request: unknown,
  ): Promise<ApiResponse<ChamaWithdrawRequest>> {
    return this.post<ChamaWithdrawRequest>(
      `/chamas/${chamaId}/withdrawals/${withdrawalId}/reject`,
      request,
    );
  }

  /**
   * Get all transactions for a chama
   */
  async getTransactions(
    chamaId: string,
    params?: {
      type?: string;
      status?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<ApiResponse<unknown[]>> {
    return this.get<unknown[]>(`/chamas/${chamaId}/transactions`, params);
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(
    chamaId: string,
    transactionId: string,
  ): Promise<ApiResponse<unknown>> {
    return this.get<unknown>(
      `/chamas/${chamaId}/transactions/${transactionId}`,
    );
  }

  /**
   * Get chama statistics
   */
  async getunknown(chamaId: string): Promise<ApiResponse<unknown>> {
    return this.get<unknown>(`/chamas/${chamaId}/stats`);
  }

  /**
   * Leave a chama
   */
  async leaveChama(chamaId: string): Promise<ApiResponse<void>> {
    return this.post<void>(`/chamas/${chamaId}/leave`);
  }
}
