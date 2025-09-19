import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");
    const status = searchParams.get("status") || undefined;
    const type = searchParams.get("type") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const response = await client.membership.getUserSharesTxs({
      userId: session.user.id,
      pagination: {
        page,
        size,
        status: status as string | undefined,
        type: type as string | undefined,
        startDate,
        endDate,
      },
    });

    console.log("[TRANSACTIONS API] Raw response structure:", {
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
      responseKeys: Object.keys(response),
    });
    console.log(
      "[TRANSACTIONS API] Raw response:",
      JSON.stringify(response, null, 2),
    );

    // Return the response with minimal transformation
    if (response.data) {
      console.log(
        "[TRANSACTIONS API] Returning response data as-is for debugging:",
        response.data,
      );

      // Return the response faithfully without complex transformations
      return NextResponse.json(response);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch user shares transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}
