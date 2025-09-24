"use client";

import {
  TrendUpIcon,
  LockIcon,
  CalendarIcon,
  TargetIcon,
} from "@phosphor-icons/react";
import type { WalletResponseDto } from "@bitsacco/core";

interface WalletCardProps {
  wallet: WalletResponseDto;
  exchangeRate?: number;
  onViewDetails: () => void;
}
import {
  formatCurrency,
  formatSats,
  formatTimeRemaining,
  formatPercentage,
} from "@/lib/utils/format";
import { canWithdrawFromLockedWallet } from "@/lib/utils/calculations";
import { btcToFiat, WalletType } from "@bitsacco/core";

export function WalletCard({ wallet, exchangeRate }: WalletCardProps) {
  // Calculate KES value using live exchange rate
  const walletBalanceFiat = exchangeRate
    ? btcToFiat({
        amountSats: Math.floor(wallet.balance / 1000),
        fiatToBtcRate: exchangeRate,
      }).amountFiat
    : 0;
  const getWalletIcon = () => {
    switch (wallet.walletType) {
      case WalletType.TARGET:
        return (
          <TargetIcon size={24} weight="duotone" className="text-blue-400" />
        );
      case WalletType.LOCKED:
        return (
          <LockIcon size={24} weight="duotone" className="text-amber-400" />
        );
      default:
        return (
          <TrendUpIcon size={24} weight="duotone" className="text-teal-400" />
        );
    }
  };

  const getProgressSection = () => {
    if (wallet.walletType === WalletType.STANDARD) {
      return (
        <div
          className={`mt-6 p-4 rounded-xl border backdrop-blur-sm bg-green-500/10 border-green-500/30 shadow-sm`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className={`text-sm font-medium text-green-300`}>
              Balance always available for withdrawal
            </span>
          </div>
        </div>
      );
    }

    if (wallet.walletType === WalletType.TARGET && wallet.progress) {
      const progressPercentage = Math.min(
        wallet.progress.progressPercentage,
        100,
      );

      return (
        <div className="mt-6 p-4 bg-slate-700/20 rounded-xl border border-slate-600/30 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-300">
              Target Progress
            </span>
            <span className="text-sm font-semibold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
              {formatPercentage(progressPercentage)}
            </span>
          </div>
          <div className="w-full bg-slate-600/50 rounded-full h-2.5 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-teal-500 to-blue-500 h-2.5 rounded-full transition-all duration-700 ease-out shadow-sm"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-3">
            <span className="text-xs text-gray-400 font-medium">
              {formatCurrency(walletBalanceFiat)} /{" "}
              {formatCurrency(
                wallet.progress.targetAmountFiat ||
                  (wallet.progress.targetAmountMsats
                    ? wallet.progress.targetAmountMsats / 1000
                    : 0),
              )}
            </span>
            {wallet.progress.projectedCompletionDate && (
              <span className="text-xs text-gray-400 flex items-center gap-1 bg-slate-700/30 px-2 py-1 rounded-md">
                <CalendarIcon size={12} />
                {new Date(
                  wallet.progress.projectedCompletionDate,
                ).toLocaleDateString("en-KE")}
              </span>
            )}
          </div>
        </div>
      );
    }

    if (wallet.walletType === WalletType.LOCKED && wallet.lockInfo) {
      const canWithdraw = canWithdrawFromLockedWallet(
        new Date(wallet.lockInfo.lockEndDate),
      );
      const timeRemaining = formatTimeRemaining(
        new Date(wallet.lockInfo.lockEndDate),
      );

      return (
        <div
          className={`mt-6 p-4 rounded-xl border backdrop-blur-sm ${
            canWithdraw
              ? "bg-green-500/10 border-green-500/30 shadow-sm"
              : "bg-amber-500/10 border-amber-500/30"
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <span
              className={`text-sm font-medium ${canWithdraw ? "text-green-300" : "text-amber-300"}`}
            >
              {canWithdraw ? "Available for withdrawal" : "Locked until"}
            </span>
            <span
              className={`text-sm font-semibold px-2 py-1 rounded-md ${
                canWithdraw
                  ? "text-green-400 bg-green-500/15"
                  : "text-amber-400 bg-amber-500/15"
              }`}
            >
              {canWithdraw ? "Matured" : timeRemaining}
            </span>
          </div>
          {!canWithdraw && wallet.lockInfo.penaltyRate > 0 && (
            <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-md inline-block">
              Early withdrawal penalty:{" "}
              {formatPercentage(wallet.lockInfo.penaltyRate)}
            </div>
          )}
        </div>
      );
    }

    // Return spacer div to maintain consistent card height
    return <div className="flex-grow"></div>;
  };

  // const isWithdrawDisabled =
  //   wallet.walletType === WalletType.LOCKED &&
  //   wallet.lockInfo &&
  //   !canWithdrawFromLockedWallet(new Date(wallet.lockInfo.lockEndDate));

  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6 hover:bg-slate-800/60 transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/20 group h-full flex flex-col min-h-[320px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-700/50 rounded-xl group-hover:bg-slate-700 transition-colors shadow-sm">
            {getWalletIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-100 text-lg mb-1">
              {wallet.walletName || "Unnamed Wallet"}
            </h3>
            <span className="text-xs text-gray-400 capitalize bg-slate-700/40 px-3 py-1 rounded-full border border-slate-600/30">
              {wallet.walletType.toLowerCase().replace("_", " ")} wallet
            </span>
          </div>
        </div>
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={onViewDetails}
          className="text-gray-400 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-slate-700/30 rounded-lg"
        >
          <DotsThreeIcon size={20} weight="bold" />
        </Button> */}
      </div>

      {/* Balance */}
      <div className="mb-6">
        <div className="text-2xl font-bold text-gray-100 mb-2 tracking-tight">
          {formatSats(Math.floor(wallet.balance / 1000))}
        </div>
        <div className="text-base text-gray-400 font-medium">
          ≈ {formatCurrency(walletBalanceFiat)}
        </div>
      </div>

      {/* Progress section for TARGET and LOCKED wallets */}
      <div className="flex-grow flex flex-col justify-end">
        {getProgressSection()}
      </div>

      {/* Inactive state overlay */}
      {false && ( // isActive property removed - wallets are always active
        <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 font-medium mb-1">
              Wallet Disabled
            </div>
            <div className="text-sm text-gray-500">
              Contact support for assistance
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
