import type {
  SharesOffer,
  SharePurchaseValidation,
  ValidationError,
  ValidationWarning,
  UserEligibility,
  MembershipTier,
  ShareValidationRules,
} from "@bitsacco/core";

interface User {
  id: string;
  kycStatus?: "pending" | "approved" | "rejected" | "not_required";
  currentShares?: number;
  membershipTier?: MembershipTier;
  country?: string;
  registrationDate?: string;
}

export class ShareValidationService {
  /**
   * Validate a share purchase attempt
   */
  static async validatePurchase(
    user: User,
    offer: SharesOffer,
    quantity: number,
    tiers: MembershipTier[] = [],
  ): Promise<SharePurchaseValidation> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic quantity validation
    if (quantity <= 0) {
      errors.push({
        code: "INVALID_QUANTITY",
        message: "Quantity must be greater than 0",
        field: "quantity",
      });
    }

    const availableQuantity = offer.quantity - offer.subscribedQuantity;

    if (quantity > (availableQuantity || offer.quantity)) {
      errors.push({
        code: "INSUFFICIENT_SHARES",
        message: `Only ${availableQuantity || offer.quantity} shares available`,
        field: "quantity",
      });
    }

    // Offer availability validation
    const now = new Date();
    const availableFrom = new Date(offer.availableFrom);
    const availableTo = offer.availableTo && new Date(offer.availableTo);

    if (now < availableFrom) {
      errors.push({
        code: "OFFER_NOT_STARTED",
        message: `Offer starts on ${availableFrom.toLocaleDateString()}`,
        field: "offer",
      });
    }

    if (availableTo && now > availableTo) {
      errors.push({
        code: "OFFER_EXPIRED",
        message: `Offer expired on ${availableTo.toLocaleDateString()}`,
        field: "offer",
      });
    }

    // // Apply validation rules if they exist
    // if (offer.validationRules) {
    //   const ruleErrors = this.validateAgainstRules(
    //     user,
    //     offer.validationRules,
    //     quantity,
    //   );
    //   errors.push(...ruleErrors);
    // }

    // User eligibility checks
    const eligibility = this.checkUserEligibility(user, quantity, tiers);

    // Generate warnings for large purchases
    if (quantity > 100) {
      warnings.push({
        code: "LARGE_PURCHASE",
        message:
          "This is a large purchase. Please ensure you have sufficient funds.",
        canProceed: true,
      });
    }

    // Check for first-time buyer
    if (!user.currentShares || user.currentShares === 0) {
      warnings.push({
        code: "FIRST_TIME_BUYER",
        message: "Welcome! This will be your first share purchase.",
        canProceed: true,
      });
    }

    // Check membership tier benefits
    if (
      user.membershipTier &&
      quantity >= user.membershipTier.shareRequirements
    ) {
      warnings.push({
        code: "TIER_UPGRADE_AVAILABLE",
        message: `You're eligible for tier upgrade benefits after this purchase!`,
        canProceed: true,
      });
    }

    return {
      isValid: errors.length === 0 && eligibility.canPurchase,
      errors,
      warnings,
      eligibility,
    };
  }

  /**
   * Validate against specific offer rules
   */
  private static validateAgainstRules(
    user: User,
    rules: ShareValidationRules,
    quantity: number,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Minimum quantity check
    if (quantity < rules.minPurchaseQuantity) {
      errors.push({
        code: "BELOW_MINIMUM",
        message: `Minimum purchase is ${rules.minPurchaseQuantity} shares`,
        field: "quantity",
      });
    }

    // Maximum quantity check
    if (quantity > rules.maxPurchaseQuantity) {
      errors.push({
        code: "ABOVE_MAXIMUM",
        message: `Maximum purchase is ${rules.maxPurchaseQuantity} shares`,
        field: "quantity",
      });
    }

    // KYC requirement check
    if (rules.requiresKyc && user.kycStatus !== "approved") {
      errors.push({
        code: "KYC_REQUIRED",
        message: "KYC verification is required for this purchase",
        field: "kyc",
      });
    }

    // Membership tier requirement
    if (
      rules.membershipTierRequired &&
      (!user.membershipTier ||
        user.membershipTier.level < parseInt(rules.membershipTierRequired))
    ) {
      errors.push({
        code: "TIER_REQUIREMENT",
        message: `Membership tier ${rules.membershipTierRequired} required`,
        field: "membership",
      });
    }

    // Geographic restrictions
    if (
      rules.geographicRestrictions &&
      user.country &&
      rules.geographicRestrictions.includes(user.country)
    ) {
      errors.push({
        code: "GEOGRAPHIC_RESTRICTION",
        message: "This offer is not available in your region",
        field: "geography",
      });
    }

    return errors;
  }

  /**
   * Check user eligibility for share purchases
   */
  private static checkUserEligibility(
    user: User,
    quantity: number,
    tiers: MembershipTier[] = [],
  ): UserEligibility {
    const currentShares = user.currentShares || 0;

    // Calculate maximum quantity based on various factors
    let maxQuantity = 10000; // Default maximum

    // Adjust based on membership tier
    if (user.membershipTier) {
      maxQuantity = Math.min(
        maxQuantity,
        user.membershipTier.shareRequirements * 2,
      );
    }

    // Adjust for new users (limit to 1000 shares for first 30 days)
    if (user.registrationDate) {
      const registrationDate = new Date(user.registrationDate);
      const daysSinceRegistration = Math.floor(
        (Date.now() - registrationDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSinceRegistration < 30) {
        maxQuantity = Math.min(maxQuantity, 1000);
      }
    }

    // Determine if user can purchase
    const canPurchase =
      quantity <= maxQuantity && user.kycStatus !== "rejected" && quantity > 0;

    return {
      canPurchase,
      maxQuantity,
      currentTier: user.membershipTier,
      nextTier: this.calculateNextTier(currentShares + quantity, tiers),
      kycStatus: user.kycStatus || "not_required",
    };
  }

  /**
   * Calculate what tier user would be in with given share count
   */
  private static calculateNextTier(
    shareCount: number,
    tiers: MembershipTier[] = [],
  ): MembershipTier | undefined {
    if (tiers.length === 0) return undefined;

    // Find the highest tier the user qualifies for
    return tiers
      .filter((tier) => shareCount >= tier.shareRequirements)
      .sort((a, b) => b.level - a.level)[0];
  }

  /**
   * Validate payment method compatibility
   */
  static validatePaymentMethod(
    paymentMethod: string,
    amount: number,
    userCountry?: string,
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    switch (paymentMethod) {
      case "mpesa":
        if (userCountry && !["KE", "TZ", "UG"].includes(userCountry)) {
          errors.push({
            code: "PAYMENT_METHOD_UNAVAILABLE",
            message: "M-Pesa is not available in your country",
            field: "paymentMethod",
          });
        }
        if (amount < 10 || amount > 300000) {
          errors.push({
            code: "PAYMENT_AMOUNT_LIMIT",
            message: "M-Pesa payments must be between KES 10 and KES 300,000",
            field: "amount",
          });
        }
        break;

      case "lightning":
        if (amount < 1000) {
          errors.push({
            code: "LIGHTNING_MINIMUM",
            message: "Lightning payments must be at least KES 1,000",
            field: "amount",
          });
        }
        break;

      case "bank_transfer":
        if (amount < 5000) {
          errors.push({
            code: "BANK_MINIMUM",
            message: "Bank transfers must be at least KES 5,000",
            field: "amount",
          });
        }
        break;

      default:
        errors.push({
          code: "UNSUPPORTED_PAYMENT_METHOD",
          message: `Payment method ${paymentMethod} is not supported`,
          field: "paymentMethod",
        });
    }

    return errors;
  }

  /**
   * Get validation summary for display
   */
  static getValidationSummary(validation: SharePurchaseValidation): string {
    if (validation.isValid) {
      return "Purchase validated successfully";
    }

    const errorCount = validation.errors.length;
    const warningCount = validation.warnings.length;

    let summary = "";
    if (errorCount > 0) {
      summary += `${errorCount} error${errorCount > 1 ? "s" : ""}`;
    }
    if (warningCount > 0) {
      if (summary) summary += ", ";
      summary += `${warningCount} warning${warningCount > 1 ? "s" : ""}`;
    }

    return summary || "Validation complete";
  }
}
