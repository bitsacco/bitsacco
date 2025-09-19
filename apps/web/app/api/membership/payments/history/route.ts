import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { GetPaymentHistoryRequest } from "@bitsacco/core";
import { PaymentMethod, PaymentStatus } from "@bitsacco/core";

export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // Parse query parameters
    const userId = searchParams.get("userId") || session.user.id;
    const status = searchParams.get("status") as PaymentStatus | undefined;
    const method = searchParams.get("method") as PaymentMethod | undefined;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!)
      : 0;
    const size = searchParams.get("size")
      ? parseInt(searchParams.get("size")!)
      : 10;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    // Validate pagination parameters
    if (page < 0 || size < 1 || size > 100) {
      return NextResponse.json(
        {
          error:
            "Invalid pagination parameters. Page must be >= 0, size must be between 1-100",
        },
        { status: 400 },
      );
    }

    // Validate date format if provided
    if (startDate && !isValidISODate(startDate)) {
      return NextResponse.json(
        {
          error:
            "Invalid startDate format. Use ISO 8601 format (e.g., 2023-01-01T00:00:00Z)",
        },
        { status: 400 },
      );
    }

    if (endDate && !isValidISODate(endDate)) {
      return NextResponse.json(
        {
          error:
            "Invalid endDate format. Use ISO 8601 format (e.g., 2023-01-01T23:59:59Z)",
        },
        { status: 400 },
      );
    }

    // Only allow users to access their own payment history unless they're admin
    if (userId !== session.user.id && !isUserAdmin(session)) {
      return NextResponse.json(
        { error: "You can only access your own payment history" },
        { status: 403 },
      );
    }

    const request: GetPaymentHistoryRequest = {
      userId,
      status,
      method,
      page,
      size,
      startDate,
      endDate,
    };

    console.log(
      `[PAYMENT-HISTORY] Fetching payment history for user ${userId}`,
      {
        status,
        method,
        page,
        size,
        startDate,
        endDate,
      },
    );

    // Call the membership client's get payment history method
    const response = await client.membership.getPaymentHistory(request);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to retrieve payment history:", error);
    return NextResponse.json(
      { error: "Failed to retrieve payment history" },
      { status: 500 },
    );
  }
}

/**
 * Utility function to validate ISO date format
 */
function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);
  return (
    date instanceof Date && !isNaN(date.getTime()) && dateString.includes("T")
  );
}

/**
 * Check if user has admin privileges
 * This would typically check against user roles or permissions
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isUserAdmin(_session: unknown): boolean {
  // TODO: Implement proper admin role checking
  // For now, return false to restrict access to own records only
  return false;
}
