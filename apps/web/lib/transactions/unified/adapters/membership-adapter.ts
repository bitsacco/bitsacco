/**
 * Membership Transaction Adapter
 * Maps membership/shares transactions to unified transaction interface
 */

import type {
  MembershipApiClient,
  SharesTx,
  SharesOffer,
} from "@bitsacco/core";

import { SharesTxStatus, SharesTxType } from "@bitsacco/core";

import type {
  UnifiedTransaction,
  TransactionAction,
  TransactionStatus,
  TransactionType,
  TransactionMetadata,
} from "../types";

import { SHARES_STATUS_MAP } from "../types";

export interface MembershipAdapterOptions {
  client: MembershipApiClient;
  currentUserId: string;
  onTransactionUpdate?: (tx: UnifiedTransaction) => void;
}

export class MembershipTransactionAdapter {
  private client: MembershipApiClient;
  private currentUserId: string;
  private onTransactionUpdate?: (tx: UnifiedTransaction) => void;

  constructor(options: MembershipAdapterOptions) {
    this.client = options.client;
    this.currentUserId = options.currentUserId;
    this.onTransactionUpdate = options.onTransactionUpdate;
  }

  /**
   * Convert a shares transaction to unified format
   */
  async toUnified(
    tx: SharesTx,
    offer?: SharesOffer,
  ): Promise<UnifiedTransaction> {
    // Calculate share value - this should come from offer or be configurable
    const shareValue = this.calculateShareValue();

    const metadata: TransactionMetadata = {
      shareQuantity: tx.quantity,
      shareValue,
      reference: offer?.id || tx.offerId,
      description: `Share subscription - ${tx.quantity} shares`,
    };

    return {
      id: tx.id,
      type: this.mapTransactionType(SharesTxType.SUBSCRIPTION), // Most membership txs are subscriptions
      context: "membership",
      status: this.mapStatus(tx.status),
      amount: {
        value: shareValue * tx.quantity,
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
   * Convert multiple membership transactions
   */
  async toUnifiedBatch(
    transactions: SharesTx[],
    offers?: SharesOffer[],
  ): Promise<UnifiedTransaction[]> {
    const offerMap = new Map(offers?.map((o) => [o.id, o]) || []);

    return Promise.all(
      transactions.map((tx) => {
        const offer = offerMap.get(tx.offerId);
        return this.toUnified(tx, offer);
      }),
    );
  }

  /**
   * Map shares transaction type to unified type
   */
  private mapTransactionType(type: SharesTxType): TransactionType {
    switch (type) {
      case SharesTxType.SUBSCRIPTION:
        return "subscription";
      case SharesTxType.TRANSFER:
        return "transfer";
      case SharesTxType.OFFER:
        return "deposit"; // Offering shares is like depositing value
      default:
        return "subscription";
    }
  }

  /**
   * Map shares status to unified status
   */
  private mapStatus(status: SharesTxStatus): TransactionStatus {
    return SHARES_STATUS_MAP[status] || "pending";
  }

  /**
   * Calculate share value - this should be configurable
   */
  private calculateShareValue(): number {
    // For now, use a fixed share price
    // In production, this would come from the offer or be dynamically calculated
    return 1000; // 1000 KES per share
  }

  /**
   * Get available actions for a transaction
   */
  private getAvailableActions(tx: SharesTx): TransactionAction[] {
    const actions: TransactionAction[] = [];

    // Always add view action
    actions.push({
      type: "view",
      enabled: true,
      label: "View Details",
      variant: "secondary",
      handler: async () => this.viewTransaction(tx),
    });

    // Cancel action for pending subscriptions
    if (
      tx.status === SharesTxStatus.PROPOSED &&
      tx.userId === this.currentUserId
    ) {
      actions.push({
        type: "cancel",
        enabled: true,
        label: "Cancel Subscription",
        variant: "secondary",
        requiresConfirmation: true,
        confirmationMessage:
          "Are you sure you want to cancel this share subscription?",
        handler: async () => this.cancelSubscription(tx),
      });
    }

    // Retry action for failed transactions
    if (
      tx.status === SharesTxStatus.FAILED &&
      tx.userId === this.currentUserId
    ) {
      actions.push({
        type: "retry",
        enabled: true,
        label: "Retry Subscription",
        variant: "primary",
        handler: async () => this.retrySubscription(tx),
      });
    }

    // Execute payment for approved subscriptions
    if (
      tx.status === SharesTxStatus.APPROVED &&
      tx.userId === this.currentUserId
    ) {
      actions.push({
        type: "execute",
        enabled: true,
        label: "Complete Payment",
        variant: "primary",
        handler: async () => this.completePayment(tx),
      });
    }

    return actions;
  }

  /**
   * Get priority for dashboard display
   */
  private getPriority(tx: SharesTx): "low" | "normal" | "high" | "urgent" {
    // High priority for approved subscriptions waiting for payment
    if (tx.status === SharesTxStatus.APPROVED) {
      return "high";
    }

    // Normal priority for processing transactions
    if (tx.status === SharesTxStatus.PROCESSING) {
      return "normal";
    }

    // Low priority for completed/failed
    return "low";
  }

  /**
   * Get badge text for UI display
   */
  private getBadge(tx: SharesTx): string | undefined {
    if (tx.status === SharesTxStatus.APPROVED) {
      return "Payment Required";
    }

    if (tx.status === SharesTxStatus.PROCESSING) {
      return "Processing";
    }

    return undefined;
  }

  // ============================================================================
  // Action Handlers
  // ============================================================================

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async viewTransaction(_tx: SharesTx): Promise<void> {
    // This would typically open a modal or navigate to details page
  }

  private async cancelSubscription(tx: SharesTx): Promise<void> {
    try {
      const response = await this.client.updateSharesTx({
        sharesId: tx.id,
        updates: {
          status: SharesTxStatus.FAILED,
        },
      });

      if (response.data && this.onTransactionUpdate) {
        // Create updated unified transaction
        const unified = await this.toUnified({
          ...tx,
          status: SharesTxStatus.FAILED,
          updatedAt: new Date().toISOString(),
        });
        this.onTransactionUpdate(unified);
      }
    } catch (error) {
      throw error;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async retrySubscription(_tx: SharesTx): Promise<void> {
    // This would reinitiate the subscription flow
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async completePayment(_tx: SharesTx): Promise<void> {
    // This would trigger the payment flow
  }

  // ============================================================================
  // Transaction Creation
  // ============================================================================

  async createSubscription(quantity: number): Promise<UnifiedTransaction> {
    // Get available offers
    const offersResponse = await this.client.getShareOffers();
    const offers = offersResponse.data?.offers || [];

    // Find an active offer (this logic should be more sophisticated)
    const activeOffer = offers.find((offer) => {
      const now = new Date();
      const availableFrom = new Date(offer.availableFrom);
      const availableTo = offer.availableTo
        ? new Date(offer.availableTo)
        : null;

      return (
        now >= availableFrom &&
        (!availableTo || now <= availableTo) &&
        offer.subscribedQuantity < offer.quantity
      );
    });

    if (!activeOffer) {
      throw new Error("No active share offers available");
    }

    // Check if enough shares are available
    const remainingShares =
      activeOffer.quantity - activeOffer.subscribedQuantity;
    if (quantity > remainingShares) {
      throw new Error(`Only ${remainingShares} shares available`);
    }

    // Create subscription
    const response = await this.client.subscribeShares({
      userId: this.currentUserId,
      offerId: activeOffer.id,
      quantity,
    });

    if (!response.data) {
      throw new Error("Failed to create subscription");
    }

    // Get the created transaction
    const txResponse = await this.client.getUserSharesTxs({
      userId: this.currentUserId,
      pagination: { page: 0, size: 50 },
    });
    const transactions = txResponse.data?.shares?.transactions || [];

    // Find the latest transaction (should be the one we just created)
    const latestTx = transactions.find(
      (tx) => tx.offerId === activeOffer.id && tx.quantity === quantity,
    );

    if (!latestTx) {
      throw new Error("Could not find created subscription");
    }

    return this.toUnified(latestTx, activeOffer);
  }

  async createTransfer(
    toUserId: string,
    quantity: number,
    sharesId: string,
  ): Promise<UnifiedTransaction> {
    const response = await this.client.transferShares({
      fromUserId: this.currentUserId,
      toUserId,
      sharesId,
      quantity,
    });

    if (!response.data) {
      throw new Error("Failed to create transfer");
    }

    // Create a mock transaction for the transfer
    const mockTransaction: SharesTx = {
      id: crypto.randomUUID(),
      userId: this.currentUserId,
      offerId: sharesId,
      quantity,
      status: SharesTxStatus.PROCESSING,
      transfer: {
        fromUserId: this.currentUserId,
        toUserId,
        quantity,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return this.toUnified(mockTransaction);
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  async getUserShares(): Promise<{
    holdings: number;
    transactions: UnifiedTransaction[];
    offers: SharesOffer[];
  }> {
    try {
      const response = await this.client.getUserSharesTxs({
        userId: this.currentUserId,
        pagination: { page: 0, size: 50 },
      });

      const holdings = response.data?.shareHoldings || 0;
      const transactions = response.data?.shares?.transactions || [];
      const offers = response.data?.offers?.offers || [];

      const unifiedTransactions = await this.toUnifiedBatch(
        transactions,
        offers,
      );

      return {
        holdings,
        transactions: unifiedTransactions,
        offers,
      };
    } catch {
      return {
        holdings: 0,
        transactions: [],
        offers: [],
      };
    }
  }

  async getAvailableOffers(): Promise<SharesOffer[]> {
    try {
      const response = await this.client.getShareOffers();
      return response.data?.offers || [];
    } catch {
      return [];
    }
  }

  async getSharesSummary() {
    try {
      const userShares = await this.getUserShares();
      const allOffers = await this.getAvailableOffers();

      const totalValue = userShares.holdings * this.calculateShareValue();
      const activeOffers = allOffers.filter((offer) => {
        const now = new Date();
        const availableFrom = new Date(offer.availableFrom);
        const availableTo = offer.availableTo
          ? new Date(offer.availableTo)
          : null;

        return now >= availableFrom && (!availableTo || now <= availableTo);
      });

      return {
        holdings: userShares.holdings,
        totalValue,
        activeOffers: activeOffers.length,
        recentTransactions: userShares.transactions.slice(0, 5),
      };
    } catch {
      return {
        holdings: 0,
        totalValue: 0,
        activeOffers: 0,
        recentTransactions: [],
      };
    }
  }

  // ============================================================================
  // Share Value Calculation
  // ============================================================================

  async getSharePrice(): Promise<number> {
    // This should fetch the current share price from the API
    // For now, return a fixed price
    return 1000; // 1000 KES per share
  }

  calculateSubscriptionCost(quantity: number, sharePrice?: number): number {
    const price = sharePrice || 1000;
    return quantity * price;
  }
}
