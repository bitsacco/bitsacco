import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import { ShareValidationService } from "@/lib/validation-service";
import type {
  MembershipTier,
  SharePurchaseValidation,
  SharesOffer,
  UserShareTxsResponse,
} from "@bitsacco/core";

export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { offerId, quantity, paymentMethod } = body;

    if (!offerId || !quantity || quantity <= 0) {
      return NextResponse.json(
        {
          error: "Invalid request parameters",
        },
        { status: 400 },
      );
    }

    // Use local validation service since backend endpoint doesn't exist
    console.log("Using local validation service for share purchase validation");

    try {
      // Try to get offer details from backend first
      let offer: SharesOffer | null = null;

      try {
        const offersResponse = await client.membership.getShareOffers();
        if (offersResponse.data?.offers) {
          offer =
            offersResponse.data.offers.find(
              (o: SharesOffer) => o.id === offerId,
            ) || null;
        }
      } catch (offersError) {
        console.warn("Failed to fetch offers from backend:", offersError);
        // Create a mock offer for validation purposes
        offer = {
          id: offerId,
          quantity: 1000, // Default maximum
          subscribedQuantity: 0,
          availableFrom: "2024-01-01T00:00:00Z",
          createdAt: "2024-01-01T00:00:00Z",
        };
      }

      if (!offer) {
        return NextResponse.json(
          {
            error: "Offer not found",
          },
          { status: 404 },
        );
      }

      // Get user's current share holdings from membership transactions
      let currentShares = 0;
      try {
        const transactionsResponse = await fetch(
          `${req.nextUrl.origin}/api/membership/shares/transactions?size=20`,
          {
            headers: {
              cookie: req.headers.get("cookie") || "",
            },
          },
        );
        if (transactionsResponse.ok) {
          const responseData = await transactionsResponse.json();
          const transactionsData = responseData.data as UserShareTxsResponse;
          console.log(
            "[Validation] User share holdings:",
            transactionsData?.shareHoldings,
          );

          // Use the shareHoldings field directly from the typed response
          currentShares = transactionsData?.shareHoldings || 0;
        }
      } catch (error) {
        console.error("[Validation] Failed to fetch user shares:", error);
        // Continue with 0 shares as fallback
      }

      const user = {
        id: session.user.id,
        kycStatus: "not_required" as const,
        currentShares,
        country: "KE", // Would get from user profile
        registrationDate: "2024-01-01", // Would get from user profile
      };

      // Fetch membership tiers from mock API (TODO: replace with real backend call)
      let tiers: MembershipTier[] = [];
      try {
        const tiersResponse = await fetch(
          `${req.nextUrl.origin}/api/membership/tiers`,
          {
            headers: {
              cookie: req.headers.get("cookie") || "",
            },
          },
        );
        if (tiersResponse.ok) {
          const tiersData = await tiersResponse.json();
          tiers = tiersData.data?.tiers || [];
        }
      } catch (error) {
        console.error(
          "[Validation] Failed to fetch tiers from mock API:",
          error,
        );
      }

      // Perform comprehensive validation
      const validation = await ShareValidationService.validatePurchase(
        user,
        offer,
        quantity,
        tiers,
      );

      // Add payment method validation if provided
      if (paymentMethod) {
        const paymentErrors = ShareValidationService.validatePaymentMethod(
          paymentMethod,
          quantity * 500, // Assuming 500 KES per share
          user.country,
        );
        validation.errors.push(...paymentErrors);
        validation.isValid = validation.isValid && paymentErrors.length === 0;
      }

      return NextResponse.json({
        success: true,
        data: validation,
      });
    } catch (localError) {
      console.error("Local validation failed:", localError);

      // Fallback to basic validation
      const basicValidation: SharePurchaseValidation = {
        isValid: quantity > 0 && quantity <= 1000,
        errors:
          quantity <= 0
            ? [
                {
                  code: "INVALID_QUANTITY",
                  message: "Quantity must be greater than 0",
                  field: "quantity",
                },
              ]
            : [],
        warnings:
          quantity > 100
            ? [
                {
                  code: "LARGE_PURCHASE",
                  message: "Large purchase amount - please confirm",
                  canProceed: true,
                },
              ]
            : [],
        eligibility: {
          canPurchase: true,
          maxQuantity: 1000,
          kycStatus: "not_required",
        },
      };

      return NextResponse.json({
        success: true,
        data: basicValidation,
      });
    }
  } catch (error) {
    console.error("Failed to validate share purchase:", error);
    return NextResponse.json(
      { error: "Failed to validate purchase" },
      { status: 500 },
    );
  }
}
