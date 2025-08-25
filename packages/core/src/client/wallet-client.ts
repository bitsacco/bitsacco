import { BaseApiClient } from "./base-client";
import type { ApiResponse, PaginatedResponse } from "../types/lib";
import type {
  Transaction,
  CreateTransactionRequest,
  WalletBalance,
  GetTransactionsRequest,
} from "../types/wallet";

export class WalletApiClient extends BaseApiClient {
  /**
   * Get wallet balance for user or chama
   */
  async getBalance(chamaId?: string): Promise<ApiResponse<WalletBalance>> {
    const endpoint = chamaId
      ? `/wallets/chama/${chamaId}/balance`
      : "/wallets/balance";
    return this.get<WalletBalance>(endpoint);
  }

  /**
   * Create a new transaction
   */
  async createTransaction(
    request: CreateTransactionRequest,
  ): Promise<ApiResponse<Transaction>> {
    const endpoint = request.chamaId
      ? `/wallets/chama/${request.chamaId}/transactions`
      : "/wallets/transactions";

    return this.post<Transaction>(endpoint, request);
  }

  /**
   * Get transactions with filtering and pagination
   */
  async getTransactions(
    request: GetTransactionsRequest = {},
  ): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    const params: Record<string, string | number> = {};

    if (request.type) {
      params.type = request.type;
    }

    if (request.status) {
      params.status = request.status;
    }

    if (request.page) {
      params.page = request.page;
    }

    if (request.limit) {
      params.limit = request.limit;
    }

    if (request.startDate) {
      params.startDate = request.startDate.toISOString();
    }

    if (request.endDate) {
      params.endDate = request.endDate.toISOString();
    }

    const endpoint = request.chamaId
      ? `/wallets/chama/${request.chamaId}/transactions`
      : "/wallets/transactions";

    return this.get<PaginatedResponse<Transaction>>(endpoint, params);
  }

  /**
   * Get a specific transaction by ID
   */
  async getTransaction(
    transactionId: string,
  ): Promise<ApiResponse<Transaction>> {
    return this.get<Transaction>(`/wallets/transactions/${transactionId}`);
  }

  /**
   * Cancel a pending transaction
   */
  async cancelTransaction(
    transactionId: string,
  ): Promise<ApiResponse<Transaction>> {
    return this.patch<Transaction>(
      `/wallets/transactions/${transactionId}/cancel`,
    );
  }

  /**
   * Get transaction history for a specific chama
   */
  async getChamaTransactions(
    chamaId: string,
    params?: {
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    const queryParams: Record<string, string | number> = {};

    if (params?.page) {
      queryParams.page = params.page;
    }

    if (params?.limit) {
      queryParams.limit = params.limit;
    }

    if (params?.startDate) {
      queryParams.startDate = params.startDate.toISOString();
    }

    if (params?.endDate) {
      queryParams.endDate = params.endDate.toISOString();
    }

    return this.get<PaginatedResponse<Transaction>>(
      `/wallets/chama/${chamaId}/transactions`,
      queryParams,
    );
  }
}
