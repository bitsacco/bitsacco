"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  PlusIcon,
  WalletIcon,
  TrendUpIcon,
  ArrowsCounterClockwise,
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

export default function PersonalSavingsPage() {
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
    // TODO: Implement wallet details view
    console.log("View details for wallet:", wallet.id);
  };

  const handleModalSuccess = () => {
    refetch(); // Refresh wallets data
  };

  if (loading && wallets.length === 0) {
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
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-700/50 rounded-lg" />
              <div className="h-6 bg-slate-700/50 rounded-lg w-32" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="h-10 bg-slate-700/50 rounded-lg w-48" />
                <div className="h-6 bg-slate-700/30 rounded-full w-32" />
              </div>
              <div className="space-y-3">
                <div className="h-10 bg-slate-700/50 rounded-lg w-40" />
                <div className="h-6 bg-slate-700/30 rounded-full w-36" />
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

          {/* Action Buttons Skeleton */}
          <div className="flex justify-center gap-4 mb-8">
            <div className="w-48 h-14 bg-slate-700/50 rounded-lg" />
            <div className="w-48 h-14 bg-slate-700/30 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">
            Personal Savings
          </h1>
          {/* Refresh Button */}
          <Button
            variant="tealPrimary"
            size="md"
            onClick={refetch}
            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] transition-all duration-300 group"
            disabled={loading}
          >
            <ArrowsCounterClockwise
              size={16}
              weight="bold"
              className={`${loading ? "animate-spin" : ""} group-hover:scale-110 transition-transform duration-300`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>
        <p className="text-sm sm:text-base text-gray-400">
          Save in Bitcoin and build your wealth over time
        </p>

        {/* Total Balance Summary */}
        {wallets.length > 0 && (
          <div className="mt-6 p-6 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-700/60 border border-slate-600/50 rounded-xl shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-teal-500/20 rounded-lg">
                <TrendUpIcon
                  size={24}
                  weight="duotone"
                  className="text-teal-400"
                />
              </div>
              <h2 className="text-lg font-semibold text-gray-100">
                Total Savings
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-gray-100 tracking-tight">
                  {formatSats(totalBalance)}
                </div>
                <div className="text-sm text-gray-400 font-medium bg-slate-700/30 px-3 py-1 rounded-full inline-block">
                  Bitcoin Balance
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl sm:text-4xl font-bold text-gray-100 tracking-tight">
                  {formatCurrency(totalBalanceFiat)}
                </div>
                <div className="text-sm text-gray-400 font-medium bg-slate-700/30 px-3 py-1 rounded-full inline-block">
                  Kenyan Shillings
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="mt-2 !bg-red-500/10 !text-red-400 !border-red-500/20 hover:!bg-red-500/20"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Wallets Gallery */}
      {wallets.length > 0 ? (
        <div className="mb-8">
          <div className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide snap-x snap-mandatory">
            {wallets.map((wallet, index) => (
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
            {/* Create Wallet Card */}
            <div
              className="flex-none w-80 sm:w-96 animate-in fade-in-50 slide-in-from-bottom-4 duration-700 snap-start"
              style={{ animationDelay: `${wallets.length * 100}ms` }}
            >
              <CreateWalletCard onClick={() => setShowCreateModal(true)} />
            </div>
          </div>
        </div>
      ) : (
        !loading && (
          /* Empty State */
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

      {/* Unified Action Buttons */}
      {wallets.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Button
            variant="tealPrimary"
            size="lg"
            onClick={() => handleDeposit()}
            className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
          >
            <PlusIcon
              size={24}
              weight="bold"
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            Deposit Funds
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => handleWithdraw()}
            className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-semibold !bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!border-slate-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-300 group"
          >
            <ArrowDownIcon
              size={24}
              weight="bold"
              className="group-hover:translate-y-0.5 transition-transform duration-300"
            />
            Withdraw Funds
          </Button>
        </div>
      )}

      {/* Transaction History */}
      <TransactionHistory wallets={wallets} />

      {/* Modals */}
      <CreateWalletModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Modals */}
      <DepositModal
        wallet={selectedWallet}
        wallets={wallets}
        isOpen={showDepositModal}
        onClose={() => {
          setShowDepositModal(false);
          setSelectedWallet(undefined);
        }}
        onSuccess={handleModalSuccess}
      />

      <WithdrawModal
        wallet={selectedWallet}
        wallets={wallets}
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
