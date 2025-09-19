import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import { INTERNAL_CHAMA_ID, SHARE_VALUE_KES } from "@/lib/config";
import type { SubscribeSharesRequest } from "@bitsacco/core";

export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { offerId, quantity } = body;

    // Validate required fields
    if (!offerId || !quantity || quantity <= 0) {
      return NextResponse.json(
        {
          error: "Invalid request parameters",
        },
        { status: 400 },
      );
    }

    // STEP 1: Create share subscription FIRST (matching webapp implementation)
    // Reference: /home/okj/bitsacco/webapp/src/pages/Membership.tsx:225-233
    const subscriptionRequest: SubscribeSharesRequest = {
      userId: session.user.id,
      offerId,
      quantity,
      // Remove payment fields - they belong in separate payment step
    };

    const subscriptionResponse =
      await client.membership.subscribeShares(subscriptionRequest);

    if (!subscriptionResponse.data?.shares?.transactions?.[0]) {
      throw new Error("Invalid subscription response - no transaction created");
    }

    const shareTransaction = subscriptionResponse.data.shares.transactions[0];
    const totalAmount = quantity * SHARE_VALUE_KES;

    // STEP 2: Return subscription data and payment target info for chama deposit
    // Reference: /home/okj/bitsacco/webapp/src/components/modal/SharesTxModal.tsx:78-92
    return NextResponse.json({
      success: true,
      data: {
        subscription: subscriptionResponse.data,
        paymentTarget: {
          chamaId: INTERNAL_CHAMA_ID,
          amount: totalAmount,
          reference: `Share subscription : (${quantity} shares)`,
          sharesSubscriptionTracker: shareTransaction.id,
          shareTransaction,
        },
      },
    });
  } catch (error) {
    console.error("Failed to subscribe to shares:", error);
    return NextResponse.json(
      { error: "Failed to subscribe to shares" },
      { status: 500 },
    );
  }
}
