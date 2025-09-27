/**
 * Simplified Withdrawal Approval Status Component
 *
 * This component displays the current approval status of a withdrawal transaction.
 * The backend handles all approval logic - frontend just displays the status.
 *
 * Key points:
 * - Backend sets status to APPROVED when ANY admin approves
 * - Backend sets status to REJECTED when ANY admin rejects
 * - No threshold requirements - it's a simple binary approval
 * - Frontend only tracks and displays the current status
 */

"use client";

import React from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserCheckIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import type { ChamaTxStatus, ChamaTxReview } from "@bitsacco/core";

interface WithdrawalApprovalStatusProps {
  status: ChamaTxStatus;
  reviews?: ChamaTxReview[];
  currentUserId: string;
  isAdmin: boolean;
  memberName?: string;
}

export function WithdrawalApprovalStatus({
  status,
  reviews = [],
  currentUserId,
  isAdmin,
}: WithdrawalApprovalStatusProps) {
  // Determine the current state based on backend status
  const getStatusDisplay = () => {
    switch (status) {
      case 0: // PENDING
        return {
          icon: ClockIcon,
          color: "text-yellow-400",
          bgColor: "bg-yellow-500/10",
          borderColor: "border-yellow-500/30",
          label: "Pending Approval",
          description: isAdmin
            ? "This withdrawal request needs admin approval"
            : "Your withdrawal request is awaiting admin approval",
        };

      case 4: // APPROVED
        return {
          icon: CheckCircleIcon,
          color: "text-green-400",
          bgColor: "bg-green-500/10",
          borderColor: "border-green-500/30",
          label: "Approved",
          description:
            "This withdrawal has been approved and can now be executed",
        };

      case 5: // REJECTED
        return {
          icon: XCircleIcon,
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          label: "Rejected",
          description: "This withdrawal request has been rejected by an admin",
        };

      case 1: // PROCESSING
        return {
          icon: ClockIcon,
          color: "text-blue-400",
          bgColor: "bg-blue-500/10",
          borderColor: "border-blue-500/30",
          label: "Processing",
          description: "Withdrawal is being processed",
        };

      case 3: // COMPLETE
        return {
          icon: CheckCircleIcon,
          color: "text-teal-400",
          bgColor: "bg-teal-500/10",
          borderColor: "border-teal-500/30",
          label: "Completed",
          description: "Withdrawal has been completed successfully",
        };

      case 2: // FAILED
        return {
          icon: WarningCircleIcon,
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          borderColor: "border-red-500/30",
          label: "Failed",
          description: "Withdrawal failed during processing",
        };

      default:
        return {
          icon: ClockIcon,
          color: "text-gray-400",
          bgColor: "bg-gray-500/10",
          borderColor: "border-gray-500/30",
          label: "Unknown",
          description: "Status unknown",
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;

  // Check if current user has already reviewed (for admins)
  const hasUserReviewed = reviews.some((r) => r.memberId === currentUserId);

  return (
    <div
      className={`p-4 rounded-xl ${statusDisplay.bgColor} ${statusDisplay.borderColor} border`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${statusDisplay.bgColor}`}>
          <StatusIcon size={24} className={statusDisplay.color} weight="fill" />
        </div>

        <div className="flex-1">
          <h4 className={`font-semibold text-lg ${statusDisplay.color} mb-1`}>
            {statusDisplay.label}
          </h4>
          <p className="text-gray-400 text-sm">{statusDisplay.description}</p>

          {/* Show review info if available */}
          {reviews.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <UserCheckIcon size={16} />
                <span>
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}

          {/* Admin-specific info */}
          {isAdmin && status === 0 && (
            <div className="mt-3">
              {hasUserReviewed ? (
                <div className="text-sm text-gray-400">
                  You have already reviewed this withdrawal
                </div>
              ) : (
                <div className="text-sm text-yellow-400">
                  Action required: Please review this withdrawal request
                </div>
              )}
            </div>
          )}

          {/* Member-specific info */}
          {!isAdmin && status === 4 && (
            <div className="mt-3">
              <div className="text-sm text-green-400">
                Your withdrawal is approved! You can now execute the withdrawal.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for use in transaction lists
 */
export function WithdrawalApprovalBadge({
  status,
  isAdmin,
  hasUserReviewed,
}: {
  status: ChamaTxStatus;
  isAdmin: boolean;
  hasUserReviewed?: boolean;
}) {
  const getBadgeDisplay = () => {
    switch (status) {
      case 0: // PENDING
        if (isAdmin && !hasUserReviewed) {
          return {
            label: "Action Required",
            className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          };
        }
        return {
          label: "Pending",
          className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        };

      case 4: // APPROVED
        return {
          label: "Approved",
          className: "bg-green-500/20 text-green-400 border-green-500/30",
        };

      case 5: // REJECTED
        return {
          label: "Rejected",
          className: "bg-red-500/20 text-red-400 border-red-500/30",
        };

      case 1: // PROCESSING
        return {
          label: "Processing",
          className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        };

      case 3: // COMPLETE
        return {
          label: "Completed",
          className: "bg-teal-500/20 text-teal-400 border-teal-500/30",
        };

      case 2: // FAILED
        return {
          label: "Failed",
          className: "bg-red-500/20 text-red-400 border-red-500/30",
        };

      default:
        return {
          label: "Unknown",
          className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
        };
    }
  };

  const badge = getBadgeDisplay();

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${badge.className}`}
    >
      {badge.label}
    </span>
  );
}
