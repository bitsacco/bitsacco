import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { BulkChamaTxMetaRequest } from "@bitsacco/core";

export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chamaIds, selectMemberIds, skipMemberMeta } = body;

    const request: BulkChamaTxMetaRequest = {
      chamaIds: chamaIds || [],
      selectMemberIds: selectMemberIds || [session.user.id],
      skipMemberMeta: skipMemberMeta || false,
    };

    const response = await client.chamas.getBulkTransactionMeta(request);

    if (!response.data) {
      throw new Error("Failed to fetch chama metadata");
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Failed to fetch chama metadata:", error);
    return NextResponse.json(
      { error: "Failed to fetch chama metadata" },
      { status: 500 },
    );
  }
}
