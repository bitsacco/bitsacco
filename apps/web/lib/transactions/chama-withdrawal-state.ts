/**
 * Chama Withdrawal State Machine
 * Manages the multi-step withdrawal workflow with approval requirements
 */

import type { Money, PaymentMethodType } from "@bitsacco/core";

export enum WithdrawalState {
  // Initial state when member creates request
  REQUESTED = "requested",

  // Awaiting admin approval
  PENDING_APPROVAL = "pending_approval",

  // Admin approved, ready for execution
  APPROVED = "approved",

  // Admin rejected the request
  REJECTED = "rejected",

  // Member executing withdrawal
  EXECUTING = "executing",

  // Withdrawal completed successfully
  COMPLETED = "completed",

  // Withdrawal failed during execution
  FAILED = "failed",

  // Request expired (timeout)
  EXPIRED = "expired",
}

export interface WithdrawalStateTransition {
  from: WithdrawalState;
  to: WithdrawalState;
  action: string;
  timestamp: Date;
  userId: string;
  comment?: string;
}

export interface WithdrawalStateMachineOptions {
  transactionId: string;
  chamaId: string;
  memberId: string;
  amount: Money;
  initialState?: WithdrawalState;
  approvalTimeout?: number; // milliseconds
  onStateChange?: (
    newState: WithdrawalState,
    transition: WithdrawalStateTransition,
  ) => void;
}

export class WithdrawalStateMachine {
  private state: WithdrawalState;
  private transitions: WithdrawalStateTransition[] = [];

  public readonly transactionId: string;
  public readonly chamaId: string;
  public readonly memberId: string;
  public readonly amount: Money;
  public readonly createdAt: Date;

  private approvalTimeout: number;
  private onStateChange?: (
    newState: WithdrawalState,
    transition: WithdrawalStateTransition,
  ) => void;

  constructor(options: WithdrawalStateMachineOptions) {
    this.transactionId = options.transactionId;
    this.chamaId = options.chamaId;
    this.memberId = options.memberId;
    this.amount = options.amount;
    this.state = options.initialState || WithdrawalState.REQUESTED;
    this.approvalTimeout = options.approvalTimeout || 48 * 60 * 60 * 1000; // 48 hours default
    this.onStateChange = options.onStateChange;
    this.createdAt = new Date();
  }

  // ============================================================================
  // State Accessors
  // ============================================================================

  get currentState(): WithdrawalState {
    return this.state;
  }

  get history(): WithdrawalStateTransition[] {
    return [...this.transitions];
  }

  get isActive(): boolean {
    return ![
      WithdrawalState.COMPLETED,
      WithdrawalState.FAILED,
      WithdrawalState.REJECTED,
      WithdrawalState.EXPIRED,
    ].includes(this.state);
  }

  get requiresApproval(): boolean {
    return this.state === WithdrawalState.PENDING_APPROVAL;
  }

  get canExecute(): boolean {
    return this.state === WithdrawalState.APPROVED;
  }

  get isFinal(): boolean {
    return !this.isActive;
  }

  // ============================================================================
  // State Transitions
  // ============================================================================

  /**
   * Submit withdrawal request for approval
   */
  async request(userId: string): Promise<void> {
    this.validateTransition(
      WithdrawalState.REQUESTED,
      WithdrawalState.PENDING_APPROVAL,
    );

    await this.transition(
      WithdrawalState.PENDING_APPROVAL,
      "request_submitted",
      userId,
    );

    // Set timeout for auto-expiry
    this.scheduleExpiry();
  }

  /**
   * Approve withdrawal request (admin action)
   */
  async approve(adminId: string, comment?: string): Promise<void> {
    this.validateTransition(
      WithdrawalState.PENDING_APPROVAL,
      WithdrawalState.APPROVED,
    );

    if (!this.canUserApprove(adminId)) {
      throw new Error("User is not authorized to approve withdrawals");
    }

    await this.transition(
      WithdrawalState.APPROVED,
      "withdrawal_approved",
      adminId,
      comment,
    );
  }

  /**
   * Reject withdrawal request (admin action)
   */
  async reject(adminId: string, reason: string): Promise<void> {
    this.validateTransition(this.state, WithdrawalState.REJECTED);

    if (!this.canUserApprove(adminId)) {
      throw new Error("User is not authorized to reject withdrawals");
    }

    await this.transition(
      WithdrawalState.REJECTED,
      "withdrawal_rejected",
      adminId,
      reason,
    );
  }

  /**
   * Execute approved withdrawal
   */
  async execute(
    userId: string,
    paymentMethod: PaymentMethodType,
  ): Promise<void> {
    this.validateTransition(
      WithdrawalState.APPROVED,
      WithdrawalState.EXECUTING,
    );

    if (!this.canUserExecute(userId)) {
      throw new Error("User is not authorized to execute this withdrawal");
    }

    await this.transition(
      WithdrawalState.EXECUTING,
      "withdrawal_execution_started",
      userId,
      `Payment method: ${paymentMethod}`,
    );
  }

  /**
   * Mark withdrawal as completed
   */
  async complete(systemId: string = "system"): Promise<void> {
    this.validateTransition(
      WithdrawalState.EXECUTING,
      WithdrawalState.COMPLETED,
    );

    await this.transition(
      WithdrawalState.COMPLETED,
      "withdrawal_completed",
      systemId,
    );
  }

  /**
   * Mark withdrawal as failed
   */
  async fail(systemId: string = "system", reason: string): Promise<void> {
    const validFromStates = [
      WithdrawalState.PENDING_APPROVAL,
      WithdrawalState.APPROVED,
      WithdrawalState.EXECUTING,
    ];

    if (!validFromStates.includes(this.state)) {
      throw new Error(`Cannot fail withdrawal from state: ${this.state}`);
    }

    await this.transition(
      WithdrawalState.FAILED,
      "withdrawal_failed",
      systemId,
      reason,
    );
  }

  /**
   * Cancel withdrawal request (member action)
   */
  async cancel(userId: string, reason?: string): Promise<void> {
    if (!this.canUserCancel(userId)) {
      throw new Error("User is not authorized to cancel this withdrawal");
    }

    const validFromStates = [
      WithdrawalState.REQUESTED,
      WithdrawalState.PENDING_APPROVAL,
      WithdrawalState.APPROVED,
    ];

    if (!validFromStates.includes(this.state)) {
      throw new Error(`Cannot cancel withdrawal from state: ${this.state}`);
    }

    // Use REJECTED state for user cancellations
    await this.transition(
      WithdrawalState.REJECTED,
      "withdrawal_cancelled",
      userId,
      reason || "Cancelled by user",
    );
  }

  /**
   * Mark withdrawal as expired
   */
  async expire(): Promise<void> {
    if (this.state !== WithdrawalState.PENDING_APPROVAL) {
      return; // Only expire pending approvals
    }

    await this.transition(
      WithdrawalState.EXPIRED,
      "withdrawal_expired",
      "system",
      "Approval timeout exceeded",
    );
  }

  // ============================================================================
  // Permission Guards
  // ============================================================================

  /**
   * Check if user can approve/reject withdrawals
   * Note: Actual permission check should be done against chama membership
   */
  canUserApprove(userId: string): boolean {
    // This is a placeholder - actual implementation should check chama admin role
    // return this.isAdmin(userId, this.chamaId);
    return userId !== this.memberId; // Simple check: can't approve own withdrawal
  }

  /**
   * Check if user can execute this withdrawal
   */
  canUserExecute(userId: string): boolean {
    return userId === this.memberId && this.state === WithdrawalState.APPROVED;
  }

  /**
   * Check if user can cancel this withdrawal
   */
  canUserCancel(userId: string): boolean {
    return (
      userId === this.memberId &&
      this.isActive &&
      this.state !== WithdrawalState.EXECUTING
    );
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private async transition(
    newState: WithdrawalState,
    action: string,
    userId: string,
    comment?: string,
  ): Promise<void> {
    const transition: WithdrawalStateTransition = {
      from: this.state,
      to: newState,
      action,
      timestamp: new Date(),
      userId,
      comment,
    };

    this.transitions.push(transition);
    this.state = newState;

    // Notify listeners
    this.onStateChange?.(newState, transition);
  }

  private validateTransition(from: WithdrawalState, to: WithdrawalState): void {
    if (this.state !== from) {
      throw new Error(
        `Invalid state transition: Cannot transition from ${this.state} to ${to}. ` +
          `Expected current state: ${from}`,
      );
    }
  }

  private scheduleExpiry(): void {
    setTimeout(() => {
      if (this.state === WithdrawalState.PENDING_APPROVAL) {
        this.expire();
      }
    }, this.approvalTimeout);
  }
}

// ============================================================================
// State Helpers
// ============================================================================

export function isWithdrawalPending(state: WithdrawalState): boolean {
  return [WithdrawalState.REQUESTED, WithdrawalState.PENDING_APPROVAL].includes(
    state,
  );
}

export function isWithdrawalApproved(state: WithdrawalState): boolean {
  return state === WithdrawalState.APPROVED;
}

export function isWithdrawalInProgress(state: WithdrawalState): boolean {
  return state === WithdrawalState.EXECUTING;
}

export function isWithdrawalFinal(state: WithdrawalState): boolean {
  return [
    WithdrawalState.COMPLETED,
    WithdrawalState.FAILED,
    WithdrawalState.REJECTED,
    WithdrawalState.EXPIRED,
  ].includes(state);
}

export function canRetryWithdrawal(state: WithdrawalState): boolean {
  return [WithdrawalState.FAILED, WithdrawalState.EXPIRED].includes(state);
}

export function getWithdrawalStateLabel(state: WithdrawalState): string {
  const labels: Record<WithdrawalState, string> = {
    [WithdrawalState.REQUESTED]: "Requested",
    [WithdrawalState.PENDING_APPROVAL]: "Pending Approval",
    [WithdrawalState.APPROVED]: "Approved",
    [WithdrawalState.REJECTED]: "Rejected",
    [WithdrawalState.EXECUTING]: "Processing",
    [WithdrawalState.COMPLETED]: "Completed",
    [WithdrawalState.FAILED]: "Failed",
    [WithdrawalState.EXPIRED]: "Expired",
  };

  return labels[state] || "Unknown";
}

export function getWithdrawalStateColor(state: WithdrawalState): string {
  const colors: Record<WithdrawalState, string> = {
    [WithdrawalState.REQUESTED]: "blue",
    [WithdrawalState.PENDING_APPROVAL]: "yellow",
    [WithdrawalState.APPROVED]: "green",
    [WithdrawalState.REJECTED]: "red",
    [WithdrawalState.EXECUTING]: "blue",
    [WithdrawalState.COMPLETED]: "green",
    [WithdrawalState.FAILED]: "red",
    [WithdrawalState.EXPIRED]: "gray",
  };

  return colors[state] || "gray";
}
