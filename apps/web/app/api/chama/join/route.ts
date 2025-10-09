import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { JoinChamaRequest } from "@bitsacco/core";
import { ChamaMemberRole } from "@bitsacco/core";

export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chamaId } = body;

    // Validate required fields
    if (!chamaId) {
      return NextResponse.json(
        { error: "Chama ID is required" },
        { status: 400 },
      );
    }

    const request: JoinChamaRequest = {
      chamaId,
      memberInfo: {
        userId: session.user.id,
        roles: [ChamaMemberRole.Member], // Default to Member role
      },
    };

    console.log("Joining chama:", request);

    const response = await client.chamas.joinChama(request);

    if (response.error) {
      throw new Error(response.error || "Failed to join chama");
    }

    return NextResponse.json({
      success: true,
      message: "Successfully joined chama",
    });
  } catch (error) {
    console.error("Failed to join chama:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to join chama",
      },
      { status: 500 },
    );
  }
}
