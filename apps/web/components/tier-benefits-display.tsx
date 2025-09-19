"use client";

import { useState, useEffect } from "react";
import { Button } from "@bitsacco/ui";
import {
  CrownIcon,
  ShieldCheckIcon,
  TrendUpIcon,
  Users,
  CalendarIcon,
  LightningIcon,
  GiftIcon,
  ChartLineIcon,
  HeadphonesIcon,
  StarIcon,
  LockIcon,
  CheckIcon,
} from "@phosphor-icons/react";
import type { MembershipTier } from "@bitsacco/core";
import { fetchMembershipTiers } from "@/lib/membership-tiers-service";

interface TierBenefitsDisplayProps {
  currentTier: MembershipTier | null;
  currentShares: number;
  onUpgradeClick?: (tier: MembershipTier) => void;
  compact?: boolean;
}

export function TierBenefitsDisplay({
  currentTier,
  currentShares,
  onUpgradeClick,
  compact = false,
}: TierBenefitsDisplayProps) {
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(
    currentTier,
  );
  const [allTiers, setAllTiers] = useState<MembershipTier[]>([]);

  // Fetch tiers from mock API
  useEffect(() => {
    const loadTiers = async () => {
      try {
        const response = await fetchMembershipTiers();
        if (response.success && response.data?.tiers) {
          setAllTiers(response.data.tiers);
        }
      } catch (error) {
        console.error("Failed to fetch tiers for benefits display:", error);
      }
    };
    loadTiers();
  }, []);

  const getTierIcon = (tier: MembershipTier) => {
    switch (tier.level) {
      case 1:
        return (
          <ShieldCheckIcon
            size={24}
            className="text-orange-400"
            weight="fill"
          />
        );
      case 2:
        return (
          <TrendUpIcon size={24} className="text-gray-400" weight="fill" />
        );
      case 3:
        return <StarIcon size={24} className="text-yellow-400" weight="fill" />;
      case 4:
        return (
          <CrownIcon size={24} className="text-purple-400" weight="fill" />
        );
      default:
        return <ShieldCheckIcon size={24} className="text-gray-500" />;
    }
  };

  const getTierColor = (tier: MembershipTier) => {
    switch (tier.level) {
      case 1:
        return "border-orange-500/30 bg-orange-500/10";
      case 2:
        return "border-gray-500/30 bg-gray-500/10";
      case 3:
        return "border-yellow-500/30 bg-yellow-500/10";
      case 4:
        return "border-purple-500/30 bg-purple-500/10";
      default:
        return "border-gray-700 bg-gray-800/50";
    }
  };

  const getBenefitIcon = (benefitTitle: string) => {
    if (benefitTitle.toLowerCase().includes("support"))
      return <HeadphonesIcon size={16} />;
    if (benefitTitle.toLowerCase().includes("report"))
      return <ChartLineIcon size={16} />;
    if (benefitTitle.toLowerCase().includes("event"))
      return <CalendarIcon size={16} />;
    if (benefitTitle.toLowerCase().includes("fee"))
      return <LightningIcon size={16} />;
    if (benefitTitle.toLowerCase().includes("bonus"))
      return <GiftIcon size={16} />;
    if (benefitTitle.toLowerCase().includes("advisor"))
      return <Users size={16} />;
    return <CheckIcon size={16} />;
  };

  const isUserEligible = (tier: MembershipTier) => {
    return currentShares >= tier.shareRequirements;
  };

  const getUpgradeInfo = (tier: MembershipTier) => {
    if (currentShares >= tier.shareRequirements) {
      return null;
    }

    const sharesNeeded = tier.shareRequirements - currentShares;
    const costEstimate = sharesNeeded * 500; // Assuming 500 KES per share

    return {
      sharesNeeded,
      costEstimate,
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  if (compact) {
    return (
      <div className="space-y-3">
        {allTiers.map((tier) => {
          const isCurrentTier = currentTier?.level === tier.level;
          const isEligible = isUserEligible(tier);
          const upgradeInfo = getUpgradeInfo(tier);

          return (
            <div
              key={tier.id}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200
                ${isCurrentTier ? getTierColor(tier) : "border-slate-700 bg-slate-800/50"}
                ${!isEligible ? "opacity-60" : ""}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTierIcon(tier)}
                  <div>
                    <h4 className="font-semibold text-gray-100">{tier.name}</h4>
                    <p className="text-sm text-gray-400">
                      {tier.shareRequirements} shares minimum
                    </p>
                  </div>
                </div>

                {isCurrentTier && (
                  <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-xs rounded-full">
                    Current
                  </span>
                )}

                {!isEligible && upgradeInfo && (
                  <div className="text-right">
                    <p className="text-sm text-gray-400">
                      {upgradeInfo.sharesNeeded} shares needed
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(upgradeInfo.costEstimate)}
                    </p>
                  </div>
                )}

                {!isCurrentTier && !isEligible && onUpgradeClick && (
                  <LockIcon size={20} className="text-gray-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tier Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {allTiers.map((tier) => {
          const isCurrentTier = currentTier?.level === tier.level;
          const isEligible = isUserEligible(tier);
          const isSelected = selectedTier?.level === tier.level;

          return (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier)}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${isSelected ? getTierColor(tier) : "border-slate-700 bg-slate-800/50 hover:border-slate-600"}
                ${!isEligible ? "opacity-60" : ""}
              `}
            >
              {isCurrentTier && (
                <div className="absolute -top-2 -right-2">
                  <span className="px-2 py-1 bg-teal-500 text-white text-xs rounded-full">
                    Current
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                {getTierIcon(tier)}
                <h3 className="font-semibold text-gray-100">{tier.name}</h3>
              </div>

              <p className="text-sm text-gray-400 mb-2">
                {tier.shareRequirements} shares minimum
              </p>

              {!isEligible && (
                <div className="flex items-center gap-1 text-red-400 text-xs">
                  <LockIcon size={12} />
                  <span>
                    {tier.shareRequirements - currentShares} shares needed
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Tier Details */}
      {selectedTier && (
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {getTierIcon(selectedTier)}
              <div>
                <h3 className="text-xl font-semibold text-gray-100">
                  {selectedTier.name} Tier
                </h3>
                <p className="text-gray-400">
                  Minimum {selectedTier.shareRequirements} shares
                </p>
              </div>
            </div>

            {currentTier?.level !== selectedTier.level && onUpgradeClick && (
              <div className="text-right">
                {isUserEligible(selectedTier) ? (
                  <Button
                    variant="tealPrimary"
                    onClick={() => onUpgradeClick(selectedTier)}
                    className="shadow-lg shadow-teal-500/20"
                  >
                    Select This Tier
                  </Button>
                ) : (
                  <div>
                    <Button
                      variant="tealOutline"
                      onClick={() => onUpgradeClick(selectedTier)}
                      className="mb-2"
                    >
                      Upgrade to {selectedTier.name}
                    </Button>
                    <p className="text-sm text-gray-400">
                      {getUpgradeInfo(selectedTier)?.sharesNeeded} shares needed
                    </p>
                    <p className="text-xs text-gray-500">
                      ~
                      {formatCurrency(
                        getUpgradeInfo(selectedTier)?.costEstimate || 0,
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Benefits */}
          <div>
            <h4 className="text-lg font-medium text-gray-100 mb-4">
              Benefits & Features
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedTier.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-lg"
                >
                  <div className="text-teal-400">{getBenefitIcon(benefit)}</div>
                  <span className="text-gray-300">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Note: Payment methods section removed - tier restrictions service eliminated for simplicity */}
        </div>
      )}
    </div>
  );
}
