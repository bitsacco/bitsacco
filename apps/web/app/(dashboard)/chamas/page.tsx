"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import { useChamas } from "@/hooks/chama";
import { useHideBalances } from "@/hooks/use-hide-balances";
import { HeaderControls } from "@/components/ui/header-controls";
import { ChamaCard } from "@/components/chama/ChamaCard";
import { ChamaActions } from "@/components/chama/ChamaActions";
import { CreateChamaModal } from "@/components/chama/CreateChamaModal";
import { DepositModal } from "@/components/chama/DepositModal";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { TransactionProvider } from "@/lib/transactions/unified/TransactionProvider";
import {
  LoadingSkeleton,
  CardSkeleton,
} from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { BalanceDisplay } from "@/components/ui/balance-display";
import { formatCurrency } from "@/lib/utils/format";
import { type Chama, useExchangeRate, satsToKes } from "@bitsacco/core";
import { apiClient } from "@/lib/auth";
import {
  PlusIcon,
  UsersThreeIcon,
  TrendUpIcon,
  ArrowsLeftRightIcon,
} from "@phosphor-icons/react";

export default function ChamasPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showGroupTotals, setShowGroupTotals] = useState(false);
  const [depositChama, setDepositChama] = useState<Chama | null>(null);
  const { chamas, loading, getChamaBalances } = useChamas();
  const { hideBalances } = useHideBalances();

  // Unified Transaction Modal state
  const [showUnifiedModal, setShowUnifiedModal] = useState(false);
  const [selectedChamaForTransaction, setSelectedChamaForTransaction] =
    useState<Chama | null>(null);
  const [unifiedTransactionType, setUnifiedTransactionType] = useState<
    "deposit" | "withdrawal"
  >("deposit");

  // Exchange rate for KES conversion
  const {
    quote,
    loading: rateLoading,
    showBtcRate,
    setShowBtcRate,
    refresh,
    kesToSats,
  } = useExchangeRate({ apiClient });

  // Calculate total statistics
  const calculateStats = () => {
    if (!chamas || chamas.length === 0) {
      return {
        totalChamas: 0,
        totalGroupBalance: 0,
        totalMemberBalance: 0,
        totalMembers: 0,
      };
    }

    let totalGroupBalance = 0;
    let totalMemberBalance = 0;
    let totalMembers = 0;

    chamas.forEach((chama) => {
      const balance = getChamaBalances(chama.id);
      if (balance) {
        totalGroupBalance += balance.groupBalanceMsats;
        totalMemberBalance += balance.memberBalanceMsats;
      }
      totalMembers += chama.members.length;
    });

    // Convert millisats to sats for display
    const convertMsatsToSats = (msats: number) => Math.floor(msats / 1000);

    return {
      totalChamas: chamas.length,
      totalGroupBalance: convertMsatsToSats(totalGroupBalance),
      totalMemberBalance: convertMsatsToSats(totalMemberBalance),
      totalMembers,
    };
  };

  const stats = calculateStats();

  // Filter chamas based on search query
  const filteredChamas = chamas.filter(
    (chama) =>
      chama.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chama.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading && chamas.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header skeleton */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <LoadingSkeleton className="h-8 w-48 mb-2" />
              <LoadingSkeleton className="h-4 w-80" />
            </div>
            <div className="flex-shrink-0 w-full sm:w-auto">
              <LoadingSkeleton className="h-10 w-48 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Chama Portfolio Summary skeleton */}
        <div className="mt-6 bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-700/50 rounded-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="w-full lg:flex-1">
              {/* Header with icon skeleton */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                <LoadingSkeleton className="w-14 h-14 rounded-xl" />
                <div className="text-center sm:text-left space-y-2">
                  <LoadingSkeleton className="h-8 w-56" />
                  <LoadingSkeleton className="h-4 w-72" />
                </div>
              </div>

              {/* Stats Grid skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="text-center sm:text-left space-y-2">
                  <LoadingSkeleton className="h-4 w-32" />
                  <LoadingSkeleton className="h-9 w-28" />
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <LoadingSkeleton className="h-4 w-40" />
                  <LoadingSkeleton className="h-9 w-32" />
                </div>
              </div>

              {/* Mobile and Tablet buttons skeleton */}
              <div className="flex flex-col sm:flex-row gap-3 lg:hidden">
                <LoadingSkeleton className="h-12 w-full rounded-lg" />
                <LoadingSkeleton className="h-12 w-full rounded-lg" />
              </div>
            </div>

            {/* Desktop buttons skeleton */}
            <div className="hidden lg:flex lg:flex-col gap-3 flex-shrink-0">
              <LoadingSkeleton className="w-48 h-12 rounded-lg" />
              <LoadingSkeleton className="w-48 h-12 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Actions Component skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="order-2 sm:order-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <LoadingSkeleton className="w-64 h-10 rounded-lg" />
              <div className="flex items-center gap-3">
                <LoadingSkeleton className="w-32 h-10 rounded-lg" />
                <LoadingSkeleton className="w-24 h-10 rounded-lg" />
              </div>
            </div>
          </div>
          <div className="order-1 sm:order-2 flex-shrink-0">
            <LoadingSkeleton className="h-10 w-48 rounded-full" />
          </div>
        </div>

        {/* Chama cards grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Title and Subtitle Group */}
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
              Chama Savings
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              Join or create investment groups to save together and build wealth
              collectively
            </p>
          </div>

          <HeaderControls
            quote={quote}
            rateLoading={rateLoading}
            showBtcRate={showBtcRate}
            onToggleRate={() => setShowBtcRate(!showBtcRate)}
            onRefresh={refresh}
            kesToSats={kesToSats}
          />
        </div>
      </div>

      {/* Chama Portfolio Summary */}
      {chamas.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-700/50 rounded-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="w-full lg:flex-1">
              {/* Header with icon - centered on mobile */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendUpIcon
                    size={28}
                    weight="fill"
                    className="text-teal-400"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">
                    Total Chama Savings
                  </h2>
                  <p className="text-gray-400">
                    Collective Bitcoin savings across all your chamas
                  </p>
                </div>
              </div>

              {/* Stats Grid - centered on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="text-center sm:text-left">
                  <BalanceDisplay
                    balanceMsats={
                      (showGroupTotals
                        ? stats.totalGroupBalance
                        : stats.totalMemberBalance) * 1000
                    }
                    label={
                      showGroupTotals
                        ? "Total Group Balance"
                        : "Your Contributions"
                    }
                    hideBalances={hideBalances}
                    textColor="text-gray-100"
                    size="lg"
                    config={{ centered: false }}
                  />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-sm text-gray-400 mb-1">
                    Equivalent KES Value
                  </p>
                  <p className="text-3xl font-bold text-gray-100">
                    {hideBalances
                      ? "•••••"
                      : quote
                        ? formatCurrency(
                            satsToKes(
                              showGroupTotals
                                ? stats.totalGroupBalance
                                : stats.totalMemberBalance,
                              Number(quote.rate),
                            ),
                          )
                        : "--"}
                  </p>
                </div>
              </div>

              {/* Mobile and Tablet buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:hidden">
                <Button
                  variant="tealPrimary"
                  size="lg"
                  onClick={() => setShowCreateModal(true)}
                  fullWidth
                  className="shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  <PlusIcon size={20} weight="bold" />
                  CREATE CHAMA
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowGroupTotals(!showGroupTotals)}
                  fullWidth
                  className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!border-slate-500 flex items-center justify-center gap-2"
                >
                  <ArrowsLeftRightIcon size={20} weight="bold" />
                  View Group Totals
                </Button>
              </div>
            </div>

            {/* Desktop buttons */}
            <div className="hidden lg:flex lg:flex-col gap-3 flex-shrink-0">
              <Button
                variant="tealPrimary"
                size="lg"
                onClick={() => setShowCreateModal(true)}
                className="shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
              >
                <PlusIcon size={20} weight="bold" />
                CREATE CHAMA
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowGroupTotals(!showGroupTotals)}
                className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!border-slate-500 flex items-center justify-center gap-2"
              >
                <ArrowsLeftRightIcon size={20} weight="bold" />
                View Group Totals
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Actions Component with Active Chama Count - positioned after stats card */}
      {chamas.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="order-2 sm:order-1">
            <ChamaActions
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder="Search chamas..."
            />
          </div>

          {/* Dynamic Chama Count - responsive informational element */}
          <div className="order-1 sm:order-2 flex-shrink-0">
            <div className="bg-gradient-to-r from-orange-500/20 to-orange-400/20 border border-orange-500/40 rounded-full px-4 py-2 backdrop-blur-sm">
              <p className="text-sm font-semibold text-orange-300 text-center sm:text-left">
                {searchQuery ? (
                  <>
                    {filteredChamas.length} of {stats.totalChamas}{" "}
                    {stats.totalChamas === 1 ? "chama" : "chamas"}{" "}
                    <span className="text-orange-400/80">visible</span>
                  </>
                ) : (
                  <>
                    {stats.totalChamas}{" "}
                    {stats.totalChamas === 1 ? "active chama" : "active chamas"}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        {chamas.length > 0 ? (
          <>
            {/* Show search results info */}
            {searchQuery && (
              <div className="mb-4 text-sm text-gray-400">
                {filteredChamas.length === 0 ? (
                  <>No chamas found matching &quot;{searchQuery}&quot;</>
                ) : filteredChamas.length === 1 ? (
                  <>Found 1 chama matching &quot;{searchQuery}&quot;</>
                ) : (
                  <>
                    Found {filteredChamas.length} chamas matching &quot;
                    {searchQuery}
                    &quot;
                  </>
                )}
              </div>
            )}

            {filteredChamas.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                {filteredChamas.map((chama, index) => (
                  <div
                    key={chama.id}
                    className="animate-in fade-in-50 slide-in-from-bottom-2 duration-500"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <ChamaCard
                      chama={chama}
                      balance={getChamaBalances(chama.id) || undefined}
                      hideBalances={hideBalances}
                      exchangeRate={quote || undefined}
                      onDeposit={() => {
                        setSelectedChamaForTransaction(chama);
                        setUnifiedTransactionType("deposit");
                        setShowUnifiedModal(true);
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : searchQuery ? (
              <EmptyState
                icon={
                  <UsersThreeIcon
                    size={36}
                    weight="duotone"
                    className="text-gray-400"
                  />
                }
                title="No Chamas Found"
                description={`No chamas match your search for "${searchQuery}". Try adjusting your search terms.`}
                action={{
                  label: "Clear Search",
                  onClick: () => setSearchQuery(""),
                  variant: "outline",
                }}
              />
            ) : null}
          </>
        ) : (
          <div className="py-8 sm:py-12 lg:py-16">
            <EmptyState
              icon={
                <UsersThreeIcon
                  size={32}
                  className="sm:w-9 sm:h-9 lg:w-10 lg:h-10"
                  weight="duotone"
                  color="currentColor"
                />
              }
              title="Start Your Investment Journey"
              description="Create or join a chama to save collectively with friends, family, or colleagues. Build wealth together through group investments."
              action={{
                label: "Create Your First Chama",
                onClick: () => setShowCreateModal(true),
                variant: "tealPrimary",
              }}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateChamaModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />

      {/* Legacy Deposit Modal - kept for backward compatibility */}
      {depositChama && (
        <DepositModal
          isOpen={!!depositChama}
          onClose={() => setDepositChama(null)}
          chama={depositChama}
        />
      )}

      {/* Unified Transaction Modal */}
      {selectedChamaForTransaction && (
        <TransactionProvider
          apiClient={apiClient}
          initialFilter={{ contexts: ["chama"] }}
        >
          <TransactionModal
            isOpen={showUnifiedModal}
            onClose={() => {
              setShowUnifiedModal(false);
              setSelectedChamaForTransaction(null);
            }}
            context="chama"
            type={unifiedTransactionType}
            targetId={selectedChamaForTransaction.id}
            targetName={selectedChamaForTransaction.name}
            onSuccess={() => {
              setShowUnifiedModal(false);
              setSelectedChamaForTransaction(null);
              // Optionally refresh chama data here
            }}
          />
        </TransactionProvider>
      )}
    </div>
  );
}
