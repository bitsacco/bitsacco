import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { FindChamaRequest } from "@bitsacco/core";

export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const chamaId = searchParams.get("chamaId");

    if (!chamaId) {
      return NextResponse.json(
        { error: "Chama ID is required" },
        { status: 400 },
      );
    }

    const request: FindChamaRequest = {
      chamaId,
    };

    const response = await client.chamas.getChama(request);

    // Handle API error response
    if (response.error) {
      console.error("API returned error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 404 });
    }

    // Handle missing data (should not happen if no error, but defensive)
    if (!response.data) {
      console.warn("API returned no data and no error for chama:", chamaId);
      return NextResponse.json({ error: "Chama not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Failed to fetch chama details:", error);
    return NextResponse.json(
      { error: "Failed to fetch chama details" },
      { status: 500 },
    );
  }
}
