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

    console.log("[TRANSACTIONS API] Request params:", {
      page,
      size,
      status,
      type,
      startDate,
      endDate,
      userId: session.user.id,
    });

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

    if (response.error) {
      console.error("[TRANSACTIONS API] Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    return NextResponse.json({
      data: response.data,
      error: null,
    });
  } catch (error) {
    console.error("Failed to fetch user shares transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch transactions" },
      { status: 500 },
    );
  }
}
