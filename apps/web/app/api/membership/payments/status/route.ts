import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

/**
 * Get payment status by payment intent ID
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

    // Additional security: ensure paymentIntentId is not too long
    if (paymentIntentId.length > 100) {
      return NextResponse.json(
        { error: "Payment intent ID too long" },
        { status: 400 },
      );
    }

    console.log(
      `[PAYMENT-STATUS] Checking payment status for user ${session.user.id}, payment intent: ${paymentIntentId}`,
    );

    // Use payment history to find the specific payment
    // This is a workaround until getPaymentStatus is implemented in the backend
    const response = await client.membership.getPaymentHistory({
      userId: session.user.id,
      page: 0,
      size: 50, // Get recent payments to search for the specific one
    });

    console.log(`[PAYMENT-STATUS] Retrieved payment history:`, {
      hasData: !!response.data,
      paymentCount: response.data?.payments?.length || 0,
      error: response.error,
    });

    // Handle successful response and search for the specific payment
    if (response.data && !response.error) {
      const payment = response.data.payments.find(
        (p: { id: string }) => p.id === paymentIntentId,
      );

      if (payment) {
        // Return the specific payment as if it came from getPaymentStatus
        return NextResponse.json({
          success: true,
          data: payment,
        });
      } else {
        // Payment not found in recent history
        return NextResponse.json(
          {
            success: false,
            error: "Payment not found",
            code: "PAYMENT_NOT_FOUND",
          },
          { status: 404 },
        );
      }
    }

    // Handle backend errors
    if (response.error) {
      // Handle not found case
      if (response.error.includes("not found")) {
        return NextResponse.json(
          {
            success: false,
            error: "Payment not found",
            code: "PAYMENT_NOT_FOUND",
          },
          { status: 404 },
        );
      }

      // Handle other backend errors
      return NextResponse.json(
        {
          success: false,
          error: response.error || "Failed to retrieve payment status",
          code: "BACKEND_ERROR",
        },
        { status: 500 },
      );
    }

    // Fallback
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected response from backend",
        code: "BACKEND_ERROR",
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("Failed to get payment status:", error);

    // Handle network/timeout errors
    if (error instanceof Error) {
      if (
        error.message.includes("timeout") ||
        error.message.includes("ECONNREFUSED")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "Backend service temporarily unavailable",
            code: "SERVICE_UNAVAILABLE",
          },
          { status: 503 },
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error while checking payment status",
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    );
  }
}
