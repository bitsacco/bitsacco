import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

// GET /api/personal/transactions - Get transaction history
export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get("walletId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type"); // 'deposit' | 'withdraw'
    const status = searchParams.get("status"); // 'pending' | 'completed' | etc.
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build query parameters
    const query: Record<string, string | number> = {
      page,
      limit,
    };

    if (walletId) query.walletId = walletId;
    if (type) query.type = type;
    if (status) query.status = status;
    if (startDate) query.startDate = startDate;
    if (endDate) query.endDate = endDate;

    // Call the backend API
    const response = await client.personal.getTransactionHistory(
      session.user.id,
      query,
    );

    if (response.error) {
      console.error("Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    if (!response.data) {
      return NextResponse.json(
        { error: "No data received from backend" },
        { status: 500 },
      );
    }

    // Return backend response directly without transformation
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}
