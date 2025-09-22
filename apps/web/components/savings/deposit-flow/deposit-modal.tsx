"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  XIcon,
  ArrowUpIcon,
  DeviceMobileIcon,
  LightningIcon,
  CurrencyCircleDollarIcon,
  CaretDownIcon,
  SplitHorizontalIcon,
} from "@phosphor-icons/react";
import { formatCurrency, formatSats } from "@/lib/utils/format";
import type { DepositModalProps, PaymentMethod } from "@/lib/types/savings";
// import { useTransactions } from "@/hooks/savings/use-transactions";
import { usePayment } from "@/hooks/savings/use-payment";
import { useFeatureFlag } from "@/lib/feature-flags-provider";
import { FEATURE_FLAGS } from "@/lib/features";
import { MpesaDepositForm } from "./mpesa-deposit-form";
import { LightningDepositForm } from "./lightning-deposit-form";

export function DepositModal({
  wallet,
  wallets = [],
  isOpen,
  onClose,
  onSuccess,
}: DepositModalProps) {
  // const { initiateDeposit } = useTransactions();
  const { paymentStatus, isPolling, resetStatus } = usePayment();
  const isAutomaticSplitEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_AUTOMATIC_SPLIT_DEPOSITS,
  );
  const isSpecificWalletDepositsEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_SPECIFIC_WALLET_DEPOSITS,
  );
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [depositTarget, setDepositTarget] = useState<"automatic" | string>(
    isAutomaticSplitEnabled
      ? "automatic"
      : wallets.length > 0
        ? wallets[0].id
        : "automatic",
  );
  const [showTargetDropdown, setShowTargetDropdown] = useState(false);

  const paymentMethods = [
    {
      value: "mpesa" as PaymentMethod,
      label: "M-Pesa",
      description: "Pay using your mobile money wallet",
      icon: (
        <DeviceMobileIcon
          size={24}
          weight="duotone"
          className="text-green-500"
        />
      ),
      minAmount: 10,
      maxAmount: 70000,
      processingTime: "1-2 minutes",
      fees: "Standard M-Pesa rates apply",
    },
    {
      value: "lightning" as PaymentMethod,
      label: "Lightning Network",
      description: "Instant Bitcoin payments",
      icon: (
        <LightningIcon size={24} weight="duotone" className="text-orange-400" />
      ),
      minAmount: 10,
      maxAmount: 100000,
      processingTime: "Instant",
      fees: "Minimal network fees",
    },
  ];

  const handleClose = () => {
    setSelectedMethod(null);
    setError(null);
    setDepositTarget("automatic");
    setShowTargetDropdown(false);
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
            <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <ArrowUpIcon size={20} weight="bold" className="text-teal-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-100">
                Deposit Funds
              </h2>
              <p className="text-sm text-gray-400">
                {depositTarget === "automatic"
                  ? `Split across ${wallets.length} wallets`
                  : `Add money to ${wallets.find((w) => w.id === depositTarget)?.name || "selected wallet"}`}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <XIcon size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Deposit Target Selection - only show if deposit features enabled */}
          {(isAutomaticSplitEnabled || isSpecificWalletDepositsEnabled) && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Deposit Target
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowTargetDropdown(!showTargetDropdown)}
                  className="w-full p-4 bg-slate-700/30 border border-slate-600/50 rounded-lg text-left flex items-center justify-between hover:bg-slate-700/50 transition-colors"
                  disabled={
                    !isAutomaticSplitEnabled && !isSpecificWalletDepositsEnabled
                  }
                >
                  <div className="flex items-center gap-3">
                    {depositTarget === "automatic" &&
                    isAutomaticSplitEnabled ? (
                      <SplitHorizontalIcon
                        size={20}
                        className="text-teal-400"
                      />
                    ) : (
                      <div className="w-5 h-5 bg-teal-500/20 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-teal-400 rounded-full" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-100">
                        {depositTarget === "automatic" &&
                        isAutomaticSplitEnabled
                          ? "Automatic Split"
                          : wallets.find((w) => w.id === depositTarget)?.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        {depositTarget === "automatic" &&
                        isAutomaticSplitEnabled
                          ? `Intelligently distribute across ${wallets.length} wallets`
                          : "Deposit to specific wallet"}
                      </div>
                    </div>
                  </div>
                  {(isAutomaticSplitEnabled ||
                    isSpecificWalletDepositsEnabled) && (
                    <CaretDownIcon
                      size={16}
                      className={`text-gray-400 transition-transform ${showTargetDropdown ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {showTargetDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-10">
                    {/* Automatic split option - only show if enabled */}
                    {isAutomaticSplitEnabled && (
                      <button
                        onClick={() => {
                          setDepositTarget("automatic");
                          setShowTargetDropdown(false);
                        }}
                        className="w-full p-3 text-left hover:bg-slate-700/50 transition-colors border-b border-slate-600/50"
                      >
                        <div className="flex items-center gap-3">
                          <SplitHorizontalIcon
                            size={20}
                            className="text-teal-400"
                          />
                          <div>
                            <div className="font-medium text-gray-100">
                              Automatic Split
                            </div>
                            <div className="text-sm text-gray-400">
                              Intelligently distribute across {wallets.length}{" "}
                              wallets
                            </div>
                          </div>
                        </div>
                      </button>
                    )}
                    {/* Individual wallet options - only show if enabled */}
                    {isSpecificWalletDepositsEnabled && wallets.length > 0 ? (
                      wallets.map((w) => (
                        <button
                          key={w.id}
                          onClick={() => {
                            setDepositTarget(w.id);
                            setShowTargetDropdown(false);
                          }}
                          className="w-full p-3 text-left hover:bg-slate-700/50 transition-colors last:border-b-0 border-b border-slate-600/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-5 h-5 bg-teal-500/20 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-teal-400 rounded-full" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-100">
                                  {w.name}
                                </div>
                                <div className="text-sm text-gray-400 capitalize">
                                  {w.walletType.toLowerCase()} wallet
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-100">
                                {formatSats(w.balance)}
                              </div>
                              <div className="text-xs text-gray-400">
                                {formatCurrency(w.balanceFiat)}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : isSpecificWalletDepositsEnabled &&
                      wallets.length === 0 ? (
                      <div className="p-3 text-center text-gray-400">
                        <div className="text-sm">No wallets available</div>
                        <div className="text-xs">
                          Create a wallet first to enable specific deposits
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedMethod ? (
            /* Payment Method Selection */
            <div>
              <h3 className="text-lg font-medium text-gray-100 mb-4">
                Choose Payment Method
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
                  {paymentMethods.find((m) => m.value === selectedMethod)?.icon}
                  <span className="text-lg font-medium text-gray-100">
                    {
                      paymentMethods.find((m) => m.value === selectedMethod)
                        ?.label
                    }
                  </span>
                </div>
              </div>

              {selectedMethod === "mpesa" && (
                <MpesaDepositForm
                  wallet={wallet}
                  wallets={wallets}
                  depositTarget={depositTarget}
                  onSuccess={handleSuccess}
                  onError={setError}
                />
              )}

              {selectedMethod === "lightning" && (
                <LightningDepositForm
                  wallet={wallet}
                  wallets={wallets}
                  depositTarget={depositTarget}
                  onSuccess={handleSuccess}
                  onError={setError}
                />
              )}
            </div>
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
                      : "Processing Payment"}
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
