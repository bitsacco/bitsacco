import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { ChamaTxsFilterRequest } from "@bitsacco/core";

export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const chamaId = searchParams.get("chamaId");
    const memberId = searchParams.get("memberId");
    const page = parseInt(searchParams.get("page") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);

    const request: ChamaTxsFilterRequest = {
      chamaId: chamaId || undefined,
      memberId: memberId || undefined,
      pagination: { page, size },
    };

    const response = await client.chamas.getTransactions(request);

    if (!response.data) {
      throw new Error("Failed to fetch chama transactions");
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Failed to fetch chama transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch chama transactions" },
      { status: 500 },
    );
  }
}
