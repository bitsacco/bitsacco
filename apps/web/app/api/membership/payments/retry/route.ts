import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { RetryPaymentRequest } from "@bitsacco/core";

export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { paymentIntentId, reason } = body;

    // Validate required fields
    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 },
      );
    }

    // Validate that the payment intent ID is a valid format
    const isValidId =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$|^[a-zA-Z0-9_-]+$/.test(
        paymentIntentId,
      );
    if (!isValidId) {
      return NextResponse.json(
        { error: "Invalid payment intent ID format" },
        { status: 400 },
      );
    }

    const request: RetryPaymentRequest = {
      paymentIntentId,
      reason: reason || "Manual retry requested",
    };

    console.log(
      `[PAYMENT-RETRY] Retrying payment for user ${session.user.id}, payment intent: ${paymentIntentId}`,
    );

    // Call the membership client's retry payment method
    const response = await client.membership.retryPayment(request);

    console.log(
      `[PAYMENT-RETRY] Successfully initiated retry for payment intent: ${paymentIntentId}`,
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to retry payment:", error);
    return NextResponse.json(
      { error: "Failed to retry payment" },
      { status: 500 },
    );
  }
}

/**
 * Get retry information for a payment (e.g., retry count, last retry date)
 */
export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const paymentIntentId = searchParams.get("paymentIntentId");

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 },
      );
    }

    // TODO: Implement retry information retrieval via backend API
    // For now, return a placeholder response
    return NextResponse.json(
      {
        error: "Retry information endpoint not yet implemented in backend API",
      },
      { status: 501 },
    );
  } catch (error) {
    console.error("Failed to get retry information:", error);
    return NextResponse.json(
      { error: "Failed to get retry information" },
      { status: 500 },
    );
  }
}
