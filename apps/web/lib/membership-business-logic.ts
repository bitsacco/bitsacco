import {
  type SharesOffer,
  type SharesTx,
  type MembershipTier,
  SharesTxStatus,
} from "@bitsacco/core";

/**
 * Business logic service ported from Chakra UI webapp
 * Contains complex business rules and calculations for membership features
 */
export class MembershipBusinessLogic {
  /**
   * Find the active offer from available offers
   * Business rule: An offer is active if it has remaining shares available
   */
  static findActiveOffer(offers: SharesOffer[]): SharesOffer | undefined {
    return offers.find((offer) => {
      const available = offer.quantity - offer.subscribedQuantity;
      const isWithinDates = this.isOfferWithinValidDates(offer);
      return available > 0 && isWithinDates;
    });
  }

  /**
   * Check if an offer is within its valid date range
   * Offers without availableTo are available until fully subscribed
   */
  static isOfferWithinValidDates(offer: SharesOffer): boolean {
    const now = new Date();
    const availableFrom = new Date(offer.availableFrom);

    // Check if we're past the start date
    if (now < availableFrom) {
      return false;
    }

    // If no end date specified, offer is available until fully subscribed
    if (!offer.availableTo) {
      return true;
    }

    // Check if we're before the end date
    const availableTo = new Date(offer.availableTo);
    return now <= availableTo;
  }

  /**
   * Calculate user's total share holdings from transaction history
   * Business rule: Sum all completed subscription transactions, subtract transfers out
   */
  static calculateShareHoldings(transactions: SharesTx[]): number {
    return transactions.reduce((total, tx) => {
      if (tx.status !== SharesTxStatus.COMPLETE) return total;

      if (tx.transfer) {
        // For transfers, check if user is sender or receiver
        // This would need user context to determine direction
        return total; // Simplified for now
      }

      return total + tx.quantity;
    }, 0);
  }

  /**
   * Calculate portfolio value
   */
  static calculatePortfolioValue(
    shareHoldings: number,
    shareValue: number,
  ): number {
    return shareHoldings * shareValue;
  }

  /**
   * Calculate offer subscription progress
   */
  static calculateOfferProgress(offer: SharesOffer): {
    subscribed: number;
    total: number;
    percentage: number;
    remaining: number;
  } {
    const { quantity, subscribedQuantity: subscribed } = offer;
    const percentage = quantity > 0 ? (subscribed / quantity) * 100 : 0;
    const remaining = quantity - subscribed;

    return {
      total: quantity,
      subscribed,
      percentage,
      remaining,
    };
  }

  /**
   * Determine user membership status
   */
  static getUserMembershipStatus(
    shareHoldings: number,
    transactions: SharesTx[],
  ): {
    hasShares: boolean;
    isNewMember: boolean;
    totalTransactions: number;
    firstPurchaseDate?: string;
  } {
    const completedTransactions = transactions.filter(
      (tx) => tx.status === SharesTxStatus.COMPLETE,
    );
    const hasShares = shareHoldings > 0;
    const totalTransactions = completedTransactions.length;

    // Find first completed subscription
    const firstPurchase = completedTransactions
      .filter((tx) => !tx.transfer)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )[0];

    const isNewMember =
      totalTransactions <= 1 ||
      (firstPurchase &&
        this.daysSince(new Date(firstPurchase.createdAt)) <= 30);

    return {
      hasShares,
      isNewMember,
      totalTransactions,
      firstPurchaseDate: firstPurchase?.createdAt,
    };
  }

  /**
   * Calculate membership tier based on share holdings
   */
  static calculateMembershipTier(
    shareHoldings: number,
    tiers: MembershipTier[] = [],
  ): MembershipTier | null {
    if (tiers.length === 0) return null;

    // Find the highest tier the user qualifies for
    return (
      tiers
        .filter((tier) => shareHoldings >= tier.shareRequirements)
        .sort((a, b) => b.level - a.level)[0] || null
    );
  }

  /**
   * Calculate next tier and requirements
   */
  static getNextTierInfo(
    currentShareHoldings: number,
    tiers: MembershipTier[] = [],
  ): {
    nextTier: MembershipTier | null;
    sharesNeeded: number;
    progressPercentage: number;
  } {
    if (tiers.length === 0) {
      return {
        nextTier: null,
        sharesNeeded: 0,
        progressPercentage: 100,
      };
    }

    const currentTier = this.calculateMembershipTier(
      currentShareHoldings,
      tiers,
    );
    const nextTier = tiers.find(
      (tier) => tier.shareRequirements > currentShareHoldings,
    );

    if (!nextTier) {
      return {
        nextTier: null,
        sharesNeeded: 0,
        progressPercentage: 100,
      };
    }

    const sharesNeeded = nextTier.shareRequirements - currentShareHoldings;
    const previousTierRequirement = currentTier?.shareRequirements || 0;
    const tierRange = nextTier.shareRequirements - previousTierRequirement;
    const progress = currentShareHoldings - previousTierRequirement;
    const progressPercentage = tierRange > 0 ? (progress / tierRange) * 100 : 0;

    return {
      nextTier: nextTier as MembershipTier,
      sharesNeeded,
      progressPercentage: Math.max(0, Math.min(100, progressPercentage)),
    };
  }

  /**
   * Validate share purchase against business rules
   */
  static validateSharePurchase(
    quantity: number,
    offer: SharesOffer | undefined,
    userShareHoldings: number,
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic validation
    if (quantity <= 0) {
      errors.push("Quantity must be greater than 0");
    }

    if (!offer) {
      errors.push("No active offer available");
      return { isValid: false, errors, warnings };
    }

    const available = offer.quantity - offer.subscribedQuantity;
    // Offer validation
    if (quantity > available) {
      warnings.push(`Only ${available} shares immediately available`);
    }

    if (!this.isOfferWithinValidDates(offer)) {
      errors.push("Offer is not currently active");
    }

    // Business rule validations
    const maxSinglePurchase = 1000;
    if (quantity > maxSinglePurchase) {
      errors.push(`Maximum ${maxSinglePurchase} shares per transaction`);
    }

    // Warning for large purchases
    if (quantity > 100) {
      warnings.push(
        "Large purchase amount - please ensure you have sufficient funds",
      );
    }

    // Warning for first-time buyers
    if (userShareHoldings === 0 && quantity > 30) {
      warnings.push(
        "Consider starting with 30 shares, and save the rest in personal savings",
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Calculate investment analytics
   */
  static calculateInvestmentAnalytics(
    transactions: SharesTx[],
    shareValue: number,
  ): {
    totalInvested: number;
    currentValue: number;
    totalShares: number;
    averageSharePrice: number;
    firstInvestmentDate?: string;
    investmentPeriodDays?: number;
  } {
    const completedPurchases = transactions.filter(
      (tx) => tx.status === SharesTxStatus.COMPLETE && !tx.transfer,
    );

    const totalShares = this.calculateShareHoldings(transactions);
    const totalInvested = completedPurchases.reduce(
      (sum, tx) => sum + tx.quantity * shareValue,
      0,
    );
    const currentValue = totalShares * shareValue;
    const averageSharePrice =
      completedPurchases.length > 0
        ? totalInvested /
          completedPurchases.reduce((sum, tx) => sum + tx.quantity, 0)
        : 0;

    const firstPurchase = completedPurchases.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )[0];

    const investmentPeriodDays = firstPurchase
      ? this.daysSince(new Date(firstPurchase.createdAt))
      : undefined;

    return {
      totalInvested,
      currentValue,
      totalShares,
      averageSharePrice,
      firstInvestmentDate: firstPurchase?.createdAt,
      investmentPeriodDays,
    };
  }

  /**
   * Generate personalized insights for user
   */
  static generatePersonalizedInsights(
    shareHoldings: number,
    transactions: SharesTx[],
    shareValue: number,
  ): string[] {
    const insights: string[] = [];
    const membershipStatus = this.getUserMembershipStatus(
      shareHoldings,
      transactions,
    );
    const nextTierInfo = this.getNextTierInfo(shareHoldings);
    const analytics = this.calculateInvestmentAnalytics(
      transactions,
      shareValue,
    );

    // New member insights
    if (membershipStatus.isNewMember && shareHoldings > 0) {
      insights.push(
        "Welcome to Bitsacco! You've successfully started your investment journey.",
      );
    }

    // Tier progression insights
    if (nextTierInfo.nextTier) {
      const sharesNeeded = nextTierInfo.sharesNeeded;
      insights.push(
        `You're ${sharesNeeded} shares away from ${nextTierInfo.nextTier.name} tier benefits!`,
      );
    }

    // Investment milestones
    if (shareHoldings >= 100 && shareHoldings < 200) {
      insights.push(
        "Great progress! You're building a solid investment foundation.",
      );
    } else if (shareHoldings >= 500) {
      insights.push("Excellent! You're among our top-tier investors.");
    }

    // Portfolio growth insights
    if (analytics.investmentPeriodDays && analytics.investmentPeriodDays > 90) {
      const monthlyAverage =
        shareHoldings / (analytics.investmentPeriodDays / 30);
      if (monthlyAverage > 10) {
        insights.push("You're maintaining consistent investment growth!");
      }
    }

    // Engagement insights
    if (membershipStatus.totalTransactions === 1 && shareHoldings > 0) {
      insights.push(
        "Consider setting up regular investments to maximize your growth potential.",
      );
    }

    return insights.slice(0, 3); // Limit to top 3 insights
  }

  /**
   * Helper function to calculate days since a date
   */
  private static daysSince(date: Date): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate recommended purchase amount based on user profile
   */
  static getRecommendedPurchaseAmount(
    shareHoldings: number,
    transactions: SharesTx[],
  ): number {
    const membershipStatus = this.getUserMembershipStatus(
      shareHoldings,
      transactions,
    );

    // New members: recommend starting small
    if (membershipStatus.isNewMember || shareHoldings === 0) {
      return 10;
    }

    // Existing members: recommend based on their average purchase
    const avgPurchase = transactions
      .filter((tx) => tx.status === SharesTxStatus.COMPLETE && !tx.transfer)
      .reduce((sum, tx, _, arr) => sum + tx.quantity / arr.length, 0);

    return Math.max(10, Math.min(Math.round(avgPurchase * 1.1), 100));
  }

  /**
   * Check if user should see special offers or promotions
   */
  static checkSpecialOfferEligibility(
    shareHoldings: number,
    transactions: SharesTx[],
  ): {
    isEligible: boolean;
    offerType?: "first_time_bonus" | "tier_upgrade" | "loyal_member";
    description?: string;
  } {
    const membershipStatus = this.getUserMembershipStatus(
      shareHoldings,
      transactions,
    );

    // First-time buyer bonus
    if (shareHoldings === 0) {
      return {
        isEligible: true,
        offerType: "first_time_bonus",
        description:
          "Get 5% bonus shares on your first purchase of 50+ shares!",
      };
    }

    // Tier upgrade promotion
    const nextTierInfo = this.getNextTierInfo(shareHoldings);
    if (nextTierInfo.nextTier && nextTierInfo.sharesNeeded <= 20) {
      return {
        isEligible: true,
        offerType: "tier_upgrade",
        description: `Upgrade to ${nextTierInfo.nextTier.name} tier with just ${nextTierInfo.sharesNeeded} more shares!`,
      };
    }

    // Loyal member offer
    if (membershipStatus.totalTransactions >= 5) {
      return {
        isEligible: true,
        offerType: "loyal_member",
        description:
          "Thank you for your loyalty! Enjoy reduced fees on your next purchase.",
      };
    }

    return { isEligible: false };
  }
}
