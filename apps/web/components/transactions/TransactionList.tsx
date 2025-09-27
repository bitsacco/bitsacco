/**
 * Transaction List Component
 * Simplified transaction list for chama transactions only
 */

"use client";

import React from "react";

import type {
  UnifiedTransaction,
} from "@/lib/transactions/unified/types";

import { TransactionCard } from "./TransactionCard";

// ============================================================================
// Types
// ============================================================================

export interface TransactionListProps {
  transactions: UnifiedTransaction[];
  loading?: boolean;
  error?: Error | null;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TransactionList({
  transactions,
  loading = false,
  error = null,
  className = "",
}: TransactionListProps) {

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-400 mb-2">Failed to load transactions</div>
        <div className="text-sm text-gray-500">{error.message}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Transaction List */}
      {loading && transactions.length === 0 ? (
        <TransactionListSkeleton />
      ) : transactions.length === 0 ? (
        <EmptyState hasActiveFilters={false} />
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              variant="detailed"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function TransactionListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4"
        >
          <div className="animate-pulse">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg" />
              <div className="flex-1">
                <div className="h-4 bg-slate-600 rounded w-1/3 mb-2" />
                <div className="h-3 bg-slate-600 rounded w-2/3 mb-2" />
                <div className="h-2 bg-slate-600 rounded w-full" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ hasActiveFilters }: { hasActiveFilters: boolean }) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-2">
        {hasActiveFilters
          ? "No transactions match your filters"
          : "No transactions found"}
      </div>
      <div className="text-sm text-gray-500">
        {hasActiveFilters
          ? "Try adjusting your search criteria"
          : "Transactions will appear here once you start using Bitsacco"}
      </div>
    </div>
  );
}