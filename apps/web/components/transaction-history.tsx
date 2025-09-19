"use client";

import { useState, useMemo } from "react";
import { Button } from "@bitsacco/ui";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowsLeftRightIcon,
  ShoppingBagIcon,
  SparkleIcon,
  ArrowClockwiseIcon,
  FunnelIcon,
  DownloadIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import {
  SharesTx,
  UserShareTxsResponse,
  SharesTxStatus,
  SharesTxType,
} from "@bitsacco/core";
import { SHARE_VALUE_KES } from "@/lib/config";
import { formatDistance } from "date-fns";

interface TransactionHistoryProps {
  transactions: UserShareTxsResponse | null;
  loading: boolean;
  onRefresh: () => void;
}

interface FilterOptions {
  status: SharesTxStatus | "all";
  type: SharesTxType | "all";
  dateRange: "all" | "7d" | "30d" | "90d" | "1y";
  search: string;
}

export function TransactionHistory({
  transactions,
  loading,
  onRefresh,
}: TransactionHistoryProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    status: "all",
    type: "all",
    dateRange: "all",
    search: "",
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<SharesTx | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  const getStatusBadge = (status: SharesTxStatus) => {
    const statusConfig = {
      [SharesTxStatus.PROPOSED]: {
        bg: "bg-yellow-500/20",
        text: "text-yellow-300",
        icon: <ClockIcon size={14} weight="fill" />,
      },
      [SharesTxStatus.PROCESSING]: {
        bg: "bg-blue-500/20",
        text: "text-blue-300",
        icon: <ClockIcon size={14} weight="fill" />,
      },
      [SharesTxStatus.APPROVED]: {
        bg: "bg-green-500/20",
        text: "text-green-300",
        icon: <CheckCircleIcon size={14} weight="fill" />,
      },
      [SharesTxStatus.COMPLETE]: {
        bg: "bg-green-500/20",
        text: "text-green-300",
        icon: <CheckCircleIcon size={14} weight="fill" />,
      },
      [SharesTxStatus.FAILED]: {
        bg: "bg-red-500/20",
        text: "text-red-300",
        icon: <XCircleIcon size={14} weight="fill" />,
      },
      [SharesTxStatus.UNRECOGNIZED]: {
        bg: "bg-gray-500/20",
        text: "text-gray-400",
        icon: <XCircleIcon size={14} weight="fill" />,
      },
    };

    const config = statusConfig[status] || {
      bg: "bg-gray-500/20",
      text: "text-gray-400",
      icon: <XCircleIcon size={14} weight="fill" />,
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        {Object.keys(SharesTxStatus).find(
          (key) =>
            SharesTxStatus[key as keyof typeof SharesTxStatus] === status,
        ) || status}
      </span>
    );
  };

  const getTypeBadge = (type: SharesTxType) => {
    const typeConfig = {
      subscription: {
        bg: "bg-blue-500/20",
        text: "text-blue-300",
        icon: <ShoppingBagIcon size={14} weight="fill" />,
      },
      transfer: {
        bg: "bg-purple-500/20",
        text: "text-purple-300",
        icon: <ArrowsLeftRightIcon size={14} weight="fill" />,
      },
      offer: {
        bg: "bg-orange-500/20",
        text: "text-orange-300",
        icon: <SparkleIcon size={14} weight="fill" />,
      },
    };

    const config = typeConfig[type] || typeConfig.subscription;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        {type}
      </span>
    );
  };

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    if (!transactions?.shares?.transactions) return [];

    return transactions.shares.transactions.filter((tx: SharesTx) => {
      // Status filter
      if (filters.status !== "all" && tx.status !== filters.status) {
        return false;
      }

      // Type filter (using transfer property to determine type)
      if (filters.type !== "all") {
        const txType = tx.transfer
          ? SharesTxType.TRANSFER
          : SharesTxType.SUBSCRIPTION;
        if (txType !== filters.type) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange !== "all") {
        const txDate = new Date(tx.createdAt);
        const now = new Date();
        const daysDiff = Math.floor(
          (now.getTime() - txDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        switch (filters.dateRange) {
          case "7d":
            if (daysDiff > 7) return false;
            break;
          case "30d":
            if (daysDiff > 30) return false;
            break;
          case "90d":
            if (daysDiff > 90) return false;
            break;
          case "1y":
            if (daysDiff > 365) return false;
            break;
        }
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const txType = tx.transfer ? "transfer" : "subscription";
        const statusName =
          Object.keys(SharesTxStatus)
            .find(
              (key) =>
                SharesTxStatus[key as keyof typeof SharesTxStatus] ===
                tx.status,
            )
            ?.toLowerCase() || "";
        return (
          tx.id.toLowerCase().includes(searchLower) ||
          txType.toLowerCase().includes(searchLower) ||
          statusName.includes(searchLower) ||
          tx.quantity.toString().includes(searchLower)
        );
      }

      return true;
    });
  }, [transactions?.shares?.transactions, filters]);

  const exportTransactions = () => {
    if (!filteredTransactions.length) return;

    const csvContent = [
      ["Date", "Type", "Quantity", "Value", "Status", "Transaction ID"],
      ...filteredTransactions.map((tx: SharesTx) => [
        new Date(tx.createdAt).toLocaleDateString(),
        tx.transfer ? "transfer" : "subscription",
        tx.quantity.toString(),
        (tx.quantity * SHARE_VALUE_KES).toString(),
        Object.keys(SharesTxStatus).find(
          (key) =>
            SharesTxStatus[key as keyof typeof SharesTxStatus] === tx.status,
        ) || "",
        tx.id,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-700 border-t-teal-400 mx-auto"></div>
          <p className="mt-6 text-gray-400 text-lg">
            Loading transaction history...
          </p>
        </div>
      </div>
    );
  }

  if (
    !transactions?.shares?.transactions ||
    transactions.shares.transactions.length === 0
  ) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClockIcon size={40} weight="thin" className="text-gray-500" />
          </div>
          <h4 className="text-xl font-semibold text-gray-100 mb-3">
            No Transaction History
          </h4>
          <p className="text-gray-400 max-w-md mx-auto">
            Your share transactions and trading history will appear here once
            you start investing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-100">
            Transaction History
          </h3>
          <p className="text-sm text-gray-400">
            {filteredTransactions.length} of{" "}
            {transactions.shares.transactions.length} transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all flex items-center gap-2"
          >
            <ArrowClockwiseIcon size={16} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all flex items-center gap-2"
          >
            <FunnelIcon size={16} />
            Filters
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={exportTransactions}
            disabled={filteredTransactions.length === 0}
            className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all flex items-center gap-2"
          >
            <DownloadIcon size={16} />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-slate-900/50 rounded-lg p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status:
                      e.target.value === "all"
                        ? "all"
                        : (parseInt(e.target.value) as SharesTxStatus),
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Statuses</option>
                <option value={SharesTxStatus.PROPOSED}>Proposed</option>
                <option value={SharesTxStatus.PROCESSING}>Processing</option>
                <option value={SharesTxStatus.APPROVED}>Approved</option>
                <option value={SharesTxStatus.COMPLETE}>Complete</option>
                <option value={SharesTxStatus.FAILED}>Failed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    type:
                      e.target.value === "all"
                        ? "all"
                        : (e.target.value as SharesTxType),
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Types</option>
                <option value={SharesTxType.SUBSCRIPTION}>Subscription</option>
                <option value={SharesTxType.TRANSFER}>Transfer</option>
                <option value={SharesTxType.OFFER}>Offer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: e.target.value as
                      | "all"
                      | "7d"
                      | "30d"
                      | "90d"
                      | "1y",
                  }))
                }
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters({
                  status: "all",
                  type: "all",
                  dateRange: "all",
                  search: "",
                })
              }
              className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all"
            >
              Clear Filters
            </Button>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      {filteredTransactions.length > 0 ? (
        <div className="bg-slate-900/50 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredTransactions.map((tx: SharesTx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-300">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDistance(new Date(tx.createdAt), new Date(), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getTypeBadge(
                        tx.transfer
                          ? SharesTxType.TRANSFER
                          : SharesTxType.SUBSCRIPTION,
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {tx.quantity} shares
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-teal-300 font-medium">
                      {formatCurrency(tx.quantity * SHARE_VALUE_KES)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tx.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTransaction(tx)}
                        className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 transition-all flex items-center gap-1"
                      >
                        <EyeIcon size={14} />
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <MagnifyingGlassIcon
              size={40}
              weight="thin"
              className="text-gray-500"
            />
          </div>
          <h4 className="text-xl font-semibold text-gray-100 mb-3">
            No transactions found
          </h4>
          <p className="text-gray-400 max-w-md mx-auto">
            Try adjusting your filters to see more transactions
          </p>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-100">
                Transaction Details
              </h3>
              <button
                onClick={() => setSelectedTransaction(null)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              >
                <XCircleIcon size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Transaction ID
                    </label>
                    <p className="text-sm text-gray-300 font-mono">
                      {selectedTransaction.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Type
                    </label>
                    <div>
                      {getTypeBadge(
                        selectedTransaction.transfer
                          ? SharesTxType.TRANSFER
                          : SharesTxType.SUBSCRIPTION,
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Status
                    </label>
                    <div>{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Quantity
                    </label>
                    <p className="text-sm text-gray-300">
                      {selectedTransaction.quantity} shares
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Value
                    </label>
                    <p className="text-sm text-teal-300 font-medium">
                      {formatCurrency(
                        selectedTransaction.quantity * SHARE_VALUE_KES,
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      Date
                    </label>
                    <p className="text-sm text-gray-300">
                      {new Date(selectedTransaction.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Payment information not available in current SharesTx interface */}

                {selectedTransaction.transfer && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <label className="block text-xs text-gray-400 mb-2">
                      Transfer Information
                    </label>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          From User
                        </label>
                        <p className="text-sm text-gray-300 font-mono">
                          {selectedTransaction.transfer.fromUserId}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          To User
                        </label>
                        <p className="text-sm text-gray-300 font-mono">
                          {selectedTransaction.transfer.toUserId}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="tealPrimary"
                fullWidth
                onClick={() => setSelectedTransaction(null)}
                className="shadow-lg shadow-teal-500/20"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
