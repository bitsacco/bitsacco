"use client";

import {
  TrendUpIcon,
  LockIcon,
  CalendarIcon,
  TargetIcon,
} from "@phosphor-icons/react";
import type { WalletCardProps } from "@/lib/types/savings";
import {
  formatCurrency,
  formatSats,
  formatTimeRemaining,
  formatPercentage,
} from "@/lib/utils/format";
import { canWithdrawFromLockedWallet } from "@/lib/utils/calculations";

export function WalletCard({ wallet }: WalletCardProps) {
  const getWalletIcon = () => {
    switch (wallet.walletType) {
      case "TARGET":
        return (
          <TargetIcon size={24} weight="duotone" className="text-blue-400" />
        );
      case "LOCKED":
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
    if (wallet.walletType === "DEFAULT") {
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

    if (wallet.walletType === "TARGET" && wallet.target) {
      const progressPercentage = Math.min(wallet.target.progress, 100);

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
              {formatCurrency(wallet.balanceFiat)} /{" "}
              {formatCurrency(wallet.target.targetAmount)}
            </span>
            {wallet.target.targetDate && (
              <span className="text-xs text-gray-400 flex items-center gap-1 bg-slate-700/30 px-2 py-1 rounded-md">
                <CalendarIcon size={12} />
                {new Date(wallet.target.targetDate).toLocaleDateString("en-KE")}
              </span>
            )}
          </div>
          {wallet.target.autoDeposit?.isActive && (
            <div className="mt-3 pt-3 border-t border-slate-600/30">
              <div className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md inline-block">
                Auto-save:{" "}
                {formatCurrency(wallet.target.autoDeposit.amount * 100)}{" "}
                {wallet.target.autoDeposit.frequency}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (wallet.walletType === "LOCKED" && wallet.locked) {
      const canWithdraw = canWithdrawFromLockedWallet(
        new Date(wallet.locked.lockEndDate),
      );
      const timeRemaining = formatTimeRemaining(
        new Date(wallet.locked.lockEndDate),
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
          {!canWithdraw && wallet.locked.penaltyRate > 0 && (
            <div className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-md inline-block">
              Early withdrawal penalty:{" "}
              {formatPercentage(wallet.locked.penaltyRate)}
            </div>
          )}
        </div>
      );
    }

    // Return spacer div to maintain consistent card height
    return <div className="flex-grow"></div>;
  };

  // const isWithdrawDisabled =
  //   wallet.walletType === "LOCKED" &&
  //   wallet.locked &&
  //   !canWithdrawFromLockedWallet(new Date(wallet.locked.lockEndDate));

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
              {wallet.name}
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
          {formatSats(wallet.balance)}
        </div>
        <div className="text-base text-gray-400 font-medium">
          ≈ {formatCurrency(wallet.balanceFiat)}
        </div>
      </div>

      {/* Progress section for TARGET and LOCKED wallets */}
      <div className="flex-grow flex flex-col justify-end">
        {getProgressSection()}
      </div>

      {/* Inactive state overlay */}
      {!wallet.isActive && (
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
