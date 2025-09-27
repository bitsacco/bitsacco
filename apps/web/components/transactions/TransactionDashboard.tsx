/**
 * Transaction Dashboard
 * Complete responsive transaction management interface with mobile-first design
 */

"use client";

import React, { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ShareIcon,
  BellIcon,
  FunnelIcon,
} from "@phosphor-icons/react";

import type {
  UnifiedTransaction,
  TransactionContext,
  TransactionType,
} from "@/lib/transactions/unified/types";

import { TransactionList } from "./TransactionList";
import { TransactionModal } from "./TransactionModal";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { TransactionStatusIndicator } from "./TransactionStatusIndicator";
import { useTransactions } from "@/lib/transactions/unified/TransactionProvider";

// ============================================================================
// Types
// ============================================================================

export interface TransactionDashboardProps {
  context?: TransactionContext;
  targetId?: string;
  targetName?: string;
  currentUserId: string;
  isAdmin?: boolean;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TransactionDashboard({
  context,
  targetId,
  targetName,
  currentUserId,
  isAdmin = false,
  className = "",
}: TransactionDashboardProps) {
  const { transactions, loading, error, filter, setFilter, fetchTransactions } =
    useTransactions();

  // State
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedTransactionType, setSelectedTransactionType] =
    useState<TransactionType>("deposit");
  const [selectedContext, setSelectedContext] = useState<TransactionContext>(
    context || "personal",
  );
  const [showQuickActions, setShowQuickActions] = useState(true);

  // Filter transactions based on context if specified
  const filteredTransactions = context
    ? transactions.filter(
        (tx) =>
          tx.context === context &&
          (!targetId ||
            tx.metadata.walletId === targetId ||
            tx.metadata.chamaId === targetId),
      )
    : transactions;

  // Get pending approvals for admins
  const pendingApprovals = filteredTransactions.filter(
    (tx) =>
      tx.status === "pending_approval" && tx.context === "chama" && isAdmin,
  );

  const handleTransactionAction = async (
    transaction: UnifiedTransaction,
    actionType: string,
  ) => {
    const action = transaction.actions.find((a) => a.type === actionType);
    if (action && action.enabled) {
      try {
        await action.handler();
        // Refresh transactions after action
        await fetchTransactions();
      } catch {
        // Handle action error silently
      }
    }
  };

  const openTransactionModal = (
    type: TransactionType,
    txContext?: TransactionContext,
  ) => {
    setSelectedTransactionType(type);
    setSelectedContext(txContext || context || "personal");
    setShowTransactionModal(true);
  };

  const handleTransactionSuccess = async () => {
    setShowTransactionModal(false);
    await fetchTransactions();
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-100">
            {context === "chama"
              ? "Chama Transactions"
              : context === "personal"
                ? "My Wallet"
                : context === "membership"
                  ? "Membership"
                  : "Transactions"}
          </h1>
          {pendingApprovals.length > 0 && (
            <div className="relative">
              <BellIcon size={24} className="text-orange-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full text-xs flex items-center justify-center text-white">
                {pendingApprovals.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {showQuickActions && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-100">
              Quick Actions
            </h2>
            <button
              onClick={() => setShowQuickActions(false)}
              className="text-gray-400 hover:text-gray-300 transition-colors lg:hidden"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <QuickActionButton
              icon={
                <ArrowDownIcon
                  size={20}
                  weight="bold"
                  className="text-green-400"
                />
              }
              label="Deposit"
              description="Add funds"
              onClick={() => openTransactionModal("deposit")}
            />
            <QuickActionButton
              icon={
                <ArrowUpIcon size={20} weight="bold" className="text-red-400" />
              }
              label="Withdraw"
              description="Take out funds"
              onClick={() => openTransactionModal("withdrawal")}
            />
            {!context && (
              <QuickActionButton
                icon={
                  <ShareIcon
                    size={20}
                    weight="bold"
                    className="text-purple-400"
                  />
                }
                label="Buy Shares"
                description="Invest in membership"
                onClick={() =>
                  openTransactionModal("subscription", "membership")
                }
              />
            )}
            <QuickActionButton
              icon={
                <PlusIcon size={20} weight="bold" className="text-blue-400" />
              }
              label="Transfer"
              description="Send to another account"
              onClick={() => openTransactionModal("transfer")}
            />
          </div>
        </div>
      )}

      {/* Pending Approvals (Admin Only) */}
      {isAdmin && pendingApprovals.length > 0 && (
        <div className="bg-slate-800 border border-orange-500/30 rounded-xl p-4 lg:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <BellIcon size={16} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-100">
                Pending Approvals ({pendingApprovals.length})
              </h2>
              <p className="text-sm text-gray-400">
                Withdrawal requests awaiting your review
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {pendingApprovals.slice(0, 3).map((transaction) => (
              <div
                key={transaction.id}
                className="bg-slate-700/30 rounded-lg overflow-hidden"
              >
                <ApprovalWorkflow
                  transaction={transaction}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onUpdate={fetchTransactions}
                />
              </div>
            ))}

            {pendingApprovals.length > 3 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  View All {pendingApprovals.length} Requests
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-100">
            {context ? "Recent Activity" : "All Transactions"}
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="lg:hidden"
            >
              <FunnelIcon size={16} />
            </Button>
          </div>
        </div>

        <TransactionList
          transactions={filteredTransactions}
          loading={loading}
          error={error}
          onTransactionAction={handleTransactionAction}
          filter={filter}
          onFilterChange={setFilter}
        />
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        context={selectedContext}
        type={selectedTransactionType}
        targetId={targetId || ""}
        targetName={targetName}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function QuickActionButton({
  icon,
  label,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg hover:bg-slate-700/50 hover:border-slate-500 transition-all duration-200 text-left"
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="w-10 h-10 bg-slate-600/50 rounded-lg flex items-center justify-center group-hover:bg-slate-600 transition-colors">
          {icon}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-100 group-hover:text-white transition-colors">
            {label}
          </div>
          <div className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors mt-1">
            {description}
          </div>
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// Mobile-specific Components
// ============================================================================

export function MobileTransactionSummary({
  transactions,
}: {
  transactions: UnifiedTransaction[];
}) {
  const totalDeposits = transactions
    .filter((tx) => tx.type === "deposit" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount.value, 0);

  const totalWithdrawals = transactions
    .filter((tx) => tx.type === "withdrawal" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount.value, 0);

  const pendingCount = transactions.filter(
    (tx) =>
      tx.status === "pending" ||
      tx.status === "pending_approval" ||
      tx.status === "processing",
  ).length;

  return (
    <div className="lg:hidden bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-400 mb-3">Summary</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-semibold text-green-400">
            +{(totalDeposits / 100).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Deposits</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-red-400">
            -{(totalWithdrawals / 100).toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">Withdrawals</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-orange-400">
            {pendingCount}
          </div>
          <div className="text-xs text-gray-500">Pending</div>
        </div>
      </div>
    </div>
  );
}

export function MobileTransactionCard({
  transaction,
  onActionClick,
}: {
  transaction: UnifiedTransaction;
  onActionClick?: (actionType: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-center justify-between">
          <TransactionStatusIndicator
            transaction={transaction}
            variant="compact"
            showProgress={false}
            showActions={false}
          />
          <div className="text-right">
            <div className="text-sm font-medium text-gray-100">
              {(transaction.amount.value / 100).toLocaleString()} KES
            </div>
            <div className="text-xs text-gray-500">
              {transaction.metadata.chamaName ||
                transaction.metadata.walletName}
            </div>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-600/30 p-4">
          <TransactionStatusIndicator
            transaction={transaction}
            variant="detailed"
            showProgress={true}
            showActions={true}
            onActionClick={onActionClick}
          />
        </div>
      )}
    </div>
  );
}
