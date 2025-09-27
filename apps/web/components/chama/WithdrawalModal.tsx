/**
 * Simplified Chama Withdrawal Modal
 *
 * This modal handles the withdrawal request flow for chama members.
 * The approval logic is handled entirely by the backend - the frontend
 * only tracks and displays the status.
 *
 * Flow:
 * 1. Member requests withdrawal → Status: PENDING
 * 2. Admin approves → Status: APPROVED
 * 3. Member executes withdrawal → Status: PROCESSING → COMPLETE/FAILED
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@bitsacco/ui";
import {
  XIcon,
  CurrencyCircleDollarIcon,
  ArrowDownIcon,
  InfoIcon,
} from "@phosphor-icons/react";
import type { Chama, ChamaTxStatus } from "@bitsacco/core";
import { WithdrawalApprovalStatus } from "@/components/transactions/WithdrawalApprovalStatus";
import { formatCurrency } from "@/lib/utils/format";
import { Routes } from "@/lib/routes";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  chama: Chama;
  memberBalance: number; // in KES
  currentUserId: string;
  isAdmin: boolean;
  onSuccess?: () => void;
}

interface WithdrawalRequest {
  id?: string;
  status?: ChamaTxStatus;
  amount?: number;
}

export function WithdrawalModal({
  isOpen,
  onClose,
  chama,
  memberBalance,
  currentUserId,
  isAdmin,
  onSuccess,
}: WithdrawalModalProps) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeRequest, setActiveRequest] = useState<WithdrawalRequest | null>(
    null,
  );

  // Check for existing pending withdrawal
  const checkExistingRequest = useCallback(async () => {
    try {
      const response = await fetch(
        `${Routes.API.CHAMA.WITHDRAWALS.REQUEST}?chamaId=${chama.id}&memberId=${currentUserId}&status=0`,
        { method: "GET" },
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data?.withdrawals?.length > 0) {
          const withdrawal = data.data.withdrawals[0];
          setActiveRequest({
            id: withdrawal.id,
            status: withdrawal.status,
            amount: withdrawal.amountFiat,
          });
        }
      }
    } catch (err) {
      console.error("Failed to check existing withdrawal:", err);
    }
  }, [chama.id, currentUserId]);

  useEffect(() => {
    if (isOpen) {
      checkExistingRequest();
    }
  }, [isOpen, checkExistingRequest]);

  const handleSubmitRequest = async () => {
    const amountNum = parseFloat(amount);

    // Validation
    if (!amountNum || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountNum < 100) {
      setError("Minimum withdrawal amount is KES 100");
      return;
    }

    if (amountNum > memberBalance) {
      setError("Insufficient balance");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(Routes.API.CHAMA.WITHDRAWALS.REQUEST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chamaId: chama.id,
          amount: amountNum,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit withdrawal request");
      }

      // Set the active request with the new withdrawal
      setActiveRequest({
        id: data.data.txId,
        status: 0, // PENDING
        amount: amountNum,
      });

      // Clear form
      setAmount("");

      // Notify parent
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteWithdrawal = () => {
    if (!activeRequest?.id) return;

    // Navigate to withdrawal execution page
    window.location.href = `/dashboard/chamas/${chama.id}/withdrawals/${activeRequest.id}/execute`;
  };

  const handleCancelRequest = async () => {
    if (!activeRequest?.id) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `${Routes.API.CHAMA.WITHDRAWALS}/${activeRequest.id}/cancel`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chamaId: chama.id }),
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel withdrawal");
      }

      // Clear active request
      setActiveRequest(null);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-500/10 rounded-lg">
              <ArrowDownIcon size={20} className="text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-100">
              Withdraw from {chama.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            <XIcon size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Balance Display */}
          <div className="bg-slate-900/50 rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-gray-100">
              {formatCurrency(memberBalance)}
            </p>
          </div>

          {/* Show existing request if any */}
          {activeRequest && activeRequest.status !== undefined ? (
            <div className="space-y-4">
              <WithdrawalApprovalStatus
                status={activeRequest.status}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />

              {/* Show request details */}
              <div className="bg-slate-900/50 rounded-xl p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount</span>
                    <span className="text-gray-100 font-medium">
                      {formatCurrency(activeRequest.amount || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions based on status */}
              <div className="flex gap-3">
                {activeRequest.status === 4 && ( // APPROVED
                  <Button
                    variant="tealPrimary"
                    fullWidth
                    onClick={handleExecuteWithdrawal}
                    className="shadow-lg shadow-teal-500/20"
                  >
                    Execute Withdrawal
                  </Button>
                )}

                {(activeRequest.status === 0 || activeRequest.status === 4) && ( // PENDING or APPROVED
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={handleCancelRequest}
                    disabled={isSubmitting}
                    className="!bg-slate-700/50 !text-gray-300 !border-slate-600"
                  >
                    Cancel Request
                  </Button>
                )}

                {(activeRequest.status === 5 || activeRequest.status === 2) && ( // REJECTED or FAILED
                  <Button
                    variant="tealPrimary"
                    fullWidth
                    onClick={() => setActiveRequest(null)}
                    className="shadow-lg shadow-teal-500/20"
                  >
                    Create New Request
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* New Request Form */
            <div className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Withdrawal Amount (KES)
                </label>
                <div className="relative">
                  <CurrencyCircleDollarIcon
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError(null);
                    }}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Min: KES 100 • Available: {formatCurrency(memberBalance)}
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex gap-3">
                  <InfoIcon
                    size={20}
                    className="text-blue-400 flex-shrink-0 mt-0.5"
                  />
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Approval Required</p>
                    <p className="text-blue-300/80">
                      Your withdrawal request will be sent to chama admins for
                      approval. Once approved, you can execute the withdrawal.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                variant="tealPrimary"
                fullWidth
                onClick={handleSubmitRequest}
                loading={isSubmitting}
                disabled={!amount || parseFloat(amount) <= 0}
                className="shadow-lg shadow-teal-500/20"
              >
                Submit Withdrawal Request
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
