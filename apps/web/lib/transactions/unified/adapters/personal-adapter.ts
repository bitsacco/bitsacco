/**
 * Personal Transaction Adapter
 * Maps personal wallet transactions to unified transaction interface
 */

import {
  PersonalApiClient,
  WalletTransaction,
  WalletResponseDto,
  TransactionType as PersonalTxType,
  TransactionStatus as PersonalTxStatus,
  WalletType,
} from "@bitsacco/core";

import type {
  UnifiedTransaction,
  TransactionAction,
  TransactionStatus,
  TransactionType,
  TransactionMetadata,
  PaymentMethodType,
} from "../types";

export interface PersonalAdapterOptions {
  client: PersonalApiClient;
  currentUserId: string;
  onTransactionUpdate?: (tx: UnifiedTransaction) => void;
}

export class PersonalTransactionAdapter {
  private client: PersonalApiClient;
  private currentUserId: string;
  private onTransactionUpdate?: (tx: UnifiedTransaction) => void;

  constructor(options: PersonalAdapterOptions) {
    this.client = options.client;
    this.currentUserId = options.currentUserId;
    this.onTransactionUpdate = options.onTransactionUpdate;
  }

  /**
   * Convert a personal transaction to unified format
   */
  async toUnified(
    tx: WalletTransaction,
    wallet?: WalletResponseDto,
  ): Promise<UnifiedTransaction> {
    const metadata: TransactionMetadata = {
      walletId: tx.walletId,
      walletName: wallet?.walletName || tx.walletName,
      walletType: this.mapWalletType(wallet?.walletType),
      paymentReference: tx.paymentReference,
    };

    return {
      id: tx.id,
      type: this.mapTransactionType(tx.type),
      context: "personal",
      status: this.mapStatus(tx.status),
      amount: {
        value: tx.amountFiat || 0,
        currency: "KES",
      },
      createdAt: new Date(tx.createdAt),
      updatedAt: tx.updatedAt ? new Date(tx.updatedAt) : undefined,
      userId: tx.userId,
      metadata,
      actions: this.getAvailableActions(tx),
    };
  }

  /**
   * Convert multiple personal transactions
   */
  async toUnifiedBatch(
    transactions: WalletTransaction[],
    wallets?: WalletResponseDto[],
  ): Promise<UnifiedTransaction[]> {
    const walletMap = new Map(wallets?.map((w) => [w.walletId, w]) || []);

    return Promise.all(
      transactions.map((tx) => {
        const wallet = walletMap.get(tx.walletId);
        return this.toUnified(tx, wallet);
      }),
    );
  }

  /**
   * Map personal transaction type to unified type
   */
  private mapTransactionType(type: PersonalTxType): TransactionType {
    switch (type) {
      case PersonalTxType.DEPOSIT:
        return "deposit";
      case PersonalTxType.WITHDRAW:
        return "withdrawal";
      case PersonalTxType.WALLET_CREATION:
        return "transfer"; // Wallet creation is internal
      default:
        return "deposit";
    }
  }

  /**
   * Map personal status to unified status
   */
  private mapStatus(status: PersonalTxStatus): TransactionStatus {
    switch (status) {
      case PersonalTxStatus.PENDING:
        return "pending";
      case PersonalTxStatus.PROCESSING:
        return "processing";
      case PersonalTxStatus.COMPLETE:
        return "completed";
      case PersonalTxStatus.FAILED:
        return "failed";
      case PersonalTxStatus.MANUAL_REVIEW:
        return "pending"; // Manual review is a form of pending
      default:
        return "pending";
    }
  }

  /**
   * Map wallet type for display
   */
  private mapWalletType(type?: WalletType): "regular" | "target" | "locked" {
    switch (type) {
      case WalletType.TARGET:
        return "target";
      case WalletType.LOCKED:
        return "locked";
      case WalletType.STANDARD:
      default:
        return "regular";
    }
  }

  /**
   * Get available actions for a transaction
   */
  private getAvailableActions(tx: WalletTransaction): TransactionAction[] {
    const actions: TransactionAction[] = [];

    // Always add view action
    actions.push({
      type: "view",
      enabled: true,
      label: "View Details",
      variant: "secondary",
      handler: async () => this.viewTransaction(tx),
    });

    // Retry action for failed transactions
    if (
      tx.status === PersonalTxStatus.FAILED &&
      tx.userId === this.currentUserId
    ) {
      actions.push({
        type: "retry",
        enabled: true,
        label: "Retry",
        variant: "primary",
        handler: async () => this.retryTransaction(tx),
      });
    }

    // Cancel action for pending transactions (if applicable)
    if (
      tx.status === PersonalTxStatus.PENDING &&
      tx.userId === this.currentUserId
    ) {
      actions.push({
        type: "cancel",
        enabled: true,
        label: "Cancel",
        variant: "secondary",
        requiresConfirmation: true,
        confirmationMessage:
          "Are you sure you want to cancel this transaction?",
        handler: async () => this.cancelTransaction(tx),
      });
    }

    return actions;
  }

  /**
   * Get priority for dashboard display
   */
  private getPriority(
    tx: WalletTransaction,
  ): "low" | "normal" | "high" | "urgent" {
    // High priority for processing transactions
    if (tx.status === PersonalTxStatus.PROCESSING) {
      return "high";
    }

    // Normal priority for pending transactions
    if (tx.status === PersonalTxStatus.PENDING) {
      return "normal";
    }

    // Low priority for completed/failed
    return "low";
  }

  /**
   * Get badge text for UI display
   */
  private getBadge(tx: WalletTransaction): string | undefined {
    if (tx.status === PersonalTxStatus.MANUAL_REVIEW) {
      return "Under Review";
    }

    if (tx.status === PersonalTxStatus.PROCESSING) {
      return "Processing";
    }

    return undefined;
  }

  // ============================================================================
  // Action Handlers
  // ============================================================================

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async viewTransaction(_tx: WalletTransaction): Promise<void> {
    // This would typically open a modal or navigate to details page
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async retryTransaction(_tx: WalletTransaction): Promise<void> {
    // This would reinitiate the transaction flow
    // Implementation would depend on payment method used
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async cancelTransaction(_tx: WalletTransaction): Promise<void> {
    // This would cancel a pending transaction if possible
    // Implementation depends on transaction state and payment method
  }

  // ============================================================================
  // Transaction Creation
  // ============================================================================

  async createDeposit(
    walletId: string,
    amount: number,
    paymentMethod?: PaymentMethodType,
    metadata?: Partial<TransactionMetadata>,
  ): Promise<UnifiedTransaction> {
    // Get wallet details
    const walletResponse = await this.client.getWallet(
      this.currentUserId,
      walletId,
    );
    if (!walletResponse.data) {
      throw new Error("Wallet not found");
    }

    const wallet = walletResponse.data;

    // Create deposit transaction
    const response = await this.client.depositToWallet(
      this.currentUserId,
      walletId,
      {
        userId: this.currentUserId,
        reference: metadata?.reference || `deposit-${Date.now()}`,
        amountFiat: amount.value,
        onramp: {
          currency: amount.currency,
          origin: {
            phone: "", // This should come from user data
          },
        },
      },
    );

    if (!response.data) {
      throw new Error("Failed to create deposit");
    }

    // Create a mock transaction object since the API returns different format
    const mockTransaction: WalletTransaction = {
      id:
        response.data.transactionId || response.data.id || crypto.randomUUID(),
      walletId,
      walletName: wallet.walletName || "Personal Wallet",
      userId: this.currentUserId,
      type: PersonalTxType.DEPOSIT,
      amountMsats: amount * 100000, // Convert to msats
      amountFiat: amount,
      status: PersonalTxStatus.PENDING,
      paymentReference: response.data.reference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.toUnified(mockTransaction, wallet);
  }

  async createWithdrawal(
    walletId: string,
    amount: number,
    paymentMethod?: PaymentMethodType,
    metadata?: Partial<TransactionMetadata>,
  ): Promise<UnifiedTransaction> {
    // Get wallet details
    const walletResponse = await this.client.getWallet(
      this.currentUserId,
      walletId,
    );
    if (!walletResponse.data) {
      throw new Error("Wallet not found");
    }

    const wallet = walletResponse.data;

    // Check if wallet allows withdrawals
    if (wallet.walletType === WalletType.LOCKED && wallet.lockInfo?.isLocked) {
      throw new Error("Cannot withdraw from locked wallet");
    }

    // Create withdrawal transaction
    const response = await this.client.withdrawFromWallet(
      this.currentUserId,
      walletId,
      {
        userId: this.currentUserId,
        reference: metadata?.reference || `withdrawal-${Date.now()}`,
        amountFiat: amount.value,
        offramp: {
          currency: amount.currency,
          payout: {
            phone: metadata?.phoneNumber || "", // This should come from user data
          },
        },
      },
    );

    if (!response.data) {
      throw new Error("Failed to create withdrawal");
    }

    // Create a mock transaction object
    const mockTransaction: WalletTransaction = {
      id:
        response.data.transactionId || response.data.id || crypto.randomUUID(),
      walletId,
      walletName: wallet.walletName || "Personal Wallet",
      userId: this.currentUserId,
      type: PersonalTxType.WITHDRAW,
      amountMsats: amount * 100000,
      amountFiat: amount,
      status: PersonalTxStatus.PENDING,
      paymentReference: response.data.reference,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.toUnified(mockTransaction, wallet);
  }

  async createWalletTransfer(): Promise<UnifiedTransaction> {
    // This would implement wallet-to-wallet transfers
    // Currently not supported in the backend API
    throw new Error("Wallet transfers not yet implemented");
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  async getWalletTransactions(
    walletId?: string,
    limit = 50,
  ): Promise<UnifiedTransaction[]> {
    try {
      const response = await this.client.getTransactionHistory(
        this.currentUserId,
        { walletId, limit },
      );

      if (!response.data?.transactions) return [];

      // Get wallet details for better context
      let wallets: WalletResponseDto[] = [];
      if (walletId) {
        const walletResponse = await this.client.getWallet(
          this.currentUserId,
          walletId,
        );
        if (walletResponse.data) {
          wallets = [walletResponse.data];
        }
      } else {
        const walletsResponse = await this.client.getUserWallets(
          this.currentUserId,
        );
        wallets = walletsResponse.data?.wallets || [];
      }

      return this.toUnifiedBatch(response.data.transactions, wallets);
    } catch {
      return [];
    }
  }

  async getWalletSummary(walletId: string) {
    try {
      const response = await this.client.getWallet(
        this.currentUserId,
        walletId,
      );
      return response.data;
    } catch {
      return null;
    }
  }
}
