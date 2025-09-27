/**
 * Unified Transaction History Component
 * Displays transaction history across all contexts with filtering and actions
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Alert,
  AlertDescription,
} from "@bitsacco/ui";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowClockwise as ArrowPathIcon,
  Info as InformationCircleIcon,
} from "@phosphor-icons/react";

import type {
  TransactionContext,
  TransactionType,
  TransactionStatus,
} from "@/lib/transactions/unified/types";

import { TransactionCard } from "./TransactionCard";
import { ApprovalWorkflow } from "./ApprovalWorkflow";
import { useTransactions } from "@/lib/transactions/unified/TransactionProvider";
import { useTransactionMonitor } from "@/lib/transactions/unified/TransactionStatusMonitor";

// ============================================================================
// Types
// ============================================================================

export interface TransactionHistoryProps {
  context?: TransactionContext;
  showFilters?: boolean;
  showActions?: boolean;
  maxItems?: number;
  currentUserId: string;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

export function TransactionHistory({
  context,
  showFilters = true,
  showActions = true,
  maxItems,
  currentUserId,
  className,
}: TransactionHistoryProps) {
  const { transactions, loading, error } = useTransactions();
  const { monitor, getHighPriorityTransactions } = useTransactionMonitor();

  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    TransactionStatus | "all"
  >("all");
  const [selectedType, setSelectedType] = useState<TransactionType | "all">(
    "all",
  );
  const [selectedContext, setSelectedContext] = useState<
    TransactionContext | "all"
  >(context || "all");

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Apply context filter
    if (context) {
      filtered = filtered.filter((tx) => tx.context === context);
    } else if (selectedContext !== "all") {
      filtered = filtered.filter((tx) => tx.context === selectedContext);
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((tx) => tx.status === selectedStatus);
    }

    // Apply type filter
    if (selectedType !== "all") {
      filtered = filtered.filter((tx) => tx.type === selectedType);
    }

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.id.toLowerCase().includes(search) ||
          tx.metadata.reference?.toLowerCase().includes(search) ||
          tx.metadata.description?.toLowerCase().includes(search) ||
          tx.metadata.chamaName?.toLowerCase().includes(search) ||
          tx.metadata.walletName?.toLowerCase().includes(search) ||
          tx.userName?.toLowerCase().includes(search),
      );
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply max items limit
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    return filtered;
  }, [
    transactions,
    context,
    selectedContext,
    selectedStatus,
    selectedType,
    searchTerm,
    maxItems,
  ]);

  // Get priority transactions
  const priorityTransactions = useMemo(() => {
    return getHighPriorityTransactions().filter((tx) => {
      if (context) return tx.context === context;
      return true;
    });
  }, [getHighPriorityTransactions, context]);

  // Handle action execution
  const handleTransactionAction = async (action: {
    handler: () => Promise<void>;
  }) => {
    try {
      await action.handler();
      // Optionally monitor the transaction for status changes
      const transaction = filteredTransactions.find((tx) =>
        tx.actions.some((a) => a === action),
      );
      if (transaction) {
        monitor(transaction);
      }
    } catch {
      // Handle action error silently
    }
  };

  // Get unique values for filters
  const availableStatuses = useMemo(() => {
    const statusSet = new Set(transactions.map((tx) => tx.status));
    const statuses = Array.from(statusSet);
    return statuses.sort();
  }, [transactions]);

  const availableTypes = useMemo(() => {
    const typesSet = new Set(transactions.map((tx) => tx.type));
    const types = Array.from(typesSet);
    return types.sort();
  }, [transactions]);

  const availableContexts = useMemo(() => {
    const contextsSet = new Set(transactions.map((tx) => tx.context));
    const contexts = Array.from(contextsSet);
    return contexts.sort();
  }, [transactions]);

  if (error) {
    return (
      <Alert>
        <InformationCircleIcon className="h-4 w-4" />
        <AlertDescription>
          Failed to load transactions. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Priority Transactions */}
      {priorityTransactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="destructive" className="px-2 py-1">
                {priorityTransactions.length}
              </Badge>
              Action Required
            </CardTitle>
            <CardDescription>
              Transactions that need your immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {priorityTransactions.map((tx) => (
                <div key={tx.id}>
                  {tx.context === "chama" &&
                  tx.type === "withdrawal" &&
                  tx.status === "pending_approval" ? (
                    <ApprovalWorkflow
                      transaction={tx}
                      currentUserId={currentUserId}
                      isAdmin={true}
                      onUpdate={() => {
                        // Refresh transactions after approval action
                        // This will be called when an approval action is completed
                      }}
                    />
                  ) : (
                    <TransactionCard
                      transaction={tx}
                      onAction={handleTransactionAction}
                      variant="compact"
                    />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transaction
                {filteredTransactions.length !== 1 ? "s" : ""}
                {context && ` in ${context}`}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              disabled={loading}
            >
              <ArrowPathIcon size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>

        {/* Filters */}
        {showFilters && (
          <CardContent className="border-b">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {!context && (
                  <Select
                    value={selectedContext}
                    onChange={(e) =>
                      setSelectedContext(
                        e.target.value as TransactionContext | "all",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All contexts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All contexts</SelectItem>
                      {availableContexts.map((ctx) => (
                        <SelectItem key={ctx} value={ctx}>
                          {ctx.charAt(0).toUpperCase() + ctx.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <Select
                  value={selectedStatus}
                  onChange={(e) =>
                    setSelectedStatus(
                      e.target.value as TransactionStatus | "all",
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {availableStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedType}
                  onChange={(e) =>
                    setSelectedType(e.target.value as TransactionType | "all")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedStatus("all");
                    setSelectedType("all");
                    if (!context) setSelectedContext("all");
                  }}
                >
                  <FunnelIcon size={16} className="mr-2" />
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        )}

        {/* Transaction List */}
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2" />
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600">No transactions found</p>
              {(searchTerm ||
                selectedStatus !== "all" ||
                selectedType !== "all" ||
                selectedContext !== "all") && (
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your filters
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
                  {transaction.context === "chama" &&
                  transaction.type === "withdrawal" &&
                  transaction.status === "pending_approval" &&
                  showActions ? (
                    <ApprovalWorkflow
                      transaction={transaction}
                      currentUserId={currentUserId}
                      isAdmin={true}
                      onUpdate={() => {
                        // Refresh transactions after approval action
                      }}
                    />
                  ) : (
                    <TransactionCard
                      transaction={transaction}
                      onAction={
                        showActions ? handleTransactionAction : undefined
                      }
                      variant="compact"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary (if not limited) */}
      {!maxItems && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {
                    transactions.filter((tx) => tx.status === "completed")
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {
                    transactions.filter(
                      (tx) =>
                        tx.status === "pending" ||
                        tx.status === "pending_approval",
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {
                    transactions.filter((tx) => tx.status === "processing")
                      .length
                  }
                </p>
                <p className="text-sm text-gray-600">Processing</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {
                    transactions.filter(
                      (tx) =>
                        tx.status === "failed" || tx.status === "rejected",
                    ).length
                  }
                </p>
                <p className="text-sm text-gray-600">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
