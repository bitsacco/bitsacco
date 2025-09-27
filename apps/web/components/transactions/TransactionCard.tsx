/**
 * Reusable Transaction Card Component
 * Renders any transaction type with context-aware UI
 */

"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
} from "@bitsacco/ui";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  WarningCircleIcon,
  UsersIcon,
  WalletIcon,
  ShareIcon,
} from "@phosphor-icons/react";

import type {
  UnifiedTransaction,
  TransactionAction,
  TransactionStatus,
  TransactionType,
  TransactionContext,
} from "@/lib/transactions/unified/types";
import {
  formatTransactionAmount,
  getStatusLabel,
} from "@/lib/transactions/unified/types";

// ============================================================================
// Types
// ============================================================================

export interface TransactionCardProps {
  transaction: UnifiedTransaction;
  onAction?: (action: TransactionAction) => Promise<void>;
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TransactionCard({
  transaction,
  onAction,
  variant = "default",
  className,
}: TransactionCardProps) {
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = React.useState<string | null>(
    null,
  );

  const handleAction = async (action: TransactionAction) => {
    if (action.requiresConfirmation && !showConfirmation) {
      setShowConfirmation(action.type);
      return;
    }

    try {
      setActionLoading(action.type);
      setShowConfirmation(null);
      await action.handler();
      if (onAction) {
        await onAction(action);
      }
    } catch {
      // Handle action error silently
    } finally {
      setActionLoading(null);
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmation(null);
  };

  return (
    <Card
      className={`transition-all hover:shadow-lg hover:border-slate-600 ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <TransactionIcon
              type={transaction.type}
              context={transaction.context}
            />
            <div>
              <CardTitle className="text-lg font-semibold">
                {formatTransactionAmount(transaction)}
              </CardTitle>
              <CardDescription className="text-sm">
                {getTransactionDescription(transaction)}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <StatusBadge status={transaction.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Context-specific content */}
        {variant !== "compact" && (
          <div className="space-y-3">
            {/* Transaction reference */}
            {transaction.metadata.reference && (
              <div className="text-sm text-gray-400">
                <span className="font-medium">Reference:</span>{" "}
                {transaction.metadata.reference}
              </div>
            )}

            {/* Time information */}
            <div className="text-xs text-gray-500">
              {formatDistanceToNow(transaction.createdAt, { addSuffix: true })}
            </div>

            {/* Actions */}
            {transaction.actions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {transaction.actions.map((action) => (
                  <div key={action.type} className="relative">
                    {showConfirmation === action.type ? (
                      <ConfirmationDialog
                        message={action.confirmationMessage || "Are you sure?"}
                        onConfirm={() => handleAction(action)}
                        onCancel={cancelConfirmation}
                      />
                    ) : (
                      <ActionButton
                        action={action}
                        loading={actionLoading === action.type}
                        onClick={() => handleAction(action)}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function TransactionIcon({
  type,
  context,
}: {
  type: TransactionType;
  context: TransactionContext;
}) {
  const getIcon = () => {
    if (type === "deposit") {
      return (
        <ArrowDownIcon className="text-green-500" size={24} weight="bold" />
      );
    }
    if (type === "withdrawal") {
      return <ArrowUpIcon className="text-red-500" size={24} weight="bold" />;
    }
    if (type === "transfer") {
      return <ShareIcon className="text-blue-500" size={24} weight="bold" />;
    }
    return <WalletIcon className="text-gray-500" size={24} />;
  };

  const getContextIcon = () => {
    if (context === "chama") {
      return <UsersIcon className="text-purple-500" size={16} />;
    }
    if (context === "personal") {
      return <WalletIcon className="text-blue-500" size={16} />;
    }
    return null;
  };

  return (
    <div className="relative">
      {getIcon()}
      <div className="absolute -bottom-1 -right-1">{getContextIcon()}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: TransactionStatus }) {
  const getIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon size={14} weight="fill" />;
      case "failed":
      case "rejected":
        return <XCircleIcon size={14} weight="fill" />;
      case "pending":
      case "pending_approval":
      case "processing":
        return <ClockIcon size={14} weight="fill" />;
      case "approved":
        return <WarningCircleIcon size={14} weight="fill" />;
      default:
        return null;
    }
  };

  const colorClass = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    pending_approval: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    approved: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    processing: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    completed: "bg-green-500/20 text-green-300 border-green-500/30",
    failed: "bg-red-500/20 text-red-300 border-red-500/30",
    rejected: "bg-red-500/20 text-red-300 border-red-500/30",
    expired: "bg-gray-500/20 text-gray-300 border-gray-500/30",
  }[status];

  return (
    <Badge
      className={`${colorClass} flex items-center gap-1 border px-2 py-1 rounded-full text-xs font-medium`}
    >
      {getIcon()}
      <span>{getStatusLabel(status)}</span>
    </Badge>
  );
}

// function ApprovalStatus({
//   requiredApprovals,
//   currentApprovals,
// }: {
//   requiredApprovals?: number;
//   currentApprovals?: number;
// }) {
//   if (!requiredApprovals) return null;

//   const progress = ((currentApprovals || 0) / requiredApprovals) * 100;

//   return (
//     <div className="space-y-2">
//       <div className="flex items-center justify-between text-sm">
//         <span className="text-gray-400">Approvals</span>
//         <span className="font-medium">
//           {currentApprovals || 0} / {requiredApprovals}
//         </span>
//       </div>
//       <div className="w-full bg-slate-700 rounded-full h-2">
//         <div
//           className="bg-teal-500 h-2 rounded-full transition-all"
//           style={{ width: `${progress}%` }}
//         />
//       </div>
//     </div>
//   );
// }

function ActionButton({
  action,
  loading,
  onClick,
}: {
  action: TransactionAction;
  loading: boolean;
  onClick: () => void;
}) {
  const variantMap = {
    primary: "tealPrimary",
    secondary: "outline",
    danger: "outline",
  } as const;

  return (
    <Button
      variant={variantMap[action.variant || "secondary"]}
      size="sm"
      disabled={!action.enabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
          <span>Processing...</span>
        </div>
      ) : (
        action.label
      )}
    </Button>
  );
}

function ConfirmationDialog({
  message,
  onConfirm,
  onCancel,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="absolute z-10 bottom-full mb-2 left-0 bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-4 min-w-[250px]">
      <p className="text-sm mb-3 text-gray-100">{message}</p>
      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          className="border-slate-600 text-gray-300 hover:bg-slate-700"
        >
          Cancel
        </Button>
        <Button variant="tealPrimary" size="sm" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getTransactionDescription(tx: UnifiedTransaction): string {
  const parts: string[] = [];

  // Add context
  if (tx.context === "chama" && tx.metadata.chamaName) {
    parts.push(tx.metadata.chamaName);
  } else if (tx.context === "personal" && tx.metadata.walletName) {
    parts.push(tx.metadata.walletName);
  } else {
    parts.push(tx.context.charAt(0).toUpperCase() + tx.context.slice(1));
  }

  // Add type
  parts.push(tx.type);

  // Add user info for chama transactions
  if (tx.context === "chama" && tx.metadata.memberName) {
    parts.push(`by ${tx.metadata.memberName}`);
  }

  return parts.join(" ");
}
