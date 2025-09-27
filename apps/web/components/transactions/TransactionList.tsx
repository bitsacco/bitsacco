/**
 * Transaction List Component
 * Responsive transaction list with mobile-first design and advanced filtering
 */

"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@bitsacco/ui";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ListIcon,
  GridFourIcon,
  SortAscendingIcon,
  SortDescendingIcon,
  X as XMarkIcon,
} from "@phosphor-icons/react";

import type {
  UnifiedTransaction,
  TransactionContext,
  TransactionType,
  TransactionStatus,
  TransactionFilter,
} from "@/lib/transactions/unified/types";

import { TransactionCard } from "./TransactionCard";
import { TransactionStatusIndicator } from "./TransactionStatusIndicator";
import { formatCurrency } from "@/lib/utils/format";

// ============================================================================
// Types
// ============================================================================

export interface TransactionListProps {
  transactions: UnifiedTransaction[];
  loading?: boolean;
  error?: Error | null;
  onTransactionAction?: (
    transaction: UnifiedTransaction,
    actionType: string,
  ) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  filter?: TransactionFilter;
  onFilterChange?: (filter: TransactionFilter) => void;
  className?: string;
}

type ViewMode = "list" | "grid" | "compact";
type SortField = "date" | "amount" | "status";
type SortOrder = "asc" | "desc";

// ============================================================================
// Component
// ============================================================================

export function TransactionList({
  transactions,
  loading = false,
  error = null,
  onTransactionAction,
  onLoadMore,
  hasMore = false,
  filter = {},
  onFilterChange,
  className = "",
}: TransactionListProps) {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [localFilter, setLocalFilter] = useState<TransactionFilter>(filter);

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.metadata.reference?.toLowerCase().includes(query) ||
          tx.metadata.description?.toLowerCase().includes(query) ||
          tx.metadata.chamaName?.toLowerCase().includes(query) ||
          tx.metadata.walletName?.toLowerCase().includes(query) ||
          tx.userName?.toLowerCase().includes(query),
      );
    }

    // Apply local filters
    if (localFilter.contexts?.length) {
      filtered = filtered.filter((tx) =>
        localFilter.contexts!.includes(tx.context),
      );
    }

    if (localFilter.types?.length) {
      filtered = filtered.filter((tx) => localFilter.types!.includes(tx.type));
    }

    if (localFilter.statuses?.length) {
      filtered = filtered.filter((tx) =>
        localFilter.statuses!.includes(tx.status),
      );
    }

    if (localFilter.amountRange) {
      filtered = filtered.filter(
        (tx) =>
          tx.amount.value >= localFilter.amountRange!.min &&
          tx.amount.value <= localFilter.amountRange!.max,
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "date":
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case "amount":
          comparison = a.amount.value - b.amount.value;
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, searchQuery, localFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleFilterChange = (newFilter: Partial<TransactionFilter>) => {
    const updatedFilter = { ...localFilter, ...newFilter };
    setLocalFilter(updatedFilter);
    onFilterChange?.(updatedFilter);
  };

  const clearFilters = () => {
    setLocalFilter({});
    setSearchQuery("");
    onFilterChange?.({});
  };

  const hasActiveFilters = !!(
    searchQuery.trim() ||
    localFilter.contexts?.length ||
    localFilter.types?.length ||
    localFilter.statuses?.length ||
    localFilter.amountRange
  );

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
      {/* Header Controls */}
      <div className="space-y-4">
        {/* Mobile Search */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/50 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-3">
          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex-shrink-0 ${hasActiveFilters ? "ring-1 ring-teal-500" : ""}`}
          >
            <FunnelIcon size={16} className="mr-2" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="ml-2 w-2 h-2 bg-teal-500 rounded-full" />
            )}
          </Button>

          {/* View Mode - Desktop Only */}
          <div className="hidden md:flex items-center gap-1 bg-slate-700/30 rounded-lg p-1">
            <button
              onClick={() => setViewMode("compact")}
              className={`p-2 rounded transition-colors ${
                viewMode === "compact"
                  ? "bg-teal-600 text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <ListIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list"
                  ? "bg-teal-600 text-white"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              <GridFourIcon size={16} />
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value as SortField)}
              className="text-sm bg-slate-700/30 border border-slate-600/50 rounded-lg px-3 py-2 text-gray-100 focus:outline-none focus:border-teal-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {sortOrder === "asc" ? (
                <SortAscendingIcon size={16} />
              ) : (
                <SortDescendingIcon size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Quick Filters */}
        <QuickFilters
          filter={localFilter}
          onFilterChange={handleFilterChange}
        />

        {/* Expanded Filters */}
        {showFilters && (
          <ExpandedFilters
            filter={localFilter}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          {filteredAndSortedTransactions.length} transaction
          {filteredAndSortedTransactions.length !== 1 ? "s" : ""}
          {hasActiveFilters && ` (filtered)`}
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-teal-400 hover:text-teal-300 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Transaction List */}
      {loading && transactions.length === 0 ? (
        <TransactionListSkeleton />
      ) : filteredAndSortedTransactions.length === 0 ? (
        <EmptyState hasActiveFilters={hasActiveFilters} />
      ) : (
        <div className={getListClassName(viewMode)}>
          {filteredAndSortedTransactions.map((transaction) => (
            <div key={transaction.id}>
              {viewMode === "compact" ? (
                <CompactTransactionItem
                  transaction={transaction}
                  onActionClick={(actionType) =>
                    onTransactionAction?.(transaction, actionType)
                  }
                />
              ) : (
                <TransactionCard
                  transaction={transaction}
                  variant={viewMode === "grid" ? "default" : "detailed"}
                  onAction={async (action) => {
                    await onTransactionAction?.(transaction, action.type);
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-6">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Loading..." : "Load More Transactions"}
          </Button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Sub-components
// ============================================================================

function QuickFilters({
  filter,
  onFilterChange,
}: {
  filter: TransactionFilter;
  onFilterChange: (filter: Partial<TransactionFilter>) => void;
}) {
  const quickFilters = [
    { label: "All", value: null },
    { label: "Chama", value: ["chama"] as TransactionContext[] },
    { label: "Personal", value: ["personal"] as TransactionContext[] },
    { label: "Shares", value: ["membership"] as TransactionContext[] },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mb-2">
      {quickFilters.map((quickFilter) => (
        <button
          key={quickFilter.label}
          onClick={() =>
            onFilterChange({ contexts: quickFilter.value || undefined })
          }
          className={`flex-shrink-0 px-4 py-2 text-sm rounded-full transition-colors ${
            JSON.stringify(filter.contexts) ===
            JSON.stringify(quickFilter.value)
              ? "bg-teal-600 text-white"
              : "bg-slate-700/30 text-gray-300 hover:bg-slate-700/50"
          }`}
        >
          {quickFilter.label}
        </button>
      ))}
    </div>
  );
}

function ExpandedFilters({
  filter,
  onFilterChange,
  onClose,
}: {
  filter: TransactionFilter;
  onFilterChange: (filter: Partial<TransactionFilter>) => void;
  onClose: () => void;
}) {
  return (
    <div className="bg-slate-700/30 border border-slate-600/50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-300">Filters</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-300 transition-colors"
        >
          <XMarkIcon size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Transaction Types */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Type</label>
          <div className="space-y-2">
            {(
              [
                "deposit",
                "withdrawal",
                "subscription",
                "transfer",
              ] as TransactionType[]
            ).map((type) => (
              <label key={type} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filter.types?.includes(type) || false}
                  onChange={(e) => {
                    const types = filter.types || [];
                    const newTypes = e.target.checked
                      ? [...types, type]
                      : types.filter((t) => t !== type);
                    onFilterChange({
                      types: newTypes.length ? newTypes : undefined,
                    });
                  }}
                  className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-500 rounded focus:ring-teal-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300 capitalize">
                  {type}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">Status</label>
          <div className="space-y-2">
            {(
              [
                "pending",
                "pending_approval",
                "approved",
                "processing",
                "completed",
                "failed",
                "rejected",
              ] as TransactionStatus[]
            ).map((status) => (
              <label key={status} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filter.statuses?.includes(status) || false}
                  onChange={(e) => {
                    const statuses = filter.statuses || [];
                    const newStatuses = e.target.checked
                      ? [...statuses, status]
                      : statuses.filter((s) => s !== status);
                    onFilterChange({
                      statuses: newStatuses.length ? newStatuses : undefined,
                    });
                  }}
                  className="w-4 h-4 text-teal-600 bg-slate-700 border-slate-500 rounded focus:ring-teal-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300 capitalize">
                  {status.replace("_", " ")}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Amount Range */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-gray-400 mb-2">
            Amount Range (KES)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filter.amountRange?.min || ""}
              onChange={(e) => {
                const min = e.target.value
                  ? parseFloat(e.target.value)
                  : undefined;
                onFilterChange({
                  amountRange:
                    min !== undefined
                      ? {
                          min,
                          max: filter.amountRange?.max || 1000000,
                        }
                      : undefined,
                });
              }}
              className="w-full px-3 py-2 bg-slate-700/30 border border-slate-600/50 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500"
            />
            <input
              type="number"
              placeholder="Max"
              value={filter.amountRange?.max || ""}
              onChange={(e) => {
                const max = e.target.value
                  ? parseFloat(e.target.value)
                  : undefined;
                onFilterChange({
                  amountRange:
                    max !== undefined
                      ? {
                          min: filter.amountRange?.min || 0,
                          max,
                        }
                      : undefined,
                });
              }}
              className="w-full px-3 py-2 bg-slate-700/30 border border-slate-600/50 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactTransactionItem({
  transaction,
  onActionClick,
}: {
  transaction: UnifiedTransaction;
  onActionClick: (actionType: string) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg hover:bg-slate-700/50 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <TransactionStatusIndicator
          transaction={transaction}
          variant="compact"
          showProgress={false}
          showActions={false}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-gray-100 truncate">
              {formatCurrency(transaction.amount.value * 100)}
            </div>
            <div className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {transaction.metadata.chamaName ||
                transaction.metadata.walletName ||
                transaction.context}
            </div>
          </div>
        </div>
      </div>

      {transaction.actions.length > 0 && (
        <button
          onClick={() => onActionClick(transaction.actions[0].type)}
          className="ml-3 text-xs text-teal-400 hover:text-teal-300 transition-colors flex-shrink-0"
        >
          {transaction.actions[0].label}
        </button>
      )}
    </div>
  );
}

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

// ============================================================================
// Helper Functions
// ============================================================================

function getListClassName(viewMode: ViewMode): string {
  switch (viewMode) {
    case "grid":
      return "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4";
    case "compact":
      return "space-y-2";
    default:
      return "space-y-4";
  }
}
