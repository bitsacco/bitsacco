import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { OfferSharesRequest } from "@bitsacco/core";
import { SharesTxStatus } from "@bitsacco/core";

export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      quantity: number;
      pricePerShare?: number;
      availableDays?: number;
    };

    // TODO: Implement comprehensive share listing API
    // Current implementation needs enhancement:
    // - Validate user owns sufficient shares before listing
    // - Check if shares are already listed or locked in other transactions
    // - Implement pricing validation (min/max price constraints)
    // - Add listing fees calculation
    // - Create marketplace visibility controls
    // - Track listing performance metrics
    // - Handle partial sales and auto-delisting
    // - Integrate with notification system for listing status updates
    // - Add listing categories (immediate sale, auction-style, etc.)

    const now = new Date();
    const availableTo = new Date();
    availableTo.setDate(availableTo.getDate() + (body.availableDays || 30));

    const request: OfferSharesRequest = {
      quantity: body.quantity,
      availableFrom: now.toISOString(),
      availableTo: availableTo.toISOString(),
    };

    const response = await client.membership.offerShares(request);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to list shares:", error);
    return NextResponse.json(
      { error: "Failed to list shares" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const offerId = searchParams.get("offerId");

    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 },
      );
    }

    // Cancel the listing by updating its status
    const response = await client.membership.updateSharesTx({
      sharesId: offerId,
      updates: {
        status: SharesTxStatus.FAILED,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to cancel listing:", error);
    return NextResponse.json(
      { error: "Failed to cancel listing" },
      { status: 500 },
    );
  }
}
