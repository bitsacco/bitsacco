"use client";

import { useState, useEffect } from "react";
import { formatDistance } from "date-fns";
import {
  ChartLineIcon,
  CoinIcon,
  ShoppingBagIcon,
  ArrowsLeftRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparkleIcon,
  StorefrontIcon,
  ClockCounterClockwiseIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
} from "@phosphor-icons/react";
import {
  SharesTxStatus,
  SharesTxType,
  type SharesTx,
  type AllSharesOffers,
  type UserShareTxsResponse,
  type SharesOffer,
  MembershipTier,
} from "@bitsacco/core";
import { Button } from "@bitsacco/ui";
import { TransferSharesModal } from "@/components/transfer-shares-modal";
import { BuySharesModal } from "@/components/buy-shares-modal";
import { TransactionHistory } from "@/components/transaction-history";
import { SHARE_VALUE_KES } from "@/lib/config";
import { useFeatureFlag } from "@/lib/feature-flags-provider";
import { Routes } from "@/lib/routes";
import { FEATURE_FLAGS } from "@/lib/features";
import { MembershipBusinessLogic } from "@/lib/membership-business-logic";
import { fetchMembershipTiers } from "@/lib/membership-tiers-service";

// Tab configuration
const tabs = [
  {
    id: "shares",
    label: "My Shares",
    icon: ShieldCheckIcon,
    description: "View and manage your share holdings",
  },
  {
    id: "history",
    label: "History",
    icon: ClockCounterClockwiseIcon,
    description: "Track your transaction history",
  },
  {
    id: "offers",
    label: "Marketplace",
    icon: StorefrontIcon,
    description: "Browse available share offers",
  },
];

export default function MembershipPage() {
  // Feature flags
  const isTransferEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_MEMBERSHIP_SHARE_TRANSFER,
  );
  const isMarketplaceEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_SHARE_MARKETPLACE,
  );
  const isHistoryEnabled = useFeatureFlag(
    FEATURE_FLAGS.ENABLE_TRANSACTION_HISTORY,
  );

  const [activeTab, setActiveTab] = useState<"shares" | "offers" | "history">(
    "shares",
  );
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedShareForTransfer, setSelectedShareForTransfer] =
    useState<SharesTx | null>(null);

  // State for data
  const [offers, setOffers] = useState<AllSharesOffers | null>(null);
  const [transactions, setTransactions] = useState<UserShareTxsResponse | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [membershipTiers, setMembershipTiers] = useState<MembershipTier[]>([]);

  // Fetch membership tiers (mock service - TODO: replace with real API)
  const loadTiers = async () => {
    try {
      const response = await fetchMembershipTiers();
      if (response.success && response.data?.tiers) {
        setMembershipTiers(response.data.tiers);
      }
    } catch (error) {
      console.error("Failed to fetch membership tiers:", error);
    }
  };

  // Fetch offers
  const fetchOffers = async () => {
    try {
      const response = await fetch(Routes.API.MEMBERSHIP.SHARES.OFFERS);
      const data = await response.json();
      setOffers(data.data);
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    }
  };

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      const response = await fetch(
        `${Routes.API.MEMBERSHIP.SHARES.TRANSACTIONS}?size=20`,
      );
      const data = await response.json();
      console.log("[MembershipPage] Raw API response:", data);
      console.log("[MembershipPage] Response structure:", {
        success: data.success,
        hasData: !!data.data,
        dataKeys: data.data ? Object.keys(data.data) : [],
        dataStructure: data.data,
      });
      setTransactions(data.data);
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    Promise.all([loadTiers(), fetchOffers(), fetchTransactions()]);
  }, []);

  // Current tier calculation moved to summary calculation

  // Calculate enhanced summary using business logic
  const calculateSummary = () => {
    const baseShares = transactions?.shareHoldings || 0;
    const calculatedShares = transactions?.shares?.transactions
      ? MembershipBusinessLogic.calculateShareHoldings(
          transactions.shares.transactions,
        )
      : 0;

    console.log("[MembershipPage] Share calculation:", {
      baseShares,
      calculatedShares,
      hasTransactions: !!transactions?.shares?.transactions,
      transactionCount: transactions?.shares?.transactions?.length || 0,
    });

    // Use API totalShares if available, otherwise calculate from transactions
    const totalShares = baseShares || calculatedShares;
    const totalValue = MembershipBusinessLogic.calculatePortfolioValue(
      totalShares,
      SHARE_VALUE_KES,
    );
    const membershipStatus = transactions?.shares?.transactions
      ? MembershipBusinessLogic.getUserMembershipStatus(
          totalShares,
          transactions.shares.transactions,
        )
      : { hasShares: false, isNewMember: true, totalTransactions: 0 };

    const currentTier = MembershipBusinessLogic.calculateMembershipTier(
      totalShares,
      membershipTiers,
    );
    const nextTierInfo = MembershipBusinessLogic.getNextTierInfo(
      totalShares,
      membershipTiers,
    );
    const activeOffer = offers?.offers
      ? MembershipBusinessLogic.findActiveOffer(offers.offers)
      : null;

    return {
      totalShares,
      totalValue,
      activeOffers: offers?.offers?.length || 0,
      totalTransfers: membershipStatus.totalTransactions,
      membershipStatus,
      currentTier,
      nextTierInfo,
      activeOffer,
    };
  };

  const summary = calculateSummary();

  // Filter tabs based on feature flags
  const availableTabs = tabs.filter((tab) => {
    if (tab.id === "offers" && !isMarketplaceEnabled) return false;
    if (tab.id === "history" && !isHistoryEnabled) return false;
    return true;
  });

  // Count total transfers from transactions
  if (transactions?.shares?.transactions) {
    transactions.shares.transactions.forEach((tx: SharesTx) => {
      if (
        tx.status === SharesTxStatus.COMPLETE &&
        tx.transfer // Check if it's a transfer transaction
      ) {
        summary.totalTransfers++;
      }
    });
  }

  // Calculate active shares - show all completed transactions (not just subscriptions)
  // This will show the user's share history
  const activeShares: SharesTx[] =
    transactions?.shares?.transactions?.filter(
      (tx: SharesTx) => tx.status === SharesTxStatus.COMPLETE,
    ) || [];

  console.log("[MembershipPage] Active shares filter:", {
    hasTransactions: !!transactions?.shares,
    totalTransactions: transactions?.shares?.transactions?.length || 0,
    completedTransactions: activeShares.length,
    allStatuses:
      transactions?.shares?.transactions?.map((tx: SharesTx) => tx.status) ||
      [],
    SharesTxStatus_COMPLETE: SharesTxStatus.COMPLETE,
  });

  // Handle quick buy with business logic
  const handleQuickBuy = () => {
    if (summary.activeOffer) {
      // Use the active offer determined by business logic
      setSelectedOfferId(summary.activeOffer.id);
      setShowPurchaseModal(true);
    } else if (offers?.offers && offers.offers.length > 0) {
      // Fallback to first available offer
      setSelectedOfferId(offers.offers[0].id);
      setShowPurchaseModal(true);
    } else {
      // If no offers available, switch to marketplace tab
      setActiveTab("offers");
    }
  };

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
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: SharesTxType) => {
    const typeConfig = {
      [SharesTxType.SUBSCRIPTION]: {
        bg: "bg-blue-500/20",
        text: "text-blue-300",
        icon: <ShoppingBagIcon size={14} weight="fill" />,
      },
      [SharesTxType.TRANSFER]: {
        bg: "bg-purple-500/20",
        text: "text-purple-300",
        icon: <ArrowsLeftRightIcon size={14} weight="fill" />,
      },
      [SharesTxType.OFFER]: {
        bg: "bg-orange-500/20",
        text: "text-orange-300",
        icon: <SparkleIcon size={14} weight="fill" />,
      },
    };

    // Default to SUBSCRIPTION if type is missing or invalid
    const safeType = type || SharesTxType.SUBSCRIPTION;
    const config =
      typeConfig[safeType] || typeConfig[SharesTxType.SUBSCRIPTION];

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        {safeType}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-2">
          Membership Dashboard
        </h1>
        <p className="text-sm sm:text-base text-gray-400">
          Manage your shares, track your investment journey and participate in
          your SACCO
        </p>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-700/50 rounded-xl p-6 sm:p-8 mb-6">
        <div className="flex flex-col gap-6">
          {/* Header with icon and tier pill */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-14 h-14 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <ChartLineIcon
                size={28}
                weight="fill"
                className="text-teal-400"
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-100 mb-1">
                    Your Share Portfolio
                  </h3>
                  <p className="text-gray-400">Total holdings in the SACCO</p>
                </div>
                <div className="bg-gradient-to-r from-orange-500/20 to-orange-400/20 border border-orange-500/40 rounded-full px-4 py-2 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-orange-300">
                    {summary.currentTier?.name || "New Account"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-400 mb-1">Total Shares</p>
              <p className="text-3xl font-bold text-teal-300">
                {summary.totalShares.toLocaleString()}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm text-gray-400 mb-1">Portfolio Value</p>
              <p className="text-3xl font-bold text-gray-100">
                {formatCurrency(summary.totalValue)}
              </p>
            </div>
          </div>

          {/* Membership Tier Progress */}
          {summary.nextTierInfo.nextTier && (
            <div className="rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-400">
                  Progress to {summary.nextTierInfo.nextTier.name}
                </p>
                <p className="text-sm text-gray-400">
                  {summary.nextTierInfo.sharesNeeded} shares needed
                </p>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${summary.nextTierInfo.progressPercentage}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round(summary.nextTierInfo.progressPercentage)}% complete
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="tealPrimary"
              size="lg"
              onClick={handleQuickBuy}
              className="shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 flex-1"
            >
              <ShoppingCartIcon size={20} weight="bold" />
              Buy Shares
            </Button>
            {isTransferEnabled && (
              <Button
                variant="tealOutline"
                size="lg"
                className="!border-slate-600 !text-gray-300 hover:!bg-slate-700/50 flex items-center justify-center gap-2 flex-1"
                onClick={() => {
                  if (activeShares.length > 0) {
                    setSelectedShareForTransfer(activeShares[0]);
                    setShowTransferModal(true);
                  }
                }}
                disabled={activeShares.length === 0}
              >
                <ArrowsLeftRightIcon size={20} weight="bold" />
                Transfer Shares
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="mb-6 sm:mb-8">
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-1.5 sm:p-2 border border-slate-700">
          <div className="relative">
            {/* Sliding indicator */}
            <div
              className="absolute top-0 left-0 h-full bg-teal-500/20 rounded-xl transition-all duration-300 ease-out"
              style={{
                width: `${100 / availableTabs.length}%`,
                transform: `translateX(${availableTabs.findIndex((tab) => tab.id === activeTab) * 100}%)`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-teal-400/10 rounded-xl" />
            </div>

            {/* Tab buttons */}
            <div className="relative flex">
              {availableTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 px-2 sm:px-4 lg:px-6 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "text-teal-300"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  >
                    <Icon
                      size={20}
                      weight={isActive ? "fill" : "regular"}
                      className={`transition-all duration-200 ${
                        isActive
                          ? "text-teal-400 scale-110"
                          : "text-gray-500 group-hover:text-gray-400"
                      }`}
                    />
                    <span className="font-semibold text-xs sm:text-sm hidden sm:inline">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tab description */}
        <p className="mt-3 text-sm text-gray-500 text-center">
          {availableTabs.find((tab) => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Content */}
      <div className="bg-slate-800/40 backdrop-blur-sm rounded-xl border border-slate-700">
        {activeTab === "shares" && (
          <div className="p-4 sm:p-6 lg:p-8">
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-700 border-t-teal-400 mx-auto"></div>
                <p className="mt-6 text-gray-400 text-lg">
                  Loading your shares...
                </p>
              </div>
            ) : summary.totalShares > 0 ? (
              // User has shares but no recent visible transactions
              <div>
                {/* Show recent transactions if any */}
                {activeShares.length > 0 && (
                  <div className="space-y-4">
                    {activeShares.slice(0, 5).map((share: SharesTx) => (
                      <div
                        key={share.id}
                        className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-900/70 transition-all duration-200"
                      >
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <ShieldCheckIcon
                                size={20}
                                weight="fill"
                                className="text-teal-400"
                              />
                              <p className="text-xl font-semibold text-gray-100">
                                {share.quantity} Shares
                              </p>
                            </div>
                            <p className="text-gray-400 mb-2">
                              Value:{" "}
                              <span className="text-teal-300 font-medium">
                                {formatCurrency(
                                  share.quantity * SHARE_VALUE_KES,
                                )}
                              </span>
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDistance(
                                new Date(share.createdAt),
                                new Date(),
                                { addSuffix: true },
                              )}
                            </p>
                          </div>
                          {/* Status pills and Transfer button - mobile: below, desktop: right */}
                          <div className="flex flex-col lg:items-end gap-3">
                            <div className="flex items-center gap-2">
                              {getTypeBadge(
                                share.transfer
                                  ? SharesTxType.TRANSFER
                                  : SharesTxType.SUBSCRIPTION,
                              )}
                              {getStatusBadge(share.status)}
                            </div>
                            {isTransferEnabled && (
                              <Button
                                variant="tealOutline"
                                size="sm"
                                className="!border-slate-600 !text-gray-300 hover:!bg-slate-700/50 w-full lg:w-auto"
                                onClick={() => {
                                  setSelectedShareForTransfer(share);
                                  setShowTransferModal(true);
                                }}
                              >
                                Transfer Shares
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : activeShares.length > 0 ? (
              // Show transactions when totalShares is 0 or not available but we have transactions
              <div className="space-y-4">
                {activeShares.map((share: SharesTx) => (
                  <div
                    key={share.id}
                    className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-900/70 transition-all duration-200"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <ShieldCheckIcon
                            size={20}
                            weight="fill"
                            className="text-teal-400"
                          />
                          <p className="text-xl font-semibold text-gray-100">
                            {share.quantity} Shares
                          </p>
                        </div>
                        <p className="text-gray-400 mb-2">
                          Value:{" "}
                          <span className="text-teal-300 font-medium">
                            {formatCurrency(share.quantity * SHARE_VALUE_KES)}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDistance(
                            new Date(share.createdAt),
                            new Date(),
                            { addSuffix: true },
                          )}
                        </p>
                      </div>
                      {/* Status pills and Transfer button - mobile: below, desktop: right */}
                      <div className="flex flex-col lg:items-end gap-3">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(
                            share.transfer
                              ? SharesTxType.TRANSFER
                              : SharesTxType.SUBSCRIPTION,
                          )}
                          {getStatusBadge(share.status)}
                        </div>
                        {isTransferEnabled && (
                          <Button
                            variant="tealOutline"
                            size="sm"
                            className="!border-slate-600 !text-gray-300 hover:!bg-slate-700/50 w-full lg:w-auto"
                          >
                            Transfer Shares
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ChartLineIcon
                    size={40}
                    weight="thin"
                    className="text-gray-500"
                  />
                </div>
                <h4 className="text-xl font-semibold text-gray-100 mb-3">
                  Start Your Investment Journey
                </h4>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Purchase shares to become a member and participate in
                  collective investments with guaranteed returns
                </p>
                <Button
                  variant="tealPrimary"
                  size="lg"
                  onClick={() => setActiveTab("offers")}
                  className="shadow-lg shadow-teal-500/20"
                >
                  Browse Available Shares
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === "offers" && (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-semibold text-gray-100">
                Share Marketplace
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <SparkleIcon
                  size={16}
                  weight="fill"
                  className="text-yellow-400"
                />
                Official & Member listings
              </div>
            </div>
            {loading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-14 w-14 border-4 border-slate-700 border-t-teal-400 mx-auto"></div>
                <p className="mt-6 text-gray-400 text-lg">
                  Loading marketplace...
                </p>
              </div>
            ) : offers?.offers && offers.offers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {offers.offers.map((offer: SharesOffer) => (
                  <div
                    key={offer.id}
                    className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:bg-slate-900/70 hover:border-teal-500/50 transition-all duration-200 group"
                  >
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
                          <CoinIcon
                            size={24}
                            weight="fill"
                            className="text-teal-400"
                          />
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full">
                          Available
                        </span>
                      </div>
                      <p className="text-2xl font-bold text-gray-100 mb-2">
                        {offer.quantity} Shares
                      </p>
                      <p className="text-gray-400">
                        Total value:{" "}
                        <span className="text-teal-300 font-medium">
                          {formatCurrency(offer.quantity * SHARE_VALUE_KES)}
                        </span>
                      </p>
                    </div>
                    <div className="space-y-3 mb-6 py-4 border-t border-slate-700">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircleIcon
                          size={16}
                          weight="fill"
                          className="text-green-400"
                        />
                        <span>
                          Available from{" "}
                          {new Date(offer.availableFrom).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <ClockIcon
                          size={16}
                          weight="fill"
                          className="text-yellow-400"
                        />
                        <span>
                          {offer.availableTo ? (
                            <>
                              Expires{" "}
                              {new Date(offer.availableTo).toLocaleDateString()}
                            </>
                          ) : (
                            "Available until fully subscribed"
                          )}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="tealPrimary"
                      fullWidth
                      onClick={() => {
                        setSelectedOfferId(offer.id);
                        setShowPurchaseModal(true);
                      }}
                      className="group-hover:shadow-lg group-hover:shadow-teal-500/20 transition-all duration-200"
                    >
                      Purchase Shares
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBagIcon
                    size={40}
                    weight="thin"
                    className="text-gray-500"
                  />
                </div>
                <h4 className="text-xl font-semibold text-gray-100 mb-3">
                  No Offers Available
                </h4>
                <p className="text-gray-400 max-w-md mx-auto">
                  Check back soon for new investment opportunities. We regularly
                  add new share offers.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <TransactionHistory
            transactions={transactions}
            loading={loading}
            onRefresh={fetchTransactions}
          />
        )}
      </div>

      {/* Purchase Modal */}
      <BuySharesModal
        isOpen={showPurchaseModal}
        onClose={() => {
          setShowPurchaseModal(false);
          setSelectedOfferId(null);
        }}
        offer={
          selectedOfferId
            ? offers?.offers?.find((o) => o.id === selectedOfferId) || null
            : null
        }
        onSuccess={fetchTransactions}
      />

      {/* Transfer Modal */}
      {isTransferEnabled && selectedShareForTransfer && (
        <TransferSharesModal
          isOpen={showTransferModal}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedShareForTransfer(null);
          }}
          share={selectedShareForTransfer}
          onSuccess={() => {
            fetchTransactions();
            fetchOffers();
          }}
        />
      )}
    </div>
  );
}
