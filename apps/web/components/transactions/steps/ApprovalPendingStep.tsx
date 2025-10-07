/**
 * Approval Pending Step
 * Shows chama withdrawal approval status and next steps
 */

"use client";

import React from "react";
import { Alert, AlertDescription } from "@bitsacco/ui";
import { Info as InformationCircleIcon } from "@phosphor-icons/react";

import type { UnifiedTransaction } from "@bitsacco/core";

// ============================================================================
// Types
// ============================================================================

export interface ApprovalPendingStepProps {
  transaction?: UnifiedTransaction | null;
  transactionType?: string;
}

// ============================================================================
// Component
// ============================================================================

export function ApprovalPendingStep({
  transaction,
  transactionType,
}: ApprovalPendingStepProps) {
  const isWithdrawal = transactionType === "withdrawal";
  const title = isWithdrawal ? "Request Submitted" : "Processing Transaction";
  const description = isWithdrawal
    ? "Your withdrawal request has been submitted and is awaiting approval from chama administrators."
    : "Your transaction is being processed. This should not require approval.";

  // Note: Non-withdrawal transactions should not normally reach this step
  return (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
        <InformationCircleIcon size={32} className="text-orange-400" />
      </div>

      <div>
        <h3 className="font-semibold text-lg text-gray-100">{title}</h3>
        <p className="text-gray-400 mt-2">{description}</p>
      </div>

      {transaction && (
        <div className="text-sm text-gray-500">
          <p>Request ID: {transaction.id.slice(-8)}</p>
        </div>
      )}

      {isWithdrawal && (
        <Alert className="bg-blue-500/10 border-blue-500/30 text-blue-300">
          <InformationCircleIcon className="h-4 w-4" />
          <AlertDescription>
            You will receive an SMS notification once your request has been
            reviewed.
          </AlertDescription>
        </Alert>
      )}

      {!isWithdrawal && (
        <Alert className="bg-yellow-500/10 border-yellow-500/30 text-yellow-300">
          <InformationCircleIcon className="h-4 w-4" />
          <AlertDescription>
            This deposit should not require approval. If you see this message,
            please contact support.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
