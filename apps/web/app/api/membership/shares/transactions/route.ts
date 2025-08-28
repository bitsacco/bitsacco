import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { SharesTx, UserShareTxsResponse } from "@bitsacco/core";

export async function GET(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "10");

    const response = await client.membership.getUserSharesTxs({
      userId: session.user.id,
      page,
      size,
    });

    console.log(
      "[TRANSACTIONS API] Raw response:",
      JSON.stringify(response, null, 2),
    );

    // Transform the response to match frontend expectations
    if (response.data) {
      // Check if the data has a nested 'shares' structure (from backend)
      type ResponseDataType = UserShareTxsResponse & {
        shares?: UserShareTxsResponse;
        shareHoldings?: number;
      };
      const responseData = response.data as ResponseDataType;
      const sharesData = responseData.shares || responseData;

      // Map status numbers to enum strings (matching SharesTxStatus enum values)
      // Based on the API response, it seems 0 is actually completed shares
      const statusMap: Record<number, string> = {
        0: "completed", // Active/completed shares
        1: "pending", // Pending shares
        2: "cancelled", // Cancelled shares
        3: "failed", // Failed shares
      };

      const typeMap: Record<number, string> = {
        0: "subscription",
        1: "transfer",
        2: "offer",
      };

      // Type for API response that may have numeric status/type
      type ApiSharesTx = Omit<SharesTx, "status" | "type"> & {
        status: number | string;
        type?: number | string;
      };

      // Extract and transform the nested structure
      const transformedData: UserShareTxsResponse & { totalShares?: number } = {
        transactions:
          sharesData.transactions?.map(
            (tx: ApiSharesTx): SharesTx =>
              ({
                ...tx,
                status:
                  typeof tx.status === "number"
                    ? statusMap[tx.status]
                    : tx.status,
                type:
                  typeof tx.type === "number"
                    ? typeMap[tx.type]
                    : tx.type || "subscription",
              }) as SharesTx,
          ) || [],
        page: sharesData.page || 0,
        size: sharesData.size || size,
        pages: sharesData.pages || 1,
        totalCount: sharesData.transactions?.length || 0,
        totalShares: responseData.shareHoldings || 0,
      };

      console.log("[TRANSACTIONS API] Transformed data:", transformedData);

      return NextResponse.json({
        ...response,
        data: transformedData,
      });
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
