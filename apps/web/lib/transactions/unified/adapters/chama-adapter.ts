/**
 * Chama Transaction Adapter
 * Maps chama transactions to unified transaction interface
 */

import type {
  ChamaApiClient,
  ChamaWalletTx,
  Chama,
  ChamaMember,
} from "@bitsacco/core";

import {
  ChamaTxStatus,
  Review,
  ChamaMemberRole,
  ChamaTransactionType,
} from "@bitsacco/core";

import type {
  UnifiedTransaction,
  TransactionAction,
  TransactionStatus,
  TransactionType,
  TransactionMetadata,
} from "../types";

export interface ChamaAdapterOptions {
  client: ChamaApiClient;
  currentUserId: string;
  onTransactionUpdate?: (tx: UnifiedTransaction) => void;
}

export class ChamaTransactionAdapter {
  private client: ChamaApiClient;
  private currentUserId: string;
  private onTransactionUpdate?: (tx: UnifiedTransaction) => void;

  constructor(options: ChamaAdapterOptions) {
    this.client = options.client;
    this.currentUserId = options.currentUserId;
    this.onTransactionUpdate = options.onTransactionUpdate;
  }

  /**
   * Convert a chama transaction to unified format
   */
  async toUnified(
    tx: ChamaWalletTx,
    chama: Chama,
  ): Promise<UnifiedTransaction> {
    const member = chama.members.find((m) => m.userId === this.currentUserId);
    const isAdmin = this.isAdmin(member);
    const isMember = tx.memberId === this.currentUserId;

    // Get member profiles for names
    const profilesResponse = await this.client.getMemberProfiles({
      chamaId: chama.id,
    });
    const profiles = profilesResponse.data?.members || [];
    const memberProfile = profiles.find((p) => p.userId === tx.memberId);

    const metadata: TransactionMetadata = {
      chamaId: chama.id,
      chamaName: chama.name,
      memberId: tx.memberId,
      memberName: memberProfile?.name,
      reviews: tx.reviews,
      reference: tx.reference,
      lightningInvoice: tx.lightning,
    };

    // Track review information for withdrawals (informational only)
    // The backend handles approval logic - frontend just displays status
    if (tx.type === ChamaTransactionType.WITHDRAWAL) {
      // Store review information for UI display
      // Note: Backend sets status to APPROVED when ANY admin approves
      // There's no threshold requirement - it's a simple binary approval
      const approvalCount = tx.reviews.filter(
        (r) => r.review === Review.APPROVE,
      ).length;
      const rejectionCount = tx.reviews.filter(
        (r) => r.review === Review.REJECT,
      ).length;

      metadata.hasApproval = approvalCount > 0;
      metadata.hasRejection = rejectionCount > 0;
      metadata.reviewCount = tx.reviews.length;
    }

    return {
      id: tx.id,
      type: this.mapTransactionType(tx.type),
      context: "chama",
      status: this.mapStatus(tx.status, tx.type),
      amount: {
        value: tx.amountFiat || 0,
        currency: "KES",
      },
      createdAt: new Date(tx.createdAt),
      updatedAt: tx.updatedAt ? new Date(tx.updatedAt) : undefined,
      userId: tx.memberId,
      userName: memberProfile?.name,
      metadata,
      actions: this.getAvailableActions(tx, chama, isAdmin, isMember),
    };
  }

  /**
   * Convert multiple chama transactions
   */
  async toUnifiedBatch(
    transactions: ChamaWalletTx[],
    chama: Chama,
  ): Promise<UnifiedTransaction[]> {
    return Promise.all(transactions.map((tx) => this.toUnified(tx, chama)));
  }

  /**
   * Map chama transaction type to unified type
   */
  private mapTransactionType(
    type: ChamaTransactionType | string,
  ): TransactionType {
    // Handle both string values and enum values from API
    // ChamaTransactionType enum uses string values in core
    if (type === ChamaTransactionType.DEPOSIT || type === "deposit")
      return "deposit";
    if (type === ChamaTransactionType.WITHDRAWAL || type === "withdrawal")
      return "withdrawal";
    if (type === ChamaTransactionType.TRANSFER || type === "transfer")
      return "transfer";
    return "deposit"; // Default fallback
  }

  /**
   * Map chama status to unified status
   * CRITICAL: Must distinguish between deposits and withdrawals
   * - Deposits: PENDING → PROCESSING → COMPLETE/FAILED (NO approval step)
   * - Withdrawals: PENDING → PENDING_APPROVAL → APPROVED → PROCESSING → COMPLETE/FAILED
   */
  private mapStatus(
    status: ChamaTxStatus,
    txType: ChamaTransactionType | string,
  ): TransactionStatus {
    // Determine if this is a deposit or withdrawal
    const isDeposit =
      txType === ChamaTransactionType.DEPOSIT || txType === "deposit";
    const isWithdrawal =
      txType === ChamaTransactionType.WITHDRAWAL || txType === "withdrawal";

    // For deposits: simpler flow without approval
    if (isDeposit) {
      switch (status) {
        case ChamaTxStatus.PENDING:
          return "pending"; // Deposits go to pending, NOT pending_approval
        case ChamaTxStatus.PROCESSING:
          return "processing";
        case ChamaTxStatus.COMPLETE:
          return "completed";
        case ChamaTxStatus.FAILED:
          return "failed";
        case ChamaTxStatus.APPROVED: // Should not happen for deposits
        case ChamaTxStatus.REJECTED: // Should not happen for deposits
          return "pending";
        default:
          return "pending";
      }
    }

    // For withdrawals: full approval flow
    if (isWithdrawal) {
      switch (status) {
        case ChamaTxStatus.PENDING:
          return "pending_approval"; // Withdrawals require approval
        case ChamaTxStatus.APPROVED:
          return "approved";
        case ChamaTxStatus.PROCESSING:
          return "processing";
        case ChamaTxStatus.COMPLETE:
          return "completed";
        case ChamaTxStatus.FAILED:
          return "failed";
        case ChamaTxStatus.REJECTED:
          return "rejected";
        default:
          return "pending";
      }
    }

    // For other transaction types (transfers, etc.) - use simple flow
    switch (status) {
      case ChamaTxStatus.PENDING:
        return "pending";
      case ChamaTxStatus.PROCESSING:
        return "processing";
      case ChamaTxStatus.COMPLETE:
        return "completed";
      case ChamaTxStatus.FAILED:
        return "failed";
      case ChamaTxStatus.APPROVED:
        return "approved";
      case ChamaTxStatus.REJECTED:
        return "rejected";
      default:
        return "pending";
    }
  }

  /**
   * Check if user is admin
   */
  private isAdmin(member?: ChamaMember): boolean {
    if (!member) return false;
    return (
      member.roles.includes(ChamaMemberRole.Admin) ||
      member.roles.includes(ChamaMemberRole.ExternalAdmin)
    );
  }

  /**
   * Get available actions for a transaction
   */
  private getAvailableActions(
    tx: ChamaWalletTx,
    chama: Chama,
    isAdmin: boolean,
    isMember: boolean,
  ): TransactionAction[] {
    const actions: TransactionAction[] = [];

    // Always add view action
    actions.push({
      type: "view",
      enabled: true,
      label: "View Details",
      variant: "secondary",
      handler: async () => this.viewTransaction(tx),
    });

    // Withdrawal-specific actions
    if (tx.type === ChamaTransactionType.WITHDRAWAL) {
      // Admin approval actions
      if (tx.status === ChamaTxStatus.PENDING && isAdmin) {
        // Check if admin has already reviewed
        const hasReviewed = tx.reviews.some(
          (r) => r.memberId === this.currentUserId,
        );

        if (!hasReviewed) {
          actions.push({
            type: "approve",
            enabled: true,
            label: "Approve",
            variant: "primary",
            requiresConfirmation: true,
            confirmationMessage: `Approve withdrawal of KES ${tx.amountFiat}?`,
            handler: async () => this.approveWithdrawal(tx, chama.id),
          });

          actions.push({
            type: "reject",
            enabled: true,
            label: "Reject",
            variant: "danger",
            requiresConfirmation: true,
            confirmationMessage:
              "Are you sure you want to reject this withdrawal?",
            handler: async () => this.rejectWithdrawal(tx, chama.id),
          });
        }
      }

      // Member execution action
      if (tx.status === ChamaTxStatus.APPROVED && isMember) {
        actions.push({
          type: "execute",
          enabled: true,
          label: "Withdraw Funds",
          variant: "primary",
          handler: async () => this.executeWithdrawal(tx),
        });
      }

      // Cancel action for pending withdrawals by the member
      if (
        (tx.status === ChamaTxStatus.PENDING ||
          tx.status === ChamaTxStatus.APPROVED) &&
        isMember
      ) {
        actions.push({
          type: "cancel",
          enabled: true,
          label: "Cancel",
          variant: "secondary",
          requiresConfirmation: true,
          confirmationMessage:
            "Are you sure you want to cancel this withdrawal?",
          handler: async () => this.cancelWithdrawal(tx, chama.id),
        });
      }
    }

    // Retry action for failed transactions
    if (tx.status === ChamaTxStatus.FAILED && isMember) {
      actions.push({
        type: "retry",
        enabled: true,
        label: "Retry",
        variant: "primary",
        handler: async () => this.retryTransaction(tx),
      });
    }

    return actions;
  }

  // ============================================================================
  // Action Handlers
  // ============================================================================

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async viewTransaction(_tx: ChamaWalletTx): Promise<void> {
    // This would typically open a modal or navigate to details page
  }

  private async approveWithdrawal(
    tx: ChamaWalletTx,
    chamaId: string,
  ): Promise<void> {
    const response = await this.client.updateTransaction({
      chamaId,
      txId: tx.id,
      updates: {
        reviews: [
          ...tx.reviews,
          {
            memberId: this.currentUserId,
            review: Review.APPROVE,
          },
        ],
      },
    });

    if (response.data && this.onTransactionUpdate) {
      // Fetch updated chama and convert transaction
      const chamaResponse = await this.client.getChama({ chamaId });
      if (chamaResponse.data && response.data.ledger?.transactions?.[0]) {
        const unified = await this.toUnified(
          response.data.ledger.transactions[0],
          chamaResponse.data,
        );
        this.onTransactionUpdate(unified);
      }
    }
  }

  private async rejectWithdrawal(
    tx: ChamaWalletTx,
    chamaId: string,
  ): Promise<void> {
    const response = await this.client.updateTransaction({
      chamaId,
      txId: tx.id,
      updates: {
        reviews: [
          ...tx.reviews,
          {
            memberId: this.currentUserId,
            review: Review.REJECT,
          },
        ],
      },
    });

    if (response.data && this.onTransactionUpdate) {
      const chamaResponse = await this.client.getChama({ chamaId });
      if (chamaResponse.data && response.data.ledger?.transactions?.[0]) {
        const unified = await this.toUnified(
          response.data.ledger.transactions[0],
          chamaResponse.data,
        );
        this.onTransactionUpdate(unified);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async executeWithdrawal(_tx: ChamaWalletTx): Promise<void> {
    // This would trigger the payment method selection flow
    // The actual implementation would use the payment flow components
  }

  private async cancelWithdrawal(
    tx: ChamaWalletTx,
    chamaId: string,
  ): Promise<void> {
    const response = await this.client.updateTransaction({
      chamaId,
      txId: tx.id,
      updates: {
        status: ChamaTxStatus.REJECTED,
        reference: "Cancelled by member",
        reviews: [],
      },
    });

    if (response.data && this.onTransactionUpdate) {
      const chamaResponse = await this.client.getChama({ chamaId });
      if (chamaResponse.data && response.data.ledger?.transactions?.[0]) {
        const unified = await this.toUnified(
          response.data.ledger.transactions[0],
          chamaResponse.data,
        );
        this.onTransactionUpdate(unified);
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async retryTransaction(_tx: ChamaWalletTx): Promise<void> {
    // This would reinitiate the transaction flow
  }

  // ============================================================================
  // Transaction Creation
  // ============================================================================

  async createWithdrawal(
    chamaId: string,
    amount: number,
    reference?: string,
  ): Promise<UnifiedTransaction> {
    const response = await this.client.createWithdrawal({
      chamaId,
      memberId: this.currentUserId,
      amountFiat: amount,
      reference,
    });

    if (!response.data?.txId || !response.data.ledger?.transactions?.[0]) {
      throw new Error("Failed to create withdrawal");
    }

    const chamaResponse = await this.client.getChama({ chamaId });
    if (!chamaResponse.data) {
      throw new Error("Failed to fetch chama details");
    }

    return this.toUnified(
      response.data.ledger.transactions[0],
      chamaResponse.data,
    );
  }

  async createDeposit(
    chamaId: string,
    amount: number,
    reference?: string,
  ): Promise<UnifiedTransaction> {
    const response = await this.client.createDeposit({
      chamaId,
      memberId: this.currentUserId,
      amountFiat: amount,
      reference,
    });

    if (!response.data?.txId || !response.data.ledger?.transactions?.[0]) {
      throw new Error("Failed to create deposit");
    }

    const chamaResponse = await this.client.getChama({ chamaId });
    if (!chamaResponse.data) {
      throw new Error("Failed to fetch chama details");
    }

    return this.toUnified(
      response.data.ledger.transactions[0],
      chamaResponse.data,
    );
  }
}
