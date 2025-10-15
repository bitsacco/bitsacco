/**
 * Personal savings service for web application
 * Legacy service file - types updated for compatibility
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseApiClient } from "./base-client";
import type {
  ApiResponse,
  TransactionStatus,
  PaymentMethod,
  // PersonalWallet, // Not available in core
  // CreatePersonalWalletRequest, // Not available in core
  // any, // Not available in core
  // any, // Not available in core
  // any, // Not available in core
  // any, // Not available in core
  // any, // Not available in core
  // any, // Not available in core
  // any, // Not available in core
} from "@bitsacco/core";

export class PersonalService extends BaseApiClient {
  /**
   * Create a new personal wallet
   */
  async createWallet(request: any): Promise<ApiResponse<any>> {
    return this.post<any>("/personal/wallets", request);
  }

  /**
   * Get all personal wallets for the authenticated user
   */
  async getMyWallets(): Promise<ApiResponse<any[]>> {
    return this.get<any[]>("/personal/wallets");
  }

  /**
   * Get a specific personal wallet by ID
   */
  async getWalletById(walletId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/personal/wallets/${walletId}`);
  }

  /**
   * Update personal wallet details
   */
  async updateWallet(
    walletId: string,
    request: any,
  ): Promise<ApiResponse<any>> {
    return this.patch<any>(`/personal/wallets/${walletId}`, request);
  }

  /**
   * Delete a personal wallet
   */
  async deleteWallet(walletId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/personal/wallets/${walletId}`);
  }

  /**
   * Create a deposit to personal wallet
   */
  async createDeposit(
    walletId: string,
    request: any,
  ): Promise<ApiResponse<any>> {
    return this.post<any>(`/personal/wallets/${walletId}/deposits`, request);
  }

  /**
   * Get deposit history for personal wallet
   */
  async getDeposits(walletId: string): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(`/personal/wallets/${walletId}/deposits`);
  }

  /**
   * Create a withdrawal from personal wallet
   */
  async createWithdrawal(
    walletId: string,
    request: any,
  ): Promise<ApiResponse<any>> {
    return this.post<any>(`/personal/wallets/${walletId}/withdrawals`, request);
  }

  /**
   * Get withdrawal history for personal wallet
   */
  async getWithdrawals(walletId: string): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(`/personal/wallets/${walletId}/withdrawals`);
  }

  /**
   * Get all transactions for personal wallet
   */
  async getTransactions(
    walletId: string,
    params?: {
      status?: TransactionStatus;
      paymentMethod?: PaymentMethod;
      limit?: number;
      offset?: number;
    },
  ): Promise<ApiResponse<any[]>> {
    return this.get<any[]>(
      `/personal/wallets/${walletId}/transactions`,
      params,
    );
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(
    walletId: string,
    transactionId: string,
  ): Promise<ApiResponse<any>> {
    return this.get<any>(
      `/personal/wallets/${walletId}/transactions/${transactionId}`,
    );
  }

  /**
   * Get personal wallet statistics
   */
  async getWalletStats(walletId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/personal/wallets/${walletId}/stats`);
  }

  /**
   * Get overall personal savings statistics
   */
  async getOverallStats(): Promise<ApiResponse<any>> {
    return this.get<any>("/personal/stats");
  }
}
