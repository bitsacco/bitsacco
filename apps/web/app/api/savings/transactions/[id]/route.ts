import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

// GET /api/savings/transactions/[id] - Get specific transaction
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: transactionId } = await params;

    // In production, this would fetch the transaction from the backend
    // For now, return mock data
    const mockTransaction = {
      id: transactionId,
      walletId: "wallet-1",
      type: "deposit",
      status: "completed",
      amountSats: 85470,
      amountFiat: 5000,
      currency: "KES",
      paymentMethod: "mpesa",
      paymentReference: "MPE123456789",
      mpesaCheckoutRequestId: "ws_CO_123456789",
      metadata: {},
      createdAt: new Date("2024-09-20T10:30:00Z"),
      updatedAt: new Date("2024-09-20T10:32:00Z"),
      completedAt: new Date("2024-09-20T10:32:00Z"),
    };

    return NextResponse.json(mockTransaction);
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction" },
      { status: 500 },
    );
  }
}
