"use client";

import { useState } from "react";
import { Button } from "@bitsacco/ui";
import {
  TargetIcon,
  LockIcon,
  XIcon,
  CalendarIcon,
  CurrencyCircleDollarIcon,
} from "@phosphor-icons/react";
import type {
  CreateWalletModalProps,
  WalletType,
  CreateWalletRequest,
} from "@/lib/types/savings";
import { useWallets } from "@/hooks/savings/use-wallets";
import { useFeatureFlag } from "@/lib/feature-flags-provider";
import { FEATURE_FLAGS } from "@/lib/features";
// import { formatCurrency } from "@/lib/utils/format";

export function CreateWalletModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWalletModalProps) {
  const { createWallet } = useWallets();
  const isTargetWalletsEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_TARGET_WALLETS,
  );
  const isLockedWalletsEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_LOCKED_WALLETS,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"type" | "details">("type");
  const [walletType, setWalletType] = useState<WalletType>(
    isTargetWalletsEnabled
      ? "TARGET"
      : isLockedWalletsEnabled
        ? "LOCKED"
        : "DEFAULT",
  );
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    lockPeriod: "6",
  });

  const allWalletTypes = [
    {
      value: "DEFAULT" as WalletType,
      label: "Standard Savings",
      description:
        "Simple Bitcoin savings with full flexibility and no restrictions",
      icon: (
        <CurrencyCircleDollarIcon
          size={32}
          weight="duotone"
          className="text-teal-400"
        />
      ),
      features: ["Instant withdrawals", "No lock periods", "Simple savings"],
      enabled: true, // Default wallet is always available
    },
    {
      value: "TARGET" as WalletType,
      label: "Savings Target",
      description:
        "Set a financial goal and track your progress with visual indicators",
      icon: <TargetIcon size={32} weight="duotone" className="text-blue-400" />,
      features: [
        "Progress tracking",
        "Goal visualization",
        "Optional auto-deposits",
      ],
      enabled: isTargetWalletsEnabled,
    },
    {
      value: "LOCKED" as WalletType,
      label: "Locked Savings",
      description: "Lock your savings for a fixed period with maturity bonuses",
      icon: <LockIcon size={32} weight="duotone" className="text-amber-400" />,
      features: ["Higher returns", "Maturity bonuses", "Disciplined saving"],
      enabled: isLockedWalletsEnabled,
    },
  ];

  // Filter wallet types based on feature flags
  const walletTypes = allWalletTypes.filter((type) => type.enabled);

  const lockPeriods = [
    {
      value: "3",
      label: "3 months",
      bonus: 2,
      description: "Short-term commitment",
    },
    {
      value: "6",
      label: "6 months",
      bonus: 5,
      description: "Balanced approach",
    },
    {
      value: "12",
      label: "12 months",
      bonus: 8,
      description: "Higher returns",
    },
    {
      value: "24",
      label: "24 months",
      bonus: 12,
      description: "Maximum bonus",
    },
  ];

  const handleTypeSelect = (type: WalletType) => {
    setWalletType(type);
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error("Wallet name is required");
      }

      if (walletType === "TARGET") {
        const targetAmount = parseFloat(formData.targetAmount);
        if (!targetAmount || targetAmount <= 0) {
          throw new Error("Target amount must be greater than 0");
        }
        if (targetAmount < 100) {
          throw new Error("Target amount must be at least KES 100");
        }
      }

      const payload: CreateWalletRequest = {
        type: walletType,
        name: formData.name.trim(),
      };

      if (walletType === "TARGET") {
        payload.targetAmount = parseFloat(formData.targetAmount);
        if (formData.targetDate) {
          payload.targetDate = formData.targetDate;
        }
      }

      if (walletType === "LOCKED") {
        const months = parseInt(formData.lockPeriod);
        const selectedPeriod = lockPeriods.find(
          (p) => p.value === formData.lockPeriod,
        );
        payload.lockPeriod = {
          months,
          maturityBonus: selectedPeriod?.bonus || 5,
        };
      }

      await createWallet(payload);

      // Reset form and close modal
      setFormData({
        name: "",
        targetAmount: "",
        targetDate: "",
        lockPeriod: "6",
      });
      setWalletType("TARGET");
      setStep("type");
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      targetAmount: "",
      targetDate: "",
      lockPeriod: "6",
    });
    setWalletType("DEFAULT");
    setStep("type");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-100">
              {step === "type" ? "Choose Wallet Type" : "Wallet Details"}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {step === "type"
                ? "Select the type of savings wallet that fits your goals"
                : "Configure your new wallet settings"}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <XIcon size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "type" ? (
            <div className="grid gap-4">
              {walletTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeSelect(type.value)}
                  className="p-6 border border-slate-600 rounded-lg text-left transition-all duration-200 hover:border-slate-500 hover:bg-slate-700/30 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-700/50 rounded-lg group-hover:bg-slate-700 transition-colors">
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-100 text-lg mb-2">
                        {type.label}
                      </h3>
                      <p className="text-gray-400 mb-3">{type.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {type.features.map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs bg-slate-700/50 text-gray-300 px-2 py-1 rounded-md"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      →
                    </div>
                  </div>
                </button>
              ))}

              {/* Show feature tease for disabled wallet types */}
              {!isTargetWalletsEnabled && (
                <div className="p-6 border border-slate-600/50 rounded-lg bg-slate-700/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <TargetIcon
                        size={32}
                        weight="duotone"
                        className="text-blue-400/50"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-400 text-lg mb-2">
                        Savings Target
                      </h3>
                      <p className="text-gray-500 mb-3">
                        Set financial goals and track progress with visual
                        indicators
                      </p>
                      <span className="text-xs bg-slate-600/50 text-gray-400 px-3 py-1 rounded-md">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {!isLockedWalletsEnabled && (
                <div className="p-6 border border-slate-600/50 rounded-lg bg-slate-700/20">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-700/50 rounded-lg">
                      <LockIcon
                        size={32}
                        weight="duotone"
                        className="text-amber-400/50"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-400 text-lg mb-2">
                        Locked Savings
                      </h3>
                      <p className="text-gray-500 mb-3">
                        Lock savings for fixed periods with maturity bonuses
                      </p>
                      <span className="text-xs bg-slate-600/50 text-gray-400 px-3 py-1 rounded-md">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Type Summary */}
              <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-600/50">
                <div className="flex items-center gap-3">
                  {walletTypes.find((t) => t.value === walletType)?.icon}
                  <div>
                    <h3 className="font-medium text-gray-100">
                      {walletTypes.find((t) => t.value === walletType)?.label}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {
                        walletTypes.find((t) => t.value === walletType)
                          ?.description
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Wallet Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Wallet Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Emergency Fund, Vacation Savings"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  maxLength={50}
                  required
                />
              </div>

              {/* Target-specific fields */}
              {walletType === "TARGET" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Amount (KES) *
                    </label>
                    <div className="relative">
                      <CurrencyCircleDollarIcon
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="number"
                        value={formData.targetAmount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetAmount: e.target.value,
                          })
                        }
                        placeholder="10000"
                        min="100"
                        max="10000000"
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum: KES 100
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Target Date (Optional)
                    </label>
                    <div className="relative">
                      <CalendarIcon
                        size={20}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="date"
                        value={formData.targetDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            targetDate: e.target.value,
                          })
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Locked-specific fields */}
              {walletType === "LOCKED" && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Lock Period *
                  </label>
                  <div className="grid gap-3">
                    {lockPeriods.map((period) => (
                      <button
                        key={period.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, lockPeriod: period.value })
                        }
                        className={`p-4 border rounded-lg text-left transition-all ${
                          formData.lockPeriod === period.value
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-slate-600 hover:border-slate-500"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-gray-100 font-medium">
                              {period.label}
                            </span>
                            <div className="text-sm text-gray-400">
                              {period.description}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-amber-400 font-bold">
                              {period.bonus}%
                            </div>
                            <div className="text-xs text-gray-500">bonus</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-slate-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep("type")}
                  className="flex-1 !bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="tealPrimary"
                  loading={loading}
                  className="flex-2 shadow-lg shadow-teal-500/20"
                >
                  {loading ? "Creating..." : "Create Wallet"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
