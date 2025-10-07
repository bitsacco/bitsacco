# Comprehensive Transaction System Architecture

## Executive Summary

This document serves as the single source of truth for implementing a unified transaction system across the Bitsacco web application. The system leverages existing backend infrastructure in `~/bitsacco/os` and shared business logic in `@packages/core/` to provide reusable transaction components that work seamlessly across membership, personal savings, and chama contexts.

**Key Design Principles:**
- **Leverage Existing Infrastructure**: Use existing APIs without backend modifications
- **Unified User Experience**: Consistent transaction flows across all contexts
- **Reusable Components**: Composable UI components that adapt to different contexts
- **Backend State Authority**: Backend remains source of truth for all state
- **Multi-step Workflows**: Full support for chama withdrawal approval processes

## Current Infrastructure Analysis

### Existing Backend Services (~/bitsacco/os)

1. **Chama Wallet Service** (`/src/chamawallet/`)
   - ✅ Multi-admin approval workflow already implemented
   - ✅ Review system with APPROVE/REJECT states
   - ✅ Transaction status calculation based on reviews
   - ✅ Deposit and withdrawal endpoints with SMS notifications from backend

2. **Personal Savings Service** (`/src/personal/`)
   - ✅ Wallet management (regular, target, locked)
   - ✅ Deposit/withdrawal operations
   - ✅ Transaction history and analytics

3. **Shares/Membership Service** (`/src/shares/`)
   - ✅ Share subscription transactions
   - ✅ Payment processing integration

4. **Swap Service** (`/src/swap/`)
   - ✅ MPesa integration (onramp/offramp)
   - ✅ Lightning Network integration
   - ✅ Exchange rate management

### Existing Core Package Structure

```typescript
@packages/core/
├── src/
│   ├── client/
│   │   ├── base-client.ts         # Base API client with auth
│   │   ├── chama-client.ts        # Chama operations including withdrawals
│   │   ├── personal-client.ts     # Personal savings operations
│   │   ├── membership-client.ts   # Membership/shares operations
│   │   └── wallet-client.ts       # Wallet operations
│   ├── types/
│   │   ├── chama.ts               # ChamaWalletTx, Review types
│   │   ├── payments.ts            # PaymentIntent, PaymentMethod types
│   │   ├── personal.ts            # Wallet, Transaction types
│   │   └── membership.ts          # SharesTx types
│   └── hooks/
│       └── useMembership.ts       # Membership hooks
```

### Chama Withdrawal Flow Analysis

The existing chama withdrawal system implements a robust multi-step approval process:

1. **Request Phase**: Member creates withdrawal request
2. **Approval Phase**: Admins receive SMS notifications from backend and can approve/reject
3. **Execution Phase**: Approved member proceeds with withdrawal via MPesa/Lightning
4. **Completion Phase**: Transaction completes with backend SMS notifications

**Existing Status Flow:**
```
PENDING → APPROVED/REJECTED → PROCESSING → COMPLETE/FAILED
```

## Unified Transaction Architecture

### Component System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                   Transaction Component System                 │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Transaction Context Provider                │  │
│  │  - Maps backend states to UI states                      │  │
│  │  - Handles API client initialization                     │  │
│  │  - Manages polling and real-time updates                 │  │
│  │  - Provides unified transaction interface                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Transaction Adapters                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  ChamaTransactionAdapter                                 │  │
│  │  - Maps ChamaWalletTx → UnifiedTransaction               │  │
│  │  - Handles multi-step approval workflow                  │  │
│  │  - Manages admin permissions (SMS handled by backend)    │  │
│  │                                                          │  │
│  │  PersonalTransactionAdapter                              │  │
│  │  - Maps WalletTransaction → UnifiedTransaction           │  │
│  │  - Handles wallet-specific logic                         │  │
│  │                                                          │  │
│  │  MembershipTransactionAdapter                            │  │
│  │  - Maps SharesTx → UnifiedTransaction                    │  │
│  │  - Handles share subscription logic                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Reusable UI Components                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  <TransactionModal />         <ApprovalWorkflow />       │  │
│  │  - Universal transaction UI   - Chama approval interface │  │
│  │  - Adapts to any context      - Admin review actions     │  │
│  │                                                          │  │
│  │  <PaymentMethodSelector />    <TransactionCard />        │  │
│  │  - MPesa/Lightning selection  - Displays any tx type     │  │
│  │  - Context-aware limits       - Shows actions & status   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

## Core Implementation

### 1. Unified Transaction Interface

```typescript
// lib/transactions/unified/types.ts
export interface UnifiedTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'subscription' | 'transfer';
  context: 'personal' | 'chama' | 'membership';
  status: TransactionStatus;
  amount: Money;
  paymentMethod?: PaymentMethodType;
  
  // Timestamps
  createdAt: Date;
  updatedAt?: Date;
  completedAt?: Date;
  
  // User references
  userId: string;
  contextId: string; // walletId, chamaId, etc.
  
  // Context-specific metadata
  metadata: TransactionMetadata;
  
  // Available actions based on current state and user permissions
  actions: TransactionAction[];
}

export type TransactionStatus = 
  | 'pending'           // Initial state
  | 'pending_approval'  // Chama withdrawals awaiting admin approval
  | 'approved'          // Chama withdrawal approved, ready to execute
  | 'processing'        // Payment in progress
  | 'completed'         // Successfully finished
  | 'failed'            // Transaction failed
  | 'rejected'          // Admin rejected (chama only)
  | 'cancelled'         // User cancelled
  | 'expired';          // Request expired

export interface TransactionMetadata {
  // Personal wallet specific
  walletType?: 'regular' | 'target' | 'locked';
  walletName?: string;
  
  // Chama specific
  chamaId?: string;
  chamaName?: string;
  memberId?: string;
  memberRole?: ChamaMemberRole;
  reviews?: Review[];
  // Server handles approval thresholds - frontend only tracks boolean status
  hasApproval?: boolean;
  hasRejection?: boolean;
  reviewCount?: number;
  
  // Membership specific
  sharesQuantity?: number;
  pricePerShare?: number;
  
  // Common
  reference?: string;
  exchangeRate?: number;
  fees?: Money[];
}

export interface TransactionAction {
  type: 'approve' | 'reject' | 'execute' | 'cancel' | 'retry' | 'view_details';
  enabled: boolean;
  label: string;
  description?: string;
  requiresConfirmation?: boolean;
  handler: () => Promise<void>;
}
```

### 2. Chama Transaction Adapter

```typescript
// lib/transactions/unified/adapters/chama-adapter.ts
export class ChamaTransactionAdapter implements ContextAdapter {
  constructor(
    private chamaClient: ChamaApiClient,
    private currentUserId: string
  ) {}

  async toUnified(
    tx: ChamaWalletTx, 
    chama: Chama
  ): Promise<UnifiedTransaction> {
    const member = chama.members.find(m => m.userId === tx.memberId);
    const currentMember = chama.members.find(m => m.userId === this.currentUserId);
    const isAdmin = currentMember?.roles.includes(ChamaMemberRole.Admin) || false;
    const isOwnTransaction = tx.memberId === this.currentUserId;

    // Server handles all approval threshold logic
    // Frontend only needs to track status and display appropriate UI
    const hasApproval = tx.reviews?.some(r => r.review === Review.APPROVE) || false;
    const hasRejection = tx.reviews?.some(r => r.review === Review.REJECT) || false;

    return {
      id: tx.id,
      type: tx.type === TransactionType.DEPOSIT ? 'deposit' : 'withdrawal',
      context: 'chama',
      status: this.mapStatus(tx),
      amount: {
        amount: tx.amountFiat || 0,
        currency: 'KES'
      },
      paymentMethod: this.inferPaymentMethod(tx),
      
      createdAt: new Date(tx.createdAt),
      updatedAt: tx.updatedAt ? new Date(tx.updatedAt) : undefined,
      completedAt: tx.completedAt ? new Date(tx.completedAt) : undefined,
      
      userId: tx.memberId,
      contextId: tx.chamaId,
      
      metadata: {
        chamaId: tx.chamaId,
        chamaName: chama.groupMeta?.name,
        memberId: tx.memberId,
        memberRole: member?.roles?.[0] || ChamaMemberRole.Member,
        reviews: tx.reviews,
        hasApproval,
        hasRejection,
        reviewCount: tx.reviews?.length || 0,
        reference: tx.reference
      },
      
      actions: this.getAvailableActions(tx, isAdmin, isOwnTransaction)
    };
  }

  private mapStatus(tx: ChamaWalletTx): TransactionStatus {
    // For deposits: simpler flow
    if (tx.type === TransactionType.DEPOSIT) {
      switch (tx.status) {
        case ChamaTxStatus.PENDING: return 'pending';
        case ChamaTxStatus.PROCESSING: return 'processing';
        case ChamaTxStatus.COMPLETE: return 'completed';
        case ChamaTxStatus.FAILED: return 'failed';
        default: return 'pending';
      }
    }

    // For withdrawals: approval flow
    switch (tx.status) {
      case ChamaTxStatus.PENDING: return 'pending_approval';
      case ChamaTxStatus.APPROVED: return 'approved';
      case ChamaTxStatus.PROCESSING: return 'processing';
      case ChamaTxStatus.COMPLETE: return 'completed';
      case ChamaTxStatus.FAILED: return 'failed';
      case ChamaTxStatus.REJECTED: return 'rejected';
      default: return 'pending';
    }
  }

  private getAvailableActions(
    tx: ChamaWalletTx,
    isAdmin: boolean,
    isOwnTransaction: boolean
  ): TransactionAction[] {
    const actions: TransactionAction[] = [];

    // Withdrawal approval actions (admin only)
    if (tx.type === TransactionType.WITHDRAW && tx.status === ChamaTxStatus.PENDING) {
      if (isAdmin && !isOwnTransaction) {
        actions.push({
          type: 'approve',
          enabled: true,
          label: 'Approve Withdrawal',
          description: 'Approve this withdrawal request',
          requiresConfirmation: true,
          handler: async () => this.approveWithdrawal(tx)
        });

        actions.push({
          type: 'reject',
          enabled: true,
          label: 'Reject',
          description: 'Reject this withdrawal request',
          requiresConfirmation: true,
          handler: async () => this.rejectWithdrawal(tx)
        });
      }
    }

    // Withdrawal execution (member only, when server marks as APPROVED)
    // Server handles all approval threshold logic - frontend just checks status
    if (tx.type === TransactionType.WITHDRAW && 
        tx.status === ChamaTxStatus.APPROVED && 
        isOwnTransaction) {
      actions.push({
        type: 'execute',
        enabled: true,
        label: 'Withdraw Funds',
        description: 'Your withdrawal has been approved - choose payment method',
        handler: async () => this.executeWithdrawal(tx)
      });
    }

    // Common actions
    if (tx.status === ChamaTxStatus.FAILED && isOwnTransaction) {
      actions.push({
        type: 'retry',
        enabled: true,
        label: 'Retry',
        handler: async () => this.retryTransaction(tx)
      });
    }

    actions.push({
      type: 'view_details',
      enabled: true,
      label: 'View Details',
      handler: async () => this.viewTransactionDetails(tx)
    });

    return actions;
  }

  private async approveWithdrawal(tx: ChamaWalletTx) {
    const updates: ChamaTxUpdates = {
      status: ChamaTxStatus.APPROVED,
      reviews: [{
        memberId: this.currentUserId,
        review: Review.APPROVE
      }]
    };

    await this.chamaClient.updateTransaction({
      chamaId: tx.chamaId,
      txId: tx.id,
      updates
    });
  }

  private async rejectWithdrawal(tx: ChamaWalletTx) {
    const reason = await this.promptForRejectionReason();
    
    const updates: ChamaTxUpdates = {
      status: ChamaTxStatus.REJECTED,
      reviews: [{
        memberId: this.currentUserId,
        review: Review.REJECT
      }],
      reference: reason
    };

    await this.chamaClient.updateTransaction({
      chamaId: tx.chamaId,
      txId: tx.id,
      updates
    });
  }

  private async executeWithdrawal(tx: ChamaWalletTx) {
    // This will open the payment method selection modal
    // Implementation will integrate with existing withdrawal flow
    const paymentModalData = {
      transactionId: tx.id,
      chamaId: tx.chamaId,
      amount: tx.amountFiat,
      type: 'chama_withdrawal'
    };
    
    // Trigger payment modal with chama context
    this.openPaymentModal(paymentModalData);
  }
}
```

### 3. Universal Transaction Modal

```typescript
// components/transactions/TransactionModal.tsx
export function TransactionModal({
  context,
  type,
  targetId,
  onSuccess,
  onCancel
}: TransactionModalProps) {
  const [step, setStep] = useState<TransactionStep>('amount');
  const [transaction, setTransaction] = useState<Partial<UnifiedTransaction>>();
  const adapter = useTransactionAdapter(context);

  // Determine flow steps based on context and type
  const steps = useMemo(() => {
    if (context === 'chama' && type === 'withdrawal') {
      return ['amount', 'review', 'submit'] as const;
    }
    return ['amount', 'payment', 'confirm'] as const;
  }, [context, type]);

  const isMultiStepApproval = context === 'chama' && type === 'withdrawal';

  return (
    <Modal onClose={onCancel}>
      <ModalHeader>
        <TransactionIcon type={type} context={context} />
        <Title>
          {type === 'deposit' ? 'Deposit to' : 'Withdraw from'} {getContextName(context, targetId)}
        </Title>
        <ProgressIndicator currentStep={step} steps={steps} />
      </ModalHeader>

      <ModalContent>
        {step === 'amount' && (
          <AmountStep
            context={context}
            type={type}
            limits={getTransactionLimits(context, targetId)}
            onNext={(amount) => {
              setTransaction({ ...transaction, amount });
              setStep(isMultiStepApproval ? 'review' : 'payment');
            }}
          />
        )}

        {step === 'review' && isMultiStepApproval && (
          <ReviewStep
            transaction={transaction}
            onSubmit={async () => {
              const result = await adapter.createTransaction(transaction);
              setTransaction(result);
              setStep('submit');
            }}
          />
        )}

        {step === 'submit' && isMultiStepApproval && (
          <ApprovalPendingStep
            transaction={transaction}
            onComplete={onSuccess}
          />
        )}

        {step === 'payment' && !isMultiStepApproval && (
          <PaymentStep
            amount={transaction.amount!}
            context={context}
            type={type}
            onComplete={async (paymentMethod, details) => {
              const result = await adapter.processPayment({
                ...transaction,
                paymentMethod,
                paymentDetails: details
              });
              setTransaction(result);
              setStep('confirm');
            }}
          />
        )}

        {step === 'confirm' && !isMultiStepApproval && (
          <ConfirmationStep
            transaction={transaction}
            onComplete={onSuccess}
          />
        )}
      </ModalContent>

      <ModalFooter>
        {step !== steps[0] && (
          <Button variant="outline" onClick={() => setStep(getPreviousStep(step, steps))}>
            Back
          </Button>
        )}
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}
```

### 4. Approval Workflow Component

```typescript
// components/chama/ApprovalWorkflow.tsx
export function ApprovalWorkflow({
  withdrawal,
  currentUser,
  chama,
  onUpdate
}: ApprovalWorkflowProps) {
  const isAdmin = chama.members
    .find(m => m.userId === currentUser.id)
    ?.roles.includes(ChamaMemberRole.Admin);
  const isOwner = withdrawal.userId === currentUser.id;
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');

  const handleAction = async (actionType: 'approve' | 'reject') => {
    if (!isAdmin || isOwner) return;

    const updates: ChamaTxUpdates = {
      status: actionType === 'approve' ? ChamaTxStatus.APPROVED : ChamaTxStatus.REJECTED,
      reviews: [{
        memberId: currentUser.id,
        review: actionType === 'approve' ? Review.APPROVE : Review.REJECT
      }],
      reference: comment || undefined
    };

    try {
      await updateChamaTransaction({
        chamaId: withdrawal.metadata.chamaId!,
        txId: withdrawal.id,
        updates
      });
      
      toast.success(`Withdrawal ${actionType}d successfully`);
      onUpdate();
    } catch (error) {
      toast.error(`Failed to ${actionType} withdrawal`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Withdrawal Request</h3>
            <p className="text-sm text-gray-600">
              {formatMoney(withdrawal.amount)} • {formatDate(withdrawal.createdAt)}
            </p>
          </div>
          <TransactionStatusBadge status={withdrawal.status} />
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label>Requested by</Label>
              <p className="font-medium">{getUserDisplayName(withdrawal.userId)}</p>
            </div>
            <div>
              <Label>Amount</Label>
              <p className="font-medium">{formatMoney(withdrawal.amount)}</p>
            </div>
          </div>


          {/* Simple Approval Status - Server handles thresholds */}
          {withdrawal.metadata.reviews && withdrawal.metadata.reviews.length > 0 && (
            <div>
              <Label>Reviews ({withdrawal.metadata.reviewCount})</Label>
              <div className="mt-2 space-y-2">
                {withdrawal.metadata.reviews.map((review, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">
                      {getUserDisplayName(review.memberId)}
                    </span>
                    <Badge variant={review.review === Review.APPROVE ? 'success' : 'destructive'}>
                      {review.review === Review.APPROVE ? 'Approved' : 'Rejected'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admin Actions */}
          {isAdmin && !isOwner && withdrawal.status === 'pending_approval' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment about your decision..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => handleAction('approve')}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction('reject')}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            </div>
          )}

          {/* Member View - Status driven by server */}
          {isOwner && (
            <Alert>
              {withdrawal.status === 'pending_approval' && (
                <InfoIcon className="h-4 w-4" />
              )}
              <AlertDescription>
                {withdrawal.status === 'pending_approval' 
                  ? 'Your withdrawal request is being reviewed by chama administrators.'
                  : withdrawal.status === 'approved'
                  ? 'Your withdrawal has been approved by administrators! You can now proceed to withdraw funds.'
                  : withdrawal.status === 'rejected'
                  ? 'Your withdrawal request was not approved. Contact chama administrators for more information.'
                  : 'Withdrawal processing...'}
              </AlertDescription>
            </Alert>
          )}

          {/* Execute Withdrawal Button - Only when server marks as APPROVED */}
          {isOwner && withdrawal.status === 'approved' && (
            <Button 
              onClick={() => onExecuteWithdrawal(withdrawal)}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Withdraw Funds
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5. Enhanced Payment Method Selector

```typescript
// components/transactions/PaymentMethodSelector.tsx
export function PaymentMethodSelector({
  amount,
  type,
  context,
  onSelect,
  selectedMethod,
  availableMethods = ['mpesa', 'lightning']
}: PaymentMethodSelectorProps) {
  const limits = getPaymentMethodLimits(context);
  const recommendations = getPaymentRecommendations(amount, type);

  return (
    <div className="space-y-4">
      <div>
        <Label>Choose payment method</Label>
        <p className="text-sm text-gray-600">
          Select how you want to {type} {formatMoney(amount)}
        </p>
      </div>

      <div className="grid gap-3">
        {availableMethods.includes('mpesa') && (
          <PaymentMethodCard
            method="mpesa"
            selected={selectedMethod === 'mpesa'}
            onClick={() => onSelect('mpesa')}
            disabled={!isMethodAvailable('mpesa', amount, type, limits)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">M-Pesa</h3>
                  <p className="text-sm text-gray-600">
                    {type === 'deposit' ? 'Send from your M-Pesa' : 'Receive to M-Pesa'}
                  </p>
                </div>
              </div>
              {recommendations.mpesa && (
                <Badge variant="secondary">{recommendations.mpesa}</Badge>
              )}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Limits:</span>
                <span>{formatMoney(limits.mpesa.min)} - {formatMoney(limits.mpesa.max)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing time:</span>
                <span>~2 minutes</span>
              </div>
              {limits.mpesa.fee && (
                <div className="flex justify-between">
                  <span>Fee:</span>
                  <span>{formatMoney(limits.mpesa.fee)}</span>
                </div>
              )}
            </div>
          </PaymentMethodCard>
        )}

        {availableMethods.includes('lightning') && (
          <PaymentMethodCard
            method="lightning"
            selected={selectedMethod === 'lightning'}
            onClick={() => onSelect('lightning')}
            disabled={!isMethodAvailable('lightning', amount, type, limits)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Lightning Network</h3>
                  <p className="text-sm text-gray-600">
                    {type === 'deposit' ? 'Send Bitcoin directly' : 'Receive to Lightning wallet'}
                  </p>
                </div>
              </div>
              {recommendations.lightning && (
                <Badge variant="secondary">{recommendations.lightning}</Badge>
              )}
            </div>
            
            <div className="mt-3 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Limits:</span>
                <span>{formatMoney(limits.lightning.min)} - {formatMoney(limits.lightning.max)}</span>
              </div>
              <div className="flex justify-between">
                <span>Processing time:</span>
                <span>Instant</span>
              </div>
              <div className="flex justify-between">
                <span>Network fee:</span>
                <span>~1 sat</span>
              </div>
            </div>
          </PaymentMethodCard>
        )}
      </div>

      {selectedMethod && (
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            {getPaymentMethodDescription(selectedMethod, type, amount)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- [ ] Create unified transaction types (`/lib/transactions/unified/types.ts`)
- [ ] Implement base transaction adapters for each context
- [ ] Set up TransactionProvider with polling and state management
- [ ] Create base transaction components (Card, Modal, Status)

### Phase 2: Chama Integration (Week 2)
- [ ] Complete chama adapter with approval workflow mapping
- [ ] Implement ApprovalWorkflow component with admin actions
- [ ] Build withdrawal request and execution flows
- [ ] Test multi-step withdrawal approval process
- [ ] Future: Integrate with notification service API when available (currently SMS from backend)

### Phase 3: Personal & Membership Integration (Week 3)
- [ ] Implement personal wallet adapter with wallet types
- [ ] Add membership/shares adapter for subscription flows
- [ ] Create wallet and share selection UI components
- [ ] Test all deposit/withdrawal flows across contexts

### Phase 4: Enhanced UX Components (Week 4)
- [ ] Build enhanced PaymentMethodSelector with limits and recommendations
- [ ] Implement smart amount input with conversion and suggestions
- [ ] Add comprehensive error handling and retry mechanisms
- [ ] Create transaction history and filtering components

### Phase 5: Polish & Integration (Week 5)
- [ ] Add comprehensive error handling and user feedback
- [ ] Implement analytics tracking for transaction flows
- [ ] Performance optimization and loading states
- [ ] Documentation and component examples
- [ ] Migration plan for existing transaction components

## Integration Points

### With Existing API Routes
- **Chama**: Use existing `/api/chama/*` endpoints through adapters
- **Personal**: Leverage `/api/personal/*` for wallet operations  
- **Membership**: Integrate with `/api/membership/*` for share subscriptions
- **Payments**: Connect with existing swap service for MPesa/Lightning

### With Current Components
- **Gradual Migration**: New components work alongside existing ones
- **Shared Payment Logic**: Reuse existing MPesa/Lightning payment flows
- **Status Polling**: Enhance existing transaction status monitoring
- **SMS Notifications**: Backend handles SMS notifications to admins for approvals

## Key Benefits

1. **No Backend Changes**: Leverages existing infrastructure completely
2. **Unified Experience**: Consistent transaction flows across all contexts
3. **Incremental Adoption**: Can migrate component by component
4. **Enhanced Chama Workflow**: Better UX for multi-step approval process
5. **Reusable Components**: Shared logic reduces duplication and maintenance
6. **Type Safety**: Full TypeScript support with existing type definitions
7. **Performance**: Optimized polling and state management
8. **Extensibility**: Easy to add new transaction types or payment methods

## Notification Strategy

### Current Implementation (Immediate)
The backend at `~/bitsacco/os` currently handles all notifications via SMS:

- **Withdrawal Requests**: When member creates request, backend sends SMS to all chama admins
- **Approval Actions**: When admin approves/rejects, backend sends SMS to requesting member
- **Completion Updates**: When withdrawal completes, backend sends SMS confirmation

**Frontend Responsibilities:**
- ✅ No notification logic required in frontend
- ✅ Focus purely on UI and status display
- ✅ Backend handles all notification triggers automatically

### Future Enhancement (Deferred)
When the notification service at `~/bitsacco/os` becomes available:

- **In-App Notifications**: Real-time notifications in web interface
- **Push Notifications**: Browser/mobile push notifications
- **Email Notifications**: Email alerts for important events
- **Notification Preferences**: User control over notification types

**Migration Path:**
1. Current SMS system continues working unchanged
2. New notification service will be additive (not replacement)
3. Frontend can optionally integrate with notification service APIs
4. Users get both SMS (reliable) and in-app (convenient) notifications

## Technical Considerations

### State Management
- Use React Context for transaction state with optimistic updates
- Implement polling with exponential backoff for status updates
- Cache transaction data and user permissions appropriately

### Error Handling
- Centralized error handling in adapters with user-friendly messages
- Automatic retry with exponential backoff for network failures
- Graceful degradation when services are unavailable

### Security
- All sensitive operations happen through authenticated backend APIs
- Client-side validation with server-side verification
- Audit trail maintained by existing backend systems

### Performance
- Lazy load transaction components to reduce bundle size
- Virtual scrolling for transaction lists with many items
- Debounced API calls for real-time updates

This comprehensive architecture provides a clear path to implementing unified, reusable transaction components that enhance the user experience while leveraging all existing infrastructure investments in the Bitsacco platform.