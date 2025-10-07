/**
 * Review Step Component
 * Final review before transaction submission
 */

"use client";

import React from "react";
import {
  Button,
  Card,
  CardContent,
  Alert,
  AlertDescription,
} from "@bitsacco/ui";
import { Info as InformationCircleIcon } from "@phosphor-icons/react";

import type {
  TransactionContext,
  UnifiedTransactionType as TransactionType,
  Money,
} from "@bitsacco/core";
import { formatCurrency } from "@/lib/utils/format";

// ============================================================================
// Types
// ============================================================================

export interface ReviewStepProps {
  context: TransactionContext;
  type: TransactionType;
  amount: Money;
  targetName: string;
  onSubmit: () => void;
  loading: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ReviewStep({
  context,
  type,
  amount,
  targetName,
  onSubmit,
  loading,
}: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-3 text-gray-100">
          Review your request
        </h3>

        <Card className="bg-slate-700/30 border-slate-600/50">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Type:</span>
              <span className="font-medium text-gray-100">
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Amount:</span>
              <span className="font-medium text-gray-100">
                {formatCurrency(amount.value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">From:</span>
              <span className="font-medium text-gray-100">{targetName}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {context === "chama" && type === "withdrawal" && (
        <Alert className="bg-blue-500/10 border-blue-500/30 text-blue-300">
          <InformationCircleIcon className="h-4 w-4" />
          <AlertDescription>
            Your withdrawal request will be sent to chama administrators for
            approval. You will be notified once a decision is made.
          </AlertDescription>
        </Alert>
      )}

      <Button
        variant="tealPrimary"
        onClick={onSubmit}
        disabled={loading}
        className="w-full shadow-lg shadow-teal-500/20"
      >
        {loading ? "Submitting..." : "Submit Request"}
      </Button>
    </div>
  );
}
