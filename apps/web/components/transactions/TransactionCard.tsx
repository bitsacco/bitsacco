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
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TransactionCard({
  transaction,
  variant = "default",
  className,
}: TransactionCardProps) {

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg hover:border-slate-600 bg-slate-800/50 border-slate-700 ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <TransactionIcon
              type={transaction.type}
              context={transaction.context}
            />
            <div>
              <CardTitle className="text-lg font-semibold text-gray-100">
                {formatTransactionAmount(transaction)}
              </CardTitle>
              <CardDescription className="text-sm text-gray-400 mt-1">
                {getTransactionDescription(transaction)}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <StatusBadge status={transaction.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 border-t border-slate-700/50">
        {/* Context-specific content */}
        {variant !== "compact" && (
          <div className="pt-4 space-y-3">
            {/* Transaction reference */}
            {transaction.metadata.reference && (
              <div className="text-sm">
                <span className="text-gray-500 font-medium">Reference:</span>{" "}
                <span className="text-gray-300">{transaction.metadata.reference}</span>
              </div>
            )}

            {/* Time information */}
            <div className="text-xs text-gray-500 font-medium">
              {formatDistanceToNow(transaction.createdAt, { addSuffix: true })}
            </div>
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


// ============================================================================
// Helper Functions
// ============================================================================

function getTransactionDescription(tx: UnifiedTransaction): string {
  const parts: string[] = [];

  // Add context
  if (tx.context === "chama" && tx.metadata.chamaName) {
    parts.push(tx.metadata.chamaName);
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
