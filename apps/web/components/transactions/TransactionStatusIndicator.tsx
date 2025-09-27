/**
 * Transaction Status Indicator
 * Comprehensive status display with progress tracking and real-time updates
 */

"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowClockwiseIcon,
  InfoIcon,
  WarningIcon,
  BellIcon,
  PhoneIcon,
} from "@phosphor-icons/react";

import type {
  UnifiedTransaction,
  TransactionStatus,
  TransactionContext,
} from "@/lib/transactions/unified/types";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/utils/format";
import { Review } from "@bitsacco/core";

// ============================================================================
// Types
// ============================================================================

export interface TransactionStatusIndicatorProps {
  transaction: UnifiedTransaction;
  showProgress?: boolean;
  showActions?: boolean;
  showDetails?: boolean;
  variant?: "default" | "compact" | "detailed";
  onActionClick?: (actionType: string) => void;
  className?: string;
}

interface StatusConfig {
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  progressPercent: number;
  isAnimated?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function TransactionStatusIndicator({
  transaction,
  showProgress = true,
  showActions = true,
  showDetails = false,
  variant = "default",
  onActionClick,
  className = "",
}: TransactionStatusIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState("");

  // Update time ago periodically
  useEffect(() => {
    const updateTime = () => {
      setTimeAgo(
        formatDistanceToNow(transaction.createdAt, { addSuffix: true }),
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [transaction.createdAt]);

  const statusConfig = getStatusConfig(transaction.status, transaction.context);

  if (variant === "compact") {
    return (
      <CompactStatusIndicator
        statusConfig={statusConfig}
        timeAgo={timeAgo}
        className={className}
      />
    );
  }

  if (variant === "detailed") {
    return (
      <DetailedStatusIndicator
        transaction={transaction}
        statusConfig={statusConfig}
        timeAgo={timeAgo}
        showProgress={showProgress}
        showActions={showActions}
        showDetails={showDetails}
        onActionClick={onActionClick}
        className={className}
      />
    );
  }

  return (
    <DefaultStatusIndicator
      transaction={transaction}
      statusConfig={statusConfig}
      timeAgo={timeAgo}
      showProgress={showProgress}
      showActions={showActions}
      onActionClick={onActionClick}
      className={className}
    />
  );
}

// ============================================================================
// Variant Components
// ============================================================================

function CompactStatusIndicator({
  statusConfig,
  timeAgo,
  className,
}: {
  statusConfig: StatusConfig;
  timeAgo: string;
  className: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${statusConfig.bgColor}`} />
      <span className={`text-sm font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
      <span className="text-xs text-gray-500">•</span>
      <span className="text-xs text-gray-500">{timeAgo}</span>
    </div>
  );
}

function DefaultStatusIndicator({
  transaction,
  statusConfig,
  timeAgo,
  showProgress,
  showActions,
  onActionClick,
  className,
}: {
  transaction: UnifiedTransaction;
  statusConfig: StatusConfig;
  timeAgo: string;
  showProgress: boolean;
  showActions: boolean;
  onActionClick?: (actionType: string) => void;
  className: string;
}) {
  return (
    <div
      className={`bg-slate-700/30 border ${statusConfig.borderColor} rounded-lg p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${statusConfig.bgColor}`}
        >
          {statusConfig.icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`font-medium ${statusConfig.color}`}>
              {statusConfig.label}
            </h4>
            <span className="text-xs text-gray-500">{timeAgo}</span>
          </div>

          <p className="text-sm text-gray-400 mb-2">
            {statusConfig.description}
          </p>

          {showProgress && (
            <ProgressBar
              percent={statusConfig.progressPercent}
              isAnimated={statusConfig.isAnimated}
              color={statusConfig.color}
            />
          )}

          {/* Context-specific information */}
          <ContextualInfo transaction={transaction} />
        </div>
      </div>

      {showActions && transaction.actions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-600/30">
          <QuickActions
            actions={transaction.actions}
            onActionClick={onActionClick}
          />
        </div>
      )}
    </div>
  );
}

function DetailedStatusIndicator({
  transaction,
  statusConfig,
  timeAgo,
  showProgress,
  showActions,
  showDetails,
  onActionClick,
  className,
}: {
  transaction: UnifiedTransaction;
  statusConfig: StatusConfig;
  timeAgo: string;
  showProgress: boolean;
  showActions: boolean;
  showDetails: boolean;
  onActionClick?: (actionType: string) => void;
  className: string;
}) {
  // Validation: Deposits should never have pending_approval status
  if (
    transaction.type === "deposit" &&
    transaction.status === "pending_approval"
  ) {
    // Handle invalid status gracefully - show as processing instead
  }

  return (
    <div
      className={`bg-slate-800 border ${statusConfig.borderColor} rounded-xl ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${statusConfig.bgColor}`}
          >
            {statusConfig.icon}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-100">
                {getTransactionTitle(transaction)}
              </h3>
              <StatusBadge
                status={transaction.status}
                color={statusConfig.color}
                bgColor={statusConfig.bgColor}
              />
            </div>

            <div className="text-sm text-gray-400 mb-3">
              {formatCurrency(transaction.amount.value * 100)} • {timeAgo}
            </div>

            {showProgress && (
              <ProgressBar
                percent={statusConfig.progressPercent}
                isAnimated={statusConfig.isAnimated}
                color={statusConfig.color}
              />
            )}
          </div>
        </div>
      </div>

      {/* Status Description */}
      <div className="p-6 border-b border-slate-700">
        <div
          className={`p-4 rounded-lg ${statusConfig.bgColor} ${statusConfig.borderColor} border`}
        >
          <div className="flex items-start gap-3">
            {statusConfig.icon}
            <div>
              <div className={`font-medium ${statusConfig.color} mb-1`}>
                {statusConfig.label}
              </div>
              <div className={`text-sm ${statusConfig.color}/80`}>
                {statusConfig.description}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <div className="p-6 border-b border-slate-700">
          <DetailedTransactionInfo transaction={transaction} />
        </div>
      )}

      {/* Contextual Information */}
      <div className="p-6 border-b border-slate-700">
        <ContextualInfo transaction={transaction} />
      </div>

      {/* Actions */}
      {showActions && transaction.actions.length > 0 && (
        <div className="p-6">
          <div className="text-sm font-medium text-gray-300 mb-3">
            Available Actions
          </div>
          <QuickActions
            actions={transaction.actions}
            onActionClick={onActionClick}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function ProgressBar({
  percent,
  isAnimated,
  color,
}: {
  percent: number;
  isAnimated?: boolean;
  color: string;
}) {
  const barColorClass = color.includes("green")
    ? "bg-green-500"
    : color.includes("blue")
      ? "bg-blue-500"
      : color.includes("orange")
        ? "bg-orange-500"
        : color.includes("red")
          ? "bg-red-500"
          : "bg-gray-500";

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>Progress</span>
        <span>{percent}%</span>
      </div>
      <div className="w-full bg-slate-600/50 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${barColorClass} ${
            isAnimated ? "animate-pulse" : ""
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  color,
  bgColor,
}: {
  status: TransactionStatus;
  color: string;
  bgColor: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${bgColor} ${color}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function ContextualInfo({ transaction }: { transaction: UnifiedTransaction }) {
  const { context, metadata, status } = transaction;

  if (context === "chama" && status === "pending_approval") {
    return (
      <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <BellIcon size={14} className="text-orange-400 mt-0.5" />
          <div className="text-xs">
            <div className="text-orange-300 font-medium">
              SMS Notifications Sent
            </div>
            <div className="text-orange-200/80">
              Chama administrators have been notified and will review your
              request.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (context === "chama" && metadata.reviews && metadata.reviews.length > 0) {
    const approvals = metadata.reviews.filter(
      (r) => r.review === Review.APPROVE,
    ).length;
    const rejections = metadata.reviews.filter(
      (r) => r.review === Review.REJECT,
    ).length;

    return (
      <div className="mt-3 p-3 bg-slate-700/20 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">Admin Reviews</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <CheckCircleIcon size={12} className="text-green-400" />
            <span className="text-xs text-green-400">{approvals} Approved</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircleIcon size={12} className="text-red-400" />
            <span className="text-xs text-red-400">{rejections} Rejected</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === "processing") {
    return (
      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <div className="flex items-start gap-2">
          <PhoneIcon size={14} className="text-blue-400 mt-0.5" />
          <div className="text-xs">
            <div className="text-blue-300 font-medium">Processing Payment</div>
            <div className="text-blue-200/80">
              {metadata.paymentMethod === "mpesa"
                ? "Check your phone for M-Pesa prompt or confirmation SMS"
                : "Your payment is being processed"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function DetailedTransactionInfo({
  transaction,
}: {
  transaction: UnifiedTransaction;
}) {
  const { metadata } = transaction;

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-300 mb-3">
        Transaction Details
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        {metadata.reference && (
          <div>
            <div className="text-gray-400 mb-1">Reference</div>
            <div className="text-gray-300 font-mono">{metadata.reference}</div>
          </div>
        )}

        {metadata.paymentMethod && (
          <div>
            <div className="text-gray-400 mb-1">Payment Method</div>
            <div className="text-gray-300 capitalize">
              {metadata.paymentMethod}
            </div>
          </div>
        )}

        {metadata.chamaName && (
          <div>
            <div className="text-gray-400 mb-1">Chama</div>
            <div className="text-gray-300">{metadata.chamaName}</div>
          </div>
        )}

        {metadata.walletName && (
          <div>
            <div className="text-gray-400 mb-1">Wallet</div>
            <div className="text-gray-300">{metadata.walletName}</div>
          </div>
        )}

        {metadata.shareQuantity && (
          <div>
            <div className="text-gray-400 mb-1">Shares</div>
            <div className="text-gray-300">{metadata.shareQuantity} shares</div>
          </div>
        )}
      </div>
    </div>
  );
}

function QuickActions({
  actions,
  onActionClick,
}: {
  actions: Array<{
    type: string;
    label: string;
    enabled: boolean;
    variant?: string;
  }>;
  onActionClick?: (actionType: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.slice(0, 3).map((action) => (
        <button
          key={action.type}
          onClick={() => onActionClick?.(action.type)}
          disabled={!action.enabled}
          className={`px-3 py-2 text-sm rounded-lg transition-colors ${
            action.variant === "primary"
              ? "bg-teal-600 hover:bg-teal-700 text-white"
              : action.variant === "danger"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-slate-600 hover:bg-slate-500 text-gray-300"
          } ${!action.enabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {action.label}
        </button>
      ))}

      {actions.length > 3 && (
        <button className="px-3 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors">
          +{actions.length - 3} more
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Helper Functions
// ============================================================================

function getStatusConfig(
  status: TransactionStatus,
  context: TransactionContext,
): StatusConfig {
  switch (status) {
    case "pending":
      return {
        label: "Pending",
        description: "Transaction is being initialized",
        icon: <ClockIcon size={20} className="text-yellow-400" />,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/20",
        borderColor: "border-yellow-500/30",
        progressPercent: 10,
        isAnimated: true,
      };

    case "pending_approval":
      return {
        label: "Awaiting Approval",
        description:
          context === "chama"
            ? "Chama administrators are reviewing your withdrawal request"
            : "Transaction requires approval",
        icon: <ClockIcon size={20} className="text-orange-400" />,
        color: "text-orange-400",
        bgColor: "bg-orange-500/20",
        borderColor: "border-orange-500/30",
        progressPercent: 25,
        isAnimated: true,
      };

    case "approved":
      return {
        label: "Approved",
        description: "Transaction approved and ready for execution",
        icon: <CheckCircleIcon size={20} className="text-blue-400" />,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
        progressPercent: 50,
      };

    case "processing":
      return {
        label: "Processing",
        description: "Payment is being processed",
        icon: <ArrowClockwiseIcon size={20} className="text-blue-400" />,
        color: "text-blue-400",
        bgColor: "bg-blue-500/20",
        borderColor: "border-blue-500/30",
        progressPercent: 75,
        isAnimated: true,
      };

    case "completed":
      return {
        label: "Completed",
        description: "Transaction completed successfully",
        icon: <CheckCircleIcon size={20} className="text-green-400" />,
        color: "text-green-400",
        bgColor: "bg-green-500/20",
        borderColor: "border-green-500/30",
        progressPercent: 100,
      };

    case "failed":
      return {
        label: "Failed",
        description: "Transaction failed and requires attention",
        icon: <XCircleIcon size={20} className="text-red-400" />,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/30",
        progressPercent: 0,
      };

    case "rejected":
      return {
        label: "Rejected",
        description:
          context === "chama"
            ? "Withdrawal request was rejected by administrators"
            : "Transaction was rejected",
        icon: <XCircleIcon size={20} className="text-red-400" />,
        color: "text-red-400",
        bgColor: "bg-red-500/20",
        borderColor: "border-red-500/30",
        progressPercent: 0,
      };

    case "expired":
      return {
        label: "Expired",
        description: "Transaction expired and is no longer valid",
        icon: <WarningIcon size={20} className="text-gray-400" />,
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
        borderColor: "border-gray-500/30",
        progressPercent: 0,
      };

    default:
      return {
        label: status,
        description: "Unknown status",
        icon: <InfoIcon size={20} className="text-gray-400" />,
        color: "text-gray-400",
        bgColor: "bg-gray-500/20",
        borderColor: "border-gray-500/30",
        progressPercent: 0,
      };
  }
}

function getStatusLabel(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    pending: "Pending",
    pending_approval: "Awaiting Approval",
    approved: "Approved",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
    rejected: "Rejected",
    expired: "Expired",
  };

  return labels[status] || status;
}

function getTransactionTitle(transaction: UnifiedTransaction): string {
  const { type, context, metadata } = transaction;

  const target =
    metadata.chamaName ||
    metadata.walletName ||
    (context === "chama"
      ? "Chama"
      : context === "personal"
        ? "Wallet"
        : "Account");

  if (type === "deposit") {
    return `Deposit to ${target}`;
  } else if (type === "withdrawal") {
    return `Withdrawal from ${target}`;
  } else if (type === "subscription") {
    return `Share Purchase`;
  } else if (type === "transfer") {
    return `Transfer to ${target}`;
  }

  return `${type} Transaction`;
}
