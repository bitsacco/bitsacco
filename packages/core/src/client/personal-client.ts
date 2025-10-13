import { BaseApiClient } from "./base-client";
import type {
  ApiResponse,
  CreateWalletDto,
  UpdateWalletDto,
  WalletResponseDto,
  WalletListResponseDto,
  TargetResponseDto,
  LockedWalletResponseDto,
  TransactionHistoryResponse,
  WalletQueryDto,
  UpdateTargetDto,
  UpdateLockedWalletDto,
  EarlyWithdrawDto,
  RenewLockDto,
  TargetProgressResponseDto,
  LockStatusResponseDto,
  EarlyWithdrawResponseDto,
  WalletAnalyticsDto,
  UserAnalyticsDto,
  DepositWithdrawResponseDto,
  WalletTransaction,
} from "../types";

export interface DepositDto {
  userId: string;
  reference: string;
  amountMsats?: number;
  amountFiat?: number;
  onramp?: {
    currency: string;
    origin: {
      phone: string;
    };
  };
}

export interface WithdrawDto {
  userId: string;
  reference: string;
  amountFiat: number;
  offramp?: {
    currency: string;
    payout: {
      phone: string;
    };
  };
  lightning?: {
    invoice: string;
  };
  lnurlRequest?: boolean;
}

/**
 * Personal Savings API client
 * Handles all personal savings wallet operations
 */
export class PersonalApiClient extends BaseApiClient {
  // ========== WALLET MANAGEMENT ==========

  /**
   * Create a new personal savings wallet
   */
  async createWallet(
    userId: string,
    walletData: CreateWalletDto,
  ): Promise<ApiResponse<WalletResponseDto>> {
    return this.post<WalletResponseDto>(
      `/personal/wallets/${userId}`,
      walletData,
    );
  }

  /**
   * Get all wallets for a user
   */
  async getUserWallets(
    userId: string,
    query?: WalletQueryDto,
  ): Promise<ApiResponse<WalletListResponseDto>> {
    // Convert query to Record<string, string | number | boolean> by filtering out undefined values
    const params = query
      ? (Object.fromEntries(
          Object.entries(query).filter(([_, value]) => value !== undefined),
        ) as Record<string, string | number | boolean>)
      : undefined;

    console.log("[PERSONAL-CLIENT] Getting user wallets:", {
      userId,
      endpoint: `/personal/wallets/${userId}`,
      baseUrl: this.baseUrl,
      fullUrl: `${this.baseUrl}/personal/wallets/${userId}`,
      params,
    });

    return this.get<WalletListResponseDto>(
      `/personal/wallets/${userId}`,
      params,
    );
  }

  /**
   * Get specific wallet details
   */
  async getWallet(
    userId: string,
    walletId: string,
  ): Promise<ApiResponse<WalletResponseDto>> {
    return this.get<WalletResponseDto>(
      `/personal/wallets/${userId}/${walletId}`,
    );
  }

  /**
   * Update wallet settings
   * Uses PATCH for partial updates
   */
  async updateWallet(
    userId: string,
    walletId: string,
    updates: UpdateWalletDto,
  ): Promise<ApiResponse<WalletResponseDto>> {
    return this.patch<WalletResponseDto>(
      `/personal/wallets/${userId}/${walletId}`,
      updates,
    );
  }

  /**
   * Delete wallet
   */
  async deleteWallet(
    userId: string,
    walletId: string,
  ): Promise<ApiResponse<void>> {
    return this.delete<void>(`/personal/wallets/${userId}/${walletId}`);
  }

  /**
   * Deposit to wallet
   */
  async depositToWallet(
    userId: string,
    walletId: string,
    depositData: DepositDto,
  ): Promise<ApiResponse<DepositWithdrawResponseDto>> {
    return this.post<DepositWithdrawResponseDto>(
      `/personal/wallets/${userId}/${walletId}/deposit`,
      depositData,
    );
  }

  /**
   * Withdraw from wallet
   */
  async withdrawFromWallet(
    userId: string,
    walletId: string,
    withdrawData: WithdrawDto,
  ): Promise<ApiResponse<DepositWithdrawResponseDto>> {
    return this.post<DepositWithdrawResponseDto>(
      `/personal/wallets/${userId}/${walletId}/withdraw`,
      withdrawData,
    );
  }

  // ========== TARGET/SAVINGS GOALS ==========

  /**
   * Create savings target
   */
  async createTarget(
    userId: string,
    targetData: CreateWalletDto,
  ): Promise<ApiResponse<TargetResponseDto>> {
    return this.post<TargetResponseDto>(
      `/personal/targets/${userId}`,
      targetData,
    );
  }

  /**
   * Get user targets
   */
  async getUserTargets(
    userId: string,
  ): Promise<ApiResponse<TargetResponseDto[]>> {
    return this.get<TargetResponseDto[]>(`/personal/targets/${userId}`);
  }

  /**
   * Update target
   * Uses PATCH for partial updates
   */
  async updateTarget(
    userId: string,
    walletId: string,
    updates: UpdateTargetDto,
  ): Promise<ApiResponse<TargetResponseDto>> {
    return this.patch<TargetResponseDto>(
      `/personal/targets/${userId}/${walletId}`,
      updates,
    );
  }

  /**
   * Complete target
   */
  async completeTarget(
    userId: string,
    walletId: string,
  ): Promise<ApiResponse<void>> {
    return this.delete<void>(`/personal/targets/${userId}/${walletId}`);
  }

  /**
   * Get target progress
   */
  async getTargetProgress(
    userId: string,
    walletId: string,
  ): Promise<ApiResponse<TargetProgressResponseDto>> {
    return this.get<TargetProgressResponseDto>(
      `/personal/targets/${userId}/${walletId}/progress`,
    );
  }

  // ========== LOCKED SAVINGS ==========

  /**
   * Create locked savings wallet
   */
  async createLockedWallet(
    userId: string,
    lockedData: CreateWalletDto,
  ): Promise<ApiResponse<LockedWalletResponseDto>> {
    return this.post<LockedWalletResponseDto>(
      `/personal/locked/${userId}`,
      lockedData,
    );
  }

  /**
   * Get locked wallets
   */
  async getLockedWallets(
    userId: string,
  ): Promise<ApiResponse<LockStatusResponseDto[]>> {
    return this.get<LockStatusResponseDto[]>(`/personal/locked/${userId}`);
  }

  /**
   * Update locked wallet
   * Uses PATCH for partial updates
   */
  async updateLockedWallet(
    userId: string,
    walletId: string,
    updates: UpdateLockedWalletDto,
  ): Promise<ApiResponse<LockStatusResponseDto>> {
    return this.patch<LockStatusResponseDto>(
      `/personal/locked/${userId}/${walletId}`,
      updates,
    );
  }

  /**
   * Early withdrawal from locked savings
   */
  async earlyWithdraw(
    userId: string,
    walletId: string,
    withdrawData: EarlyWithdrawDto,
  ): Promise<ApiResponse<EarlyWithdrawResponseDto>> {
    return this.post<EarlyWithdrawResponseDto>(
      `/personal/locked/${userId}/${walletId}/early-withdraw`,
      withdrawData,
    );
  }

  /**
   * Renew locked savings
   */
  async renewLock(
    userId: string,
    walletId: string,
    renewData: RenewLockDto,
  ): Promise<ApiResponse<LockStatusResponseDto>> {
    return this.post<LockStatusResponseDto>(
      `/personal/locked/${userId}/${walletId}/renew`,
      renewData,
    );
  }

  /**
   * Get lock status
   */
  async getLockStatus(
    userId: string,
    walletId: string,
  ): Promise<ApiResponse<LockStatusResponseDto>> {
    return this.get<LockStatusResponseDto>(
      `/personal/locked/${userId}/${walletId}/status`,
    );
  }

  // ========== ANALYTICS ==========

  /**
   * Get user analytics
   */
  async getUserAnalytics(
    userId: string,
    query?: Record<string, string>,
  ): Promise<ApiResponse<UserAnalyticsDto>> {
    return this.get<UserAnalyticsDto>(`/personal/analytics/${userId}`, query);
  }

  /**
   * Get wallet analytics
   */
  async getWalletAnalytics(
    userId: string,
    walletId: string,
    query?: Record<string, string>,
  ): Promise<ApiResponse<WalletAnalyticsDto>> {
    return this.get<WalletAnalyticsDto>(
      `/personal/analytics/${userId}/wallet/${walletId}`,
      query,
    );
  }

  /**
   * Get savings summary
   */
  async getSavingsSummary(
    userId: string,
  ): Promise<ApiResponse<UserAnalyticsDto>> {
    return this.get<UserAnalyticsDto>(`/personal/analytics/${userId}/summary`);
  }

  /**
   * Get goal achievements
   */
  async getGoalAchievements(
    userId: string,
  ): Promise<ApiResponse<UserAnalyticsDto>> {
    return this.get<UserAnalyticsDto>(`/personal/analytics/${userId}/goals`);
  }

  // ========== TRANSACTION HISTORY ==========

  /**
   * Get transaction history for user's personal wallets
   */
  async getTransactionHistory(
    userId: string,
    query?: {
      walletId?: string;
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<ApiResponse<TransactionHistoryResponse>> {
    return this.get<TransactionHistoryResponse>(
      `/personal/transactions/${userId}`,
      query,
    );
  }

  /**
   * Get transaction details by ID
   */
  async getTransaction(
    userId: string,
    transactionId: string,
  ): Promise<ApiResponse<WalletTransaction>> {
    return this.get<WalletTransaction>(
      `/personal/transactions/${userId}/${transactionId}`,
    );
  }

  /**
   * Get wallet-specific transaction history
   */
  async getWalletTransactions(
    userId: string,
    walletId: string,
    query?: {
      page?: number;
      limit?: number;
      type?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ): Promise<ApiResponse<TransactionHistoryResponse>> {
    return this.get<TransactionHistoryResponse>(
      `/personal/wallets/${userId}/${walletId}/transactions`,
      query,
    );
  }
}
