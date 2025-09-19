import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const chamaId = searchParams.get("chamaId");
    const transactionId = searchParams.get("transactionId");

    if (!chamaId || !transactionId) {
      return NextResponse.json(
        {
          error: "Missing required parameters: chamaId and transactionId",
        },
        { status: 400 },
      );
    }

    // Get specific transaction by ID using the chama client
    const response = await client.chamas.getTransaction(chamaId, transactionId);

    if (!response.data) {
      return NextResponse.json(
        {
          error: "Transaction not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Failed to get chama transaction status:", error);
    return NextResponse.json(
      { error: "Failed to get transaction status" },
      { status: 500 },
    );
  }
}
