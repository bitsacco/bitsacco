/**
 * Approval Workflow Component
 * Handles chama withdrawal approval interface for administrators
 */

"use client";

import React, { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  InfoIcon,
  UsersIcon,
  UserIcon,
  CalendarIcon,
  ArrowUpIcon,
} from "@phosphor-icons/react";

import { Review } from "@bitsacco/core";
import type { UnifiedTransaction } from "@/lib/transactions/unified/types";
import { formatCurrency } from "@/lib/utils/format";
import { formatDistanceToNow, format } from "date-fns";

// ============================================================================
// Types
// ============================================================================

export interface ApprovalWorkflowProps {
  transaction: UnifiedTransaction;
  currentUserId: string;
  isAdmin: boolean;
  onUpdate: () => void;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ApprovalWorkflow({
  transaction,
  currentUserId,
  isAdmin,
  onUpdate,
  className = "",
}: ApprovalWorkflowProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setError] = useState<string | null>(null);

  const { metadata } = transaction;
  const reviews = metadata.reviews || [];
  const isOwnTransaction = transaction.userId === currentUserId;
  const hasUserReviewed = reviews.some((r) => r.memberId === currentUserId);

  const approvalCount = reviews.filter(
    (r) => r.review === Review.APPROVE,
  ).length;
  const rejectionCount = reviews.filter(
    (r) => r.review === Review.REJECT,
  ).length;
  const totalReviews = reviews.length;

  // Get admin actions from transaction
  const approveAction = transaction.actions.find((a) => a.type === "approve");
  const rejectAction = transaction.actions.find((a) => a.type === "reject");
  const executeAction = transaction.actions.find((a) => a.type === "execute");

  const handleApprove = async () => {
    if (!approveAction || !approveAction.enabled) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await approveAction.handler();
      onUpdate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to approve withdrawal",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectAction || !rejectAction.enabled) return;
    try {
      setIsSubmitting(true);
      setError(null);
      await rejectAction.handler();
      onUpdate();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reject withdrawal",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteWithdrawal = async () => {
    if (executeAction && executeAction.enabled) {
      try {
        setError(null);
        await executeAction.handler();
        onUpdate();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to execute withdrawal",
        );
      }
    }
  };

  return (
    <div
      className={`bg-slate-800 border border-slate-700 rounded-xl ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
              <ArrowUpIcon size={24} weight="bold" className="text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-100">
                Withdrawal Request
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                <span>{formatCurrency(transaction.amount.value * 100)}</span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(transaction.createdAt, {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
          <TransactionStatusBadge status={transaction.status} />
        </div>
      </div>

      {/* Transaction Details */}
      <div className="p-6 border-b border-slate-700">
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Requested by</div>
              <div className="flex items-center gap-2">
                <UserIcon size={16} className="text-gray-400" />
                <span className="text-gray-100 font-medium">
                  {metadata.memberName || "Unknown Member"}
                  {isOwnTransaction && " (You)"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Amount</div>
              <div className="text-gray-100 font-semibold">
                {formatCurrency(transaction.amount.value * 100)}
              </div>
            </div>
          </div>

          {/* Chama Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-400 mb-1">Chama</div>
              <div className="flex items-center gap-2">
                <UsersIcon size={16} className="text-purple-400" />
                <span className="text-gray-100">
                  {metadata.chamaName || "Unknown Chama"}
                </span>
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Request Date</div>
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-gray-400" />
                <span className="text-gray-100">
                  {format(transaction.createdAt, "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Status */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <UsersIcon size={20} className="text-purple-400" />
          <h4 className="text-lg font-medium text-gray-100">
            Admin Reviews ({totalReviews})
          </h4>
        </div>

        {totalReviews > 0 ? (
          <div className="space-y-3">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-700/20 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      review.review === Review.APPROVE
                        ? "bg-green-500/20"
                        : "bg-red-500/20"
                    }`}
                  >
                    {review.review === Review.APPROVE ? (
                      <CheckCircleIcon size={16} className="text-green-400" />
                    ) : (
                      <XCircleIcon size={16} className="text-red-400" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-300">
                      Admin {review.memberId === currentUserId ? "(You)" : ""}
                    </div>
                    <div className="text-xs text-gray-500">
                      {review.review === Review.APPROVE
                        ? "Approved"
                        : "Rejected"}{" "}
                      this request
                    </div>
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    review.review === Review.APPROVE
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {review.review === Review.APPROVE ? "Approved" : "Rejected"}
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-600/30">
              <div className="text-center">
                <div className="text-xl font-semibold text-green-400">
                  {approvalCount}
                </div>
                <div className="text-xs text-gray-500">Approvals</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-red-400">
                  {rejectionCount}
                </div>
                <div className="text-xs text-gray-500">Rejections</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <ClockIcon size={32} className="text-gray-400 mx-auto mb-3" />
            <div className="text-sm text-gray-400">No admin reviews yet</div>
          </div>
        )}
      </div>

      {/* Action Section */}
      <div className="p-6">
        {/* Admin Actions */}
        {isAdmin &&
          !isOwnTransaction &&
          transaction.status === "pending_approval" &&
          !hasUserReviewed && (
            <div className="space-y-4">
              <div className="text-sm font-medium text-gray-300 mb-3">
                Admin Actions Required
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleApprove}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={!approveAction?.enabled || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircleIcon size={16} className="mr-2" />
                      Approve
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReject}
                  variant="secondary"
                  className="flex-1"
                  disabled={!rejectAction?.enabled || isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <>
                      <XCircleIcon size={16} className="mr-2" />
                      Reject
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

        {/* Member Actions */}
        {isOwnTransaction && (
          <div className="space-y-4">
            {transaction.status === "pending_approval" && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <InfoIcon size={16} className="text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <div className="text-blue-300 font-medium mb-1">
                      Awaiting Approval
                    </div>
                    <div className="text-blue-200/80">
                      Your withdrawal request is being reviewed by chama
                      administrators. You&apos;ll receive an SMS notification
                      when they make a decision.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {transaction.status === "approved" && executeAction && (
              <div className="space-y-3">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon
                      size={16}
                      className="text-green-400 mt-0.5"
                    />
                    <div className="text-sm">
                      <div className="text-green-300 font-medium mb-1">
                        Withdrawal Approved!
                      </div>
                      <div className="text-green-200/80">
                        Your withdrawal has been approved. You can now proceed
                        to withdraw your funds.
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleExecuteWithdrawal}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  disabled={!executeAction.enabled}
                >
                  <ArrowUpIcon size={16} className="mr-2" />
                  Withdraw Funds
                </Button>
              </div>
            )}

            {transaction.status === "rejected" && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <XCircleIcon size={16} className="text-red-400 mt-0.5" />
                  <div className="text-sm">
                    <div className="text-red-300 font-medium mb-1">
                      Withdrawal Rejected
                    </div>
                    <div className="text-red-200/80">
                      Your withdrawal request was not approved. Contact chama
                      administrators for more information about this decision.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* General Info for Non-Admins/Non-Members */}
        {!isAdmin && !isOwnTransaction && (
          <div className="p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <InfoIcon size={16} className="text-gray-400 mt-0.5" />
              <div className="text-sm">
                <div className="text-gray-300 font-medium mb-1">
                  Member Withdrawal Request
                </div>
                <div className="text-gray-400">
                  This withdrawal request is being reviewed by chama
                  administrators.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Already Reviewed */}
        {isAdmin && !isOwnTransaction && hasUserReviewed && (
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircleIcon size={16} className="text-purple-400 mt-0.5" />
              <div className="text-sm">
                <div className="text-purple-300 font-medium mb-1">
                  Review Submitted
                </div>
                <div className="text-purple-200/80">
                  You have already reviewed this withdrawal request.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function TransactionStatusBadge({ status }: { status: string }) {
  const getConfig = () => {
    switch (status) {
      case "pending_approval":
        return {
          color: "bg-orange-100 text-orange-800",
          label: "Awaiting Approval",
          icon: <ClockIcon size={12} />,
        };
      case "approved":
        return {
          color: "bg-green-100 text-green-800",
          label: "Approved",
          icon: <CheckCircleIcon size={12} />,
        };
      case "rejected":
        return {
          color: "bg-red-100 text-red-800",
          label: "Rejected",
          icon: <XCircleIcon size={12} />,
        };
      case "processing":
        return {
          color: "bg-blue-100 text-blue-800",
          label: "Processing",
          icon: <ClockIcon size={12} />,
        };
      case "completed":
        return {
          color: "bg-green-100 text-green-800",
          label: "Completed",
          icon: <CheckCircleIcon size={12} />,
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800",
          label: status,
          icon: <InfoIcon size={12} />,
        };
    }
  };

  const config = getConfig();

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}
