"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  PlusIcon,
  WalletIcon,
  TrendUpIcon,
  ArrowDownIcon,
} from "@phosphor-icons/react";
import { WalletCard } from "@/components/savings/wallet-card";
import { CreateWalletCard } from "@/components/savings/create-wallet-card";
import { CreateWalletModal } from "@/components/savings/create-wallet-modal";
import { DepositModal } from "@/components/savings/deposit-flow/deposit-modal";
import { WithdrawModal } from "@/components/savings/withdraw-flow/withdraw-modal";
import { TransactionHistory } from "@/components/savings/transaction-history";
import { useWallets } from "@/hooks/savings/use-wallets";
import type { PersonalWallet } from "@/lib/types/savings";
import { formatCurrency, formatSats } from "@/lib/utils/format";
import { useFeatureFlag } from "@/lib/feature-flags-provider";
import { FEATURE_FLAGS } from "@/lib/features";
import { FeatureTease } from "@/components/feature-tease";

export default function PersonalSavingsPage() {
  const isPersonalSavingsEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_PERSONAL_SAVINGS,
  );
  const isMultipleWalletsEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_MULTIPLE_WALLETS,
  );
  const isWalletDetailsEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_WALLET_DETAILS,
  );
  const { wallets, totalBalance, totalBalanceFiat, loading, error, refetch } =
    useWallets();

  const [selectedWallet, setSelectedWallet] = useState<
    PersonalWallet | undefined
  >(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const handleDeposit = (wallet?: PersonalWallet) => {
    setSelectedWallet(wallet);
    setShowDepositModal(true);
  };

  const handleWithdraw = (wallet?: PersonalWallet) => {
    // Default to first default wallet if no wallet specified
    const defaultWallet =
      wallet || wallets.find((w) => w.walletType === "DEFAULT") || wallets[0];
    setSelectedWallet(defaultWallet || null);
    setShowWithdrawModal(true);
  };

  const handleViewDetails = (wallet: PersonalWallet) => {
    if (!isWalletDetailsEnabled) {
      console.log("Wallet details feature is disabled");
      return;
    }
    // TODO: Implement wallet details view
    console.log("View details for wallet:", wallet.id);
  };

  const handleModalSuccess = () => {
    refetch(); // Refresh wallets data
  };

  // Filter wallets based on multiple wallets feature flag
  const displayedWallets = isMultipleWalletsEnabled
    ? wallets
    : wallets.slice(0, 1);

  // Show feature tease when personal savings is disabled
  if (!isPersonalSavingsEnabled) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <FeatureTease
          icon={
            <WalletIcon size={48} weight="duotone" className="text-teal-400" />
          }
          title="Personal Savings"
          description="Build your wealth over time with Bitcoin savings. Create different types of wallets for your goals and start saving today."
          actionText="Coming Soon"
        />
      </div>
    );
  }

  if (loading && displayedWallets.length === 0) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="h-8 bg-slate-700/50 rounded-lg w-64 mb-3" />
                <div className="h-4 bg-slate-700/30 rounded-lg w-96" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-700/50 rounded-lg" />
                <div className="w-32 h-12 bg-slate-700/50 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Total Summary Skeleton */}
          <div className="mb-8 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="w-full lg:flex-1">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                  <div className="w-14 h-14 bg-slate-700/50 rounded-xl" />
                  <div className="text-center sm:text-left">
                    <div className="h-8 bg-slate-700/50 rounded-lg w-48 mb-2" />
                    <div className="h-4 bg-slate-700/30 rounded-lg w-36" />
                  </div>
                </div>

                {/* Balance Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="text-center sm:text-left space-y-2">
                    <div className="h-4 bg-slate-700/30 rounded-lg w-32 mx-auto sm:mx-0" />
                    <div className="h-10 bg-slate-700/50 rounded-lg w-48 mx-auto sm:mx-0" />
                  </div>
                  <div className="text-center sm:text-left space-y-2">
                    <div className="h-4 bg-slate-700/30 rounded-lg w-36 mx-auto sm:mx-0" />
                    <div className="h-10 bg-slate-700/50 rounded-lg w-40 mx-auto sm:mx-0" />
                  </div>
                </div>

                {/* Mobile/Tablet Buttons Skeleton */}
                <div className="flex flex-col sm:flex-row gap-3 lg:hidden">
                  <div className="h-14 bg-slate-700/50 rounded-lg" />
                  <div className="h-14 bg-slate-700/30 rounded-lg" />
                </div>
              </div>

              {/* Desktop Buttons Skeleton */}
              <div className="hidden lg:flex lg:flex-col gap-3 flex-shrink-0">
                <div className="w-48 h-14 bg-slate-700/50 rounded-lg" />
                <div className="w-48 h-14 bg-slate-700/30 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Cards Skeleton */}
          <div className="mb-8">
            <div className="flex overflow-x-auto gap-6 pb-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-none w-80 sm:w-96 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-slate-700/50 rounded-xl" />
                    <div className="space-y-3 flex-1">
                      <div className="h-5 bg-slate-700/50 rounded-lg w-32" />
                      <div className="h-4 bg-slate-700/30 rounded-full w-24" />
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="h-8 bg-slate-700/50 rounded-lg w-40" />
                    <div className="h-5 bg-slate-700/30 rounded-lg w-28" />
                  </div>
                  <div className="h-16 bg-slate-700/30 rounded-xl" />
                </div>
              ))}
              {/* Create Wallet Card Skeleton */}
              <div
                className="flex-none w-80 sm:w-96 bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
                style={{ animationDelay: `${4 * 100}ms` }}
              >
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="w-16 h-16 bg-slate-700/50 rounded-xl" />
                  <div className="space-y-3 text-center">
                    <div className="h-5 bg-slate-700/50 rounded-lg w-40 mx-auto" />
                    <div className="h-4 bg-slate-700/30 rounded-lg w-32 mx-auto" />
                  </div>
                  <div className="w-12 h-1 bg-slate-700/30 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
            Personal Savings
          </h1>
        </div>
        <p className="text-sm sm:text-base text-gray-400">
          Save in Bitcoin and build your wealth over time
        </p>

        {/* Total Balance Summary */}
        {displayedWallets.length > 0 && (
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
                      Total Savings
                    </h2>
                    <p className="text-gray-400">
                      Your Bitcoin savings portfolio
                    </p>
                  </div>
                </div>

                {/* Stats Grid - centered on mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-400 mb-1">
                      Bitcoin Balance
                    </p>
                    <p className="text-3xl font-bold text-gray-100">
                      {formatSats(totalBalance)}
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-gray-400 mb-1">
                      Portfolio Value
                    </p>
                    <p className="text-3xl font-bold text-gray-100">
                      {formatCurrency(totalBalanceFiat)}
                    </p>
                  </div>
                </div>

                {/* Mobile and Tablet buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:hidden">
                  <Button
                    variant="tealPrimary"
                    size="lg"
                    onClick={() => handleDeposit()}
                    fullWidth
                    className="shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                  >
                    <PlusIcon size={20} weight="bold" />
                    Deposit Funds
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleWithdraw()}
                    fullWidth
                    className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!border-slate-500 flex items-center justify-center gap-2"
                  >
                    <ArrowDownIcon size={20} weight="bold" />
                    Withdraw Funds
                  </Button>
                </div>
              </div>

              {/* Desktop buttons */}
              <div className="hidden lg:flex lg:flex-col gap-3 flex-shrink-0">
                <Button
                  variant="tealPrimary"
                  size="lg"
                  onClick={() => handleDeposit()}
                  className="shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
                >
                  <PlusIcon size={20} weight="bold" />
                  Deposit Funds
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleWithdraw()}
                  className="!bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!border-slate-500 flex items-center justify-center gap-2"
                >
                  <ArrowDownIcon size={20} weight="bold" />
                  Withdraw Funds
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Wallets Gallery - only show when multiple wallets is enabled */}
      {isMultipleWalletsEnabled && displayedWallets.length > 0 ? (
        <div className="mb-8">
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory">
            {displayedWallets.map((wallet, index) => (
              <div
                key={wallet.id}
                className="flex-none w-80 sm:w-96 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 snap-start"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <WalletCard
                  wallet={wallet}
                  onViewDetails={() => handleViewDetails(wallet)}
                />
              </div>
            ))}
            {/* Create Wallet Card - only show if multiple wallets enabled or no wallets exist */}
            {(isMultipleWalletsEnabled || displayedWallets.length === 0) && (
              <div
                className="flex-none w-80 sm:w-96 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 snap-start"
                style={{ animationDelay: `${displayedWallets.length * 100}ms` }}
              >
                <CreateWalletCard onClick={() => setShowCreateModal(true)} />
              </div>
            )}
          </div>
        </div>
      ) : (
        !loading &&
        isMultipleWalletsEnabled &&
        displayedWallets.length === 0 && (
          /* Empty State - only show when multiple wallets is enabled and no wallets exist */
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-12 text-center mb-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-teal-500/30">
              <WalletIcon
                size={36}
                weight="duotone"
                className="text-teal-400"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-100 mb-3">
              Start Your Savings Journey
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              Create your first savings wallet to begin building wealth with
              Bitcoin. Choose from standard savings, goal-based targets, or
              locked savings with bonuses.
            </p>
            <Button
              variant="tealPrimary"
              onClick={() => setShowCreateModal(true)}
              className="shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] transition-all duration-300 group"
            >
              <PlusIcon
                size={20}
                weight="bold"
                className="mr-2 group-hover:rotate-90 transition-transform duration-300"
              />
              Create Your First Wallet
            </Button>
          </div>
        )
      )}

      {/* Transaction History */}
      <TransactionHistory wallets={displayedWallets} />

      {/* Modals */}
      <CreateWalletModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Modals */}
      <DepositModal
        wallet={selectedWallet}
        wallets={displayedWallets}
        isOpen={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
          setSelectedWallet(undefined);
        }}
        onSuccess={handleModalSuccess}
      />

      <WithdrawModal
        wallet={selectedWallet}
        wallets={displayedWallets}
        isOpen={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          setSelectedWallet(undefined);
        }}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}
