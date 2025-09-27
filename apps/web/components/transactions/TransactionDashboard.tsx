/**
 * Transaction Dashboard
 * Chama-focused transaction management interface with mobile-first design.
 * Designed for easy future expansion to personal and membership contexts.
 *
 * FUTURE EXPANSION PLAN:
 * 1. Add context prop to TransactionDashboardProps: context?: "chama" | "personal" | "membership"
 * 2. Restore context-specific filtering logic in transaction filtering
 * 3. Add context-specific UI elements (headers, quick actions, etc.)
 * 4. Implement context adapters for different transaction types
 * 5. Add context-specific configuration objects for labels, limits, etc.
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  BellIcon,
} from "@phosphor-icons/react";

import type {
  UnifiedTransaction,
} from "@/lib/transactions/unified/types";

import { TransactionList } from "./TransactionList";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { TransactionStatusIndicator } from "./TransactionStatusIndicator";
import { useTransactions } from "@/lib/transactions/unified/TransactionProvider";
import { Button } from "@bitsacco/ui";

// ============================================================================
// Types & Configuration
// ============================================================================

/**
 * Configuration for chama transaction dashboard.
 * TODO: Future expansion - create similar configs for personal/membership contexts
 */
interface ChamaTransactionConfig {
  title: string;
  showApprovalWorkflow: boolean;
  filterContext: "chama";
}

/**
 * Default configuration for chama transactions.
 * This makes it easy to customize behavior and add new contexts.
 */
const CHAMA_CONFIG: ChamaTransactionConfig = {
  title: "Chama Transactions",
  showApprovalWorkflow: true,
  filterContext: "chama",
};

/**
 * Props for the TransactionDashboard component.
 * Currently focused on chama transactions, but designed for future extensibility.
 */
export interface TransactionDashboardProps {
  /** ID of the chama */
  chamaId: string;
  /** Name of the chama for display purposes */
  chamaName?: string;
  /** Current user ID for permission checks */
  currentUserId: string;
  /** Whether the current user is an admin (can approve transactions) */
  isAdmin?: boolean;
  /** Additional CSS classes */
  className?: string;
  // TODO: Future expansion - add context prop when supporting multiple contexts
  // context?: "chama" | "personal" | "membership";
  // config?: ChamaTransactionConfig | PersonalTransactionConfig | MembershipTransactionConfig;
}

// ============================================================================
// Component
// ============================================================================

export function TransactionDashboard({
  chamaId,
  chamaName,
  currentUserId,
  isAdmin = false,
  className = "",
}: TransactionDashboardProps) {
  const { transactions, loading, error, fetchTransactions } =
    useTransactions();

  // Use chama configuration (TODO: make this dynamic based on context prop)
  const config = CHAMA_CONFIG;

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const TRANSACTIONS_PER_PAGE = 30;

  // Filter transactions for this specific chama
  const chamaTransactions = transactions.filter(
    (tx) => tx.context === config.filterContext && tx.metadata.chamaId === chamaId,
  );

  // Paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
    const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
    return chamaTransactions.slice(startIndex, endIndex);
  }, [chamaTransactions, currentPage]);

  // Calculate total pages
  const totalPages = Math.ceil(chamaTransactions.length / TRANSACTIONS_PER_PAGE);

  // Get pending approvals for admins (only show if config allows it)
  const pendingApprovals = config.showApprovalWorkflow
    ? chamaTransactions.filter(
        (tx) => tx.status === "pending_approval" && isAdmin,
      )
    : [];



  return (
    <div className={`space-y-6 ${className}`}>
      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-100">
            {chamaName ? `${chamaName} Transactions` : "Chama Transactions"}
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


      {/* Pending Approvals (Admin Only) */}
      {config.showApprovalWorkflow && isAdmin && pendingApprovals.length > 0 && (
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
            Recent Activity
          </h2>
        </div>

        <TransactionList
          transactions={paginatedTransactions}
          loading={loading}
          error={error}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/50">
            <div className="text-sm text-gray-400">
              Showing {(currentPage - 1) * TRANSACTIONS_PER_PAGE + 1} to{" "}
              {Math.min(currentPage * TRANSACTIONS_PER_PAGE, chamaTransactions.length)} of{" "}
              {chamaTransactions.length} transactions
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-gray-300 transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-md text-gray-300 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}


// ============================================================================
// Mobile-specific Components
// ============================================================================

/**
 * Mobile transaction summary component for chama transactions.
 * TODO: Future expansion - add context parameter to customize labels/calculations
 */
export function MobileChamaTransactionSummary({
  transactions,
  chamaName,
}: {
  transactions: UnifiedTransaction[];
  chamaName?: string;
}) {
  // Filter for completed chama transactions
  const chamaTransactions = transactions.filter(tx => tx.context === "chama");

  const totalDeposits = chamaTransactions
    .filter((tx) => tx.type === "deposit" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount.value, 0);

  const totalWithdrawals = chamaTransactions
    .filter((tx) => tx.type === "withdrawal" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount.value, 0);

  const pendingCount = chamaTransactions.filter(
    (tx) =>
      tx.status === "pending" ||
      tx.status === "pending_approval" ||
      tx.status === "processing",
  ).length;

  return (
    <div className="lg:hidden bg-slate-800 border border-slate-700 rounded-xl p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-400 mb-3">
        {chamaName ? `${chamaName} Summary` : "Chama Summary"}
      </h3>
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

// Backwards compatibility alias - TODO: Remove in future version
export const MobileTransactionSummary = MobileChamaTransactionSummary;

/**
 * Mobile transaction card component optimized for chama transactions.
 * TODO: Future expansion - add context-specific display logic
 */
export function MobileChamaTransactionCard({
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
              {transaction.metadata.chamaName || "Chama Transaction"}
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

// Backwards compatibility aliases - TODO: Remove in future version
export const MobileTransactionCard = MobileChamaTransactionCard;

// ============================================================================
// Additional Exports & Future Extension Points
// ============================================================================

/**
 * Export configuration for external customization if needed.
 * This allows other components to reuse the same configuration approach.
 */
export { CHAMA_CONFIG };
export type { ChamaTransactionConfig };

/**
 * Future extension point: Configuration factory function
 * TODO: Implement when adding multiple contexts
 *
 * export function createTransactionConfig(
 *   context: "chama" | "personal" | "membership",
 *   overrides?: Partial<ChamaTransactionConfig>
 * ): ChamaTransactionConfig {
 *   const baseConfig = context === "chama" ? CHAMA_CONFIG : getOtherConfigs();
 *   return { ...baseConfig, ...overrides };
 * }
 */
