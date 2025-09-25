import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { GetMemberProfilesRequest } from "@bitsacco/core";

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

    const request: GetMemberProfilesRequest = {
      chamaId,
    };

    const response = await client.chamas.getMemberProfiles(request);

    if (!response.data) {
      throw new Error("Failed to fetch member profiles");
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Failed to fetch member profiles:", error);
    return NextResponse.json(
      { error: "Failed to fetch member profiles" },
      { status: 500 },
    );
  }
}
