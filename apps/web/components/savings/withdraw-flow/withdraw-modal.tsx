"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  XIcon,
  ArrowDownIcon,
  DeviceMobileIcon,
  LightningIcon,
  WarningIcon,
  CurrencyCircleDollarIcon,
  CaretDownIcon,
} from "@phosphor-icons/react";
import type {
  WithdrawModalProps,
  PaymentMethod,
  PersonalWallet,
} from "@/lib/types/savings";
// import { useTransactions } from "@/hooks/savings/use-transactions";
import { usePayment } from "@/hooks/savings/use-payment";
import { MpesaWithdrawForm } from "./mpesa-withdraw-form";
import { LightningWithdrawForm } from "./lightning-withdraw-form";
import { formatCurrency, formatSats } from "@/lib/utils/format";
import {
  canWithdrawFromLockedWallet,
  calculateEarlyWithdrawPenalty,
} from "@/lib/utils/calculations";
import { useFeatureFlag } from "@/lib/feature-flags-provider";
import { FEATURE_FLAGS } from "@/lib/features";

export function WithdrawModal({
  wallet,
  wallets = [],
  isOpen,
  onClose,
  onSuccess,
}: WithdrawModalProps) {
  // const { initiateWithdraw } = useTransactions();
  const { paymentStatus, isPolling, resetStatus } = usePayment();
  const isEarlyWithdrawalEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_EARLY_WITHDRAWAL,
  );
  const isPenaltyWarningsEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_PENALTY_WARNINGS,
  );
  const isSmartWithdrawalSelectionEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_SMART_WITHDRAWAL_SELECTION,
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<PersonalWallet | null>(
    wallet || null,
  );
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);

  const paymentMethods = [
    {
      value: "mpesa" as PaymentMethod,
      label: "M-Pesa",
      description: "Receive money in your mobile wallet",
      icon: (
        <DeviceMobileIcon
          size={24}
          weight="duotone"
          className="text-green-500"
        />
      ),
      minAmount: 10,
      maxAmount: 70000,
      processingTime: "5-10 minutes",
      fees: "Standard M-Pesa rates apply",
    },
    {
      value: "lightning" as PaymentMethod,
      label: "Lightning Network",
      description: "Instant Bitcoin withdrawal",
      icon: (
        <LightningIcon size={24} weight="duotone" className="text-orange-400" />
      ),
      minAmount: 10,
      maxAmount: 100000,
      processingTime: "Instant",
      fees: "Minimal network fees",
    },
  ];

  // Get available wallets (with balance and can withdraw)
  const availableWallets = wallets.filter((w) => {
    if (w.balance === 0) return false;
    if (w.walletType === "LOCKED" && w.locked) {
      const canWithdraw = canWithdrawFromLockedWallet(
        new Date(w.locked.lockEndDate),
      );
      // If early withdrawal is disabled, only show matured locked wallets
      return canWithdraw || isEarlyWithdrawalEnabled;
    }
    return true;
  });

  // Get default wallet (smart selection if enabled, otherwise first default type or first available)
  const defaultWallet = isSmartWithdrawalSelectionEnabled
    ? availableWallets.find((w) => w.walletType === "DEFAULT") ||
      availableWallets.find((w) => w.walletType === "TARGET") ||
      availableWallets[0]
    : availableWallets.find((w) => w.walletType === "DEFAULT") ||
      availableWallets[0];

  // Set initial selected wallet
  if (!selectedWallet && defaultWallet) {
    setSelectedWallet(defaultWallet);
  }

  // Check if withdrawal is allowed for selected wallet
  const canWithdraw = selectedWallet
    ? selectedWallet.walletType !== "LOCKED" ||
      (selectedWallet.locked &&
        canWithdrawFromLockedWallet(
          new Date(selectedWallet.locked.lockEndDate),
        ))
    : false;

  // Calculate early withdrawal penalty for locked wallets
  const earlyWithdrawPenalty =
    selectedWallet &&
    selectedWallet.walletType === "LOCKED" &&
    selectedWallet.locked &&
    !canWithdraw
      ? calculateEarlyWithdrawPenalty(
          selectedWallet.balanceFiat,
          selectedWallet.locked.penaltyRate,
          new Date(selectedWallet.locked.lockStartDate),
          new Date(selectedWallet.locked.lockEndDate),
        )
      : 0;

  const handleClose = () => {
    setSelectedMethod(null);
    setError(null);
    setSelectedWallet(wallet || null);
    setShowWalletDropdown(false);
    resetStatus();
    onClose();
  };

  const handleSuccess = () => {
    resetStatus();
    onSuccess();
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <ArrowDownIcon
                size={20}
                weight="bold"
                className="text-blue-400"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">
                Withdraw Funds
              </h2>
              <p className="text-sm text-gray-400">
                {selectedWallet
                  ? `Withdraw from ${selectedWallet.name}`
                  : "Select a wallet to withdraw from"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <XIcon size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Wallet Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Wallet
            </label>
            <div className="relative">
              <button
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                className="w-full p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                disabled={availableWallets.length === 0}
              >
                {selectedWallet ? (
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-100">
                          {selectedWallet.name}
                        </div>
                        <div className="text-sm text-gray-400 capitalize">
                          {selectedWallet.walletType.toLowerCase()} wallet
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-100">
                        {formatSats(selectedWallet.balance)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatCurrency(selectedWallet.balanceFiat)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    {availableWallets.length === 0
                      ? "No wallets available for withdrawal"
                      : "Select a wallet"}
                  </div>
                )}
                {availableWallets.length > 1 && (
                  <CaretDownIcon
                    size={16}
                    className={`text-gray-400 transition-transform ml-2 ${showWalletDropdown ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {showWalletDropdown && availableWallets.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                  {availableWallets.map((wallet) => (
                    <button
                      key={wallet.id}
                      onClick={() => {
                        setSelectedWallet(wallet);
                        setShowWalletDropdown(false);
                      }}
                      className="w-full p-3 text-left hover:bg-slate-700/50 transition-colors last:border-b-0 border-b border-slate-600/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-100">
                              {wallet.name}
                            </div>
                            <div className="text-sm text-gray-400 capitalize">
                              {wallet.walletType.toLowerCase()} wallet
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-100">
                            {formatSats(wallet.balance)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatCurrency(wallet.balanceFiat)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Locked Wallet Warning - only show if penalty warnings enabled */}
          {isPenaltyWarningsEnabled &&
            selectedWallet &&
            selectedWallet.walletType === "LOCKED" &&
            selectedWallet.locked &&
            !canWithdraw && (
              <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <WarningIcon
                    size={20}
                    className="text-amber-400 mt-0.5 flex-shrink-0"
                  />
                  <div className="text-sm text-amber-300">
                    <div className="font-medium mb-1">
                      Early Withdrawal Warning
                    </div>
                    <p className="text-amber-400 mb-2">
                      This wallet is locked until{" "}
                      {new Date(
                        selectedWallet.locked.lockEndDate,
                      ).toLocaleDateString("en-KE")}
                      . Early withdrawal will incur a penalty.
                    </p>
                    <div className="text-amber-300">
                      <strong>
                        Penalty: {formatCurrency(earlyWithdrawPenalty)}(
                        {selectedWallet.locked.penaltyRate}%)
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* No Wallet/Balance Warning */}
          {(!selectedWallet || selectedWallet.balance === 0) && (
            <div className="mb-6 p-4 bg-gray-500/10 border border-gray-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                <WarningIcon size={20} className="text-gray-400" />
                <div className="text-sm text-gray-400">
                  {!selectedWallet
                    ? "Please select a wallet to continue."
                    : "No funds available for withdrawal. Make a deposit first."}
                </div>
              </div>
            </div>
          )}

          {selectedWallet && selectedWallet.balance > 0 && (
            <>
              {!selectedMethod ? (
                /* Payment Method Selection */
                <div>
                  <h3 className="text-lg font-medium text-gray-100 mb-4">
                    Choose Withdrawal Method
                  </h3>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setSelectedMethod(method.value)}
                        className="w-full p-4 border border-slate-600 rounded-lg text-left transition-all hover:border-slate-500 hover:bg-slate-700/30 group"
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-slate-700/50 rounded-lg group-hover:bg-slate-700 transition-colors">
                            {method.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-100 mb-1">
                              {method.label}
                            </h4>
                            <p className="text-sm text-gray-400 mb-2">
                              {method.description}
                            </p>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>
                                <CurrencyCircleDollarIcon
                                  size={12}
                                  className="inline mr-1"
                                />
                                {formatCurrency(method.minAmount * 100)} -{" "}
                                {formatCurrency(method.maxAmount * 100)}
                              </span>
                              <span>{method.processingTime}</span>
                            </div>
                          </div>
                          <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                            →
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Payment Form */
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedMethod(null)}
                      className="text-gray-400 hover:text-gray-300"
                    >
                      ← Back
                    </Button>
                    <div className="flex items-center gap-2">
                      {
                        paymentMethods.find((m) => m.value === selectedMethod)
                          ?.icon
                      }
                      <span className="text-lg font-medium text-gray-100">
                        {
                          paymentMethods.find((m) => m.value === selectedMethod)
                            ?.label
                        }
                      </span>
                    </div>
                  </div>

                  {selectedMethod === "mpesa" && selectedWallet && (
                    <MpesaWithdrawForm
                      wallet={selectedWallet}
                      onSuccess={handleSuccess}
                      onError={setError}
                      earlyWithdrawPenalty={earlyWithdrawPenalty}
                    />
                  )}

                  {selectedMethod === "lightning" && selectedWallet && (
                    <LightningWithdrawForm
                      wallet={selectedWallet}
                      onSuccess={handleSuccess}
                      onError={setError}
                      earlyWithdrawPenalty={earlyWithdrawPenalty}
                    />
                  )}
                </div>
              )}
            </>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Payment Status */}
          {paymentStatus && (
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-3">
                {isPolling && (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                )}
                <div>
                  <div className="text-sm font-medium text-blue-300">
                    {paymentStatus.status === "completed"
                      ? "Success!"
                      : "Processing Withdrawal"}
                  </div>
                  <div className="text-xs text-blue-400 mt-1">
                    {paymentStatus.message}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
