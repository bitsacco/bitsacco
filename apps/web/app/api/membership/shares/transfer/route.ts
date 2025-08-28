import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { TransferSharesRequest } from "@bitsacco/core";

export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const request: TransferSharesRequest = {
      ...body,
      fromUserId: session.user.id,
    };

    const response = await client.membership.transferShares(request);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to transfer shares:", error);
    return NextResponse.json(
      { error: "Failed to transfer shares" },
      { status: 500 },
    );
  }
}
