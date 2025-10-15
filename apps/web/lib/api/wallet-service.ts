/**
 * Wallet service for web application
 * Legacy service file - types updated for compatibility
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseApiClient } from "./base-client";
import type {
  ApiResponse,
  // Wallet, // Not available in core
  // any, // Not available in core
  // CreateWalletRequest, // Not available in core
  // UpdateWalletRequest, // Not available in core
} from "@bitsacco/core";

export class WalletService extends BaseApiClient {
  /**
   * Create a new wallet
   */
  async createWallet(request: any): Promise<ApiResponse<any>> {
    return this.post<any>("/wallets", request);
  }

  /**
   * Get all wallets for the authenticated user
   */
  async getMyWallets(): Promise<ApiResponse<any[]>> {
    return this.get<any[]>("/wallets/my");
  }

  /**
   * Get a specific wallet by ID
   */
  async getWalletById(walletId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/wallets/${walletId}`);
  }

  /**
   * Update wallet details
   */
  async updateWallet(
    walletId: string,
    request: any,
  ): Promise<ApiResponse<any>> {
    return this.patch<any>(`/wallets/${walletId}`, request);
  }

  /**
   * Delete a wallet
   */
  async deleteWallet(walletId: string): Promise<ApiResponse<void>> {
    return this.delete<void>(`/wallets/${walletId}`);
  }

  /**
   * Get wallet balance
   */
  async getWalletBalance(walletId: string): Promise<ApiResponse<any>> {
    return this.get<any>(`/wallets/${walletId}/balance`);
  }

  /**
   * Get all wallet balances for the authenticated user
   */
  async getAllBalances(): Promise<ApiResponse<any[]>> {
    return this.get<any[]>("/wallets/balances");
  }
}
