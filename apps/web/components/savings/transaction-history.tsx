"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@bitsacco/ui";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import type { WalletResponseDto, WalletTransaction } from "@bitsacco/core";
import {
  PersonalTransactionType,
  PersonalTransactionStatus,
} from "@bitsacco/core";

// No need for local type definitions - using enums from core

interface TransactionHistoryProps {
  wallets: WalletResponseDto[];
  walletId?: string;
}
import { useTransactions } from "@/hooks/savings/use-transactions";
import {
  formatCurrency,
  formatSats,
  formatRelativeDate,
} from "@/lib/utils/format";

interface FilterOptions {
  walletId: string;
  type: string; // Will be "all" or string representation of PersonalTransactionType enum
  status: string; // Will be "all" or string representation of PersonalTransactionStatus enum
  search: string;
}

export function TransactionHistory({
  wallets,
  walletId,
}: TransactionHistoryProps) {
  const { transactions, loading, hasMore, loadMore } = useTransactions({
    walletId,
    autoRefresh: true,
  });

  const [filters, setFilters] = useState<FilterOptions>({
    walletId: walletId || "all",
    type: "all",
    status: "all",
    search: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    if (!transactions || !Array.isArray(transactions)) {
      return [];
    }
    return transactions.filter((tx) => {
      // Safety check for transaction object
      if (!tx || typeof tx !== "object") {
        return false;
      }

      if (filters.walletId !== "all" && tx.walletId !== filters.walletId)
        return false;
      if (filters.type !== "all" && tx.type !== Number(filters.type))
        return false;
      if (filters.status !== "all" && tx.status !== Number(filters.status))
        return false;

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();

        // Get wallet name inline to avoid function reference issues
        let walletName = "";
        if (tx.walletName) {
          walletName = tx.walletName.toLowerCase();
        } else {
          const wallet = wallets?.find((w) => w.walletId === tx.walletId);
          walletName = (wallet?.walletName || "Default Wallet").toLowerCase();
        }

        const paymentRef = tx.paymentReference?.toLowerCase() || "";

        return (
          walletName.includes(searchLower) || paymentRef.includes(searchLower)
        );
      }

      return true;
    });
  }, [transactions, filters, wallets]);

  const getTransactionIcon = (tx: WalletTransaction) => {
    const iconSize = 20;
    const iconWeight = "duotone" as const;

    switch (tx.type) {
      case PersonalTransactionType.DEPOSIT:
      case PersonalTransactionType.WALLET_CREATION:
        return (
          <ArrowUpIcon
            size={iconSize}
            weight={iconWeight}
            className="text-green-500"
          />
        );
      case PersonalTransactionType.WITHDRAW:
        return (
          <ArrowDownIcon
            size={iconSize}
            weight={iconWeight}
            className="text-blue-500"
          />
        );
      case PersonalTransactionType.UNRECOGNIZED:
      default:
        return (
          <MagnifyingGlassIcon
            size={iconSize}
            weight={iconWeight}
            className="text-amber-500"
          />
        );
    }
  };

  const getStatusIcon = (status: PersonalTransactionStatus) => {
    switch (status) {
      case PersonalTransactionStatus.COMPLETE:
        return <CheckCircleIcon size={16} className="text-green-500" />;
      case PersonalTransactionStatus.FAILED:
        return <XCircleIcon size={16} className="text-red-500" />;
      case PersonalTransactionStatus.PENDING:
      case PersonalTransactionStatus.PROCESSING:
        return <ClockIcon size={16} className="text-amber-500" />;
      case PersonalTransactionStatus.MANUAL_REVIEW:
        return <ClockIcon size={16} className="text-yellow-500" />;
      case PersonalTransactionStatus.UNRECOGNIZED:
      default:
        return <ClockIcon size={16} className="text-gray-500" />;
    }
  };

  const getWalletName = useCallback(
    (transaction: WalletTransaction) => {
      // Use walletName from transaction if available (includes backend transformation for legacy transactions)
      if (transaction.walletName) {
        return transaction.walletName;
      }

      // Fallback to wallet lookup for compatibility
      const wallet = wallets?.find((w) => w.walletId === transaction.walletId);
      return wallet?.walletName || "Default Wallet";
    },
    [wallets],
  );

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700 rounded w-1/3" />
                <div className="h-3 bg-slate-700 rounded w-1/4" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-700 rounded w-20" />
                <div className="h-3 bg-slate-700 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-gray-100">
            Transaction History
          </h3>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search - Hidden on mobile */}
            <div className="relative hidden sm:block">
              <MagnifyingGlassIcon
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                placeholder="Search transactions..."
                className="pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm w-48"
              />
            </div>

            {/* Filter Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`text-gray-400 hover:text-gray-300 p-2 ${showFilters ? "bg-slate-700" : ""}`}
            >
              <FunnelIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
            </Button>
          </div>
        </div>

        {/* Mobile Search - Show below header when filters are open */}
        {showFilters && (
          <div className="mt-3 sm:hidden">
            <div className="relative">
              <MagnifyingGlassIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                placeholder="Search transactions..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-sm"
              />
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 space-y-3 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-3 sm:space-y-0">
            {/* Wallet Filter */}
            <select
              value={filters.walletId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, walletId: e.target.value }))
              }
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Wallets</option>
              {wallets.map((wallet) => (
                <option key={wallet.walletId} value={wallet.walletId}>
                  {wallet.walletName || "Unnamed Wallet"}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  type: e.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              <option value={PersonalTransactionType.DEPOSIT}>Deposits</option>
              <option value={PersonalTransactionType.WITHDRAW}>
                Withdrawals
              </option>
              <option value={PersonalTransactionType.WALLET_CREATION}>
                Wallet Creation
              </option>
              <option value={PersonalTransactionType.UNRECOGNIZED}>
                Unrecognized
              </option>
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
              className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value={PersonalTransactionStatus.COMPLETE}>
                Completed
              </option>
              <option value={PersonalTransactionStatus.PENDING}>Pending</option>
              <option value={PersonalTransactionStatus.PROCESSING}>
                Processing
              </option>
              <option value={PersonalTransactionStatus.FAILED}>Failed</option>
              <option value={PersonalTransactionStatus.MANUAL_REVIEW}>
                Manual Review
              </option>
              <option value={PersonalTransactionStatus.UNRECOGNIZED}>
                Unrecognized
              </option>
            </select>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-slate-700">
        {filteredTransactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-700/50 rounded-full flex items-center justify-center">
              <ClockIcon size={32} className="text-gray-500" />
            </div>
            <h4 className="text-lg font-semibold text-gray-100 mb-2">
              {transactions.length === 0
                ? "No transactions yet"
                : "No matching transactions"}
            </h4>
            <p className="text-gray-400 mb-4">
              {transactions.length === 0
                ? "Make your first deposit to get started"
                : "Try adjusting your filters or search terms"}
            </p>
            {filters.search ||
            filters.walletId !== "all" ||
            filters.type !== "all" ||
            filters.status !== "all" ? (
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    walletId: walletId || "all",
                    type: "all",
                    status: "all",
                    search: "",
                  })
                }
                className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700"
              >
                Clear Filters
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="px-4 sm:px-6 py-4 hover:bg-slate-700/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Transaction Icon */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700/50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getTransactionIcon(transaction)}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-100 text-sm sm:text-base leading-tight">
                          {transaction.type === PersonalTransactionType.DEPOSIT
                            ? "Deposit to"
                            : transaction.type ===
                                PersonalTransactionType.WALLET_CREATION
                              ? "Wallet creation for"
                              : transaction.type ===
                                  PersonalTransactionType.WITHDRAW
                                ? "Withdraw from"
                                : "Transaction in"}{" "}
                          <span className="hidden sm:inline">
                            {getWalletName(transaction)}
                          </span>
                          <span className="sm:hidden">
                            {getWalletName(transaction).split(" ")[0]}
                          </span>
                          {transaction.type ===
                            PersonalTransactionType.UNRECOGNIZED && (
                            <span className="text-xs text-amber-500 ml-2">
                              (Unrecognized)
                            </span>
                          )}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs sm:text-sm text-gray-400">
                            {formatRelativeDate(
                              new Date(transaction.createdAt),
                            )}
                          </span>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(transaction.status)}
                          </div>
                        </div>
                        {transaction.status ===
                          PersonalTransactionStatus.FAILED &&
                          transaction.failureReason && (
                            <div className="text-xs text-red-400 mt-1 line-clamp-1">
                              {transaction.failureReason}
                            </div>
                          )}
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <div
                          className={`text-sm sm:text-base font-bold leading-tight ${
                            transaction.type ===
                              PersonalTransactionType.DEPOSIT ||
                            transaction.type ===
                              PersonalTransactionType.WALLET_CREATION
                              ? "text-green-400"
                              : transaction.type ===
                                  PersonalTransactionType.WITHDRAW
                                ? "text-blue-400"
                                : "text-amber-400"
                          }`}
                        >
                          {transaction.type ===
                            PersonalTransactionType.DEPOSIT ||
                          transaction.type ===
                            PersonalTransactionType.WALLET_CREATION
                            ? "+"
                            : transaction.type ===
                                PersonalTransactionType.WITHDRAW
                              ? "-"
                              : ""}
                          {formatSats(
                            Math.floor(transaction.amountMsats / 1000),
                          )}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-400 mt-0.5">
                          {formatCurrency(transaction.amountFiat)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="px-6 py-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  loading={loading}
                  className="w-full !bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700"
                >
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
