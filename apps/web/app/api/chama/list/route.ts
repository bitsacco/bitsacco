import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { FilterChamasRequest } from "@bitsacco/core";

export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      console.error("No client or session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const memberId = searchParams.get("memberId") || session.user.id;

    const request: FilterChamasRequest = {
      memberId,
      pagination: { page, size },
    };

    console.log("Fetching chamas with request:", request);
    const response = await client.chamas.filterChamas(request);
    console.log("API response:", response);

    // Check if response has error
    if (response.error) {
      console.error("API returned error:", response.error);
      throw new Error(response.error || "API request failed");
    }

    // If no data, return empty list instead of throwing error
    if (!response.data) {
      console.log("No chama data found, returning empty list");
      return NextResponse.json({
        success: true,
        data: {
          chamas: [],
          page: page,
          size: size,
          pages: 0,
          total: 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Failed to fetch chamas - full error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch chamas";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
