import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { CreateChamaRequest, ChamaInvite } from "@bitsacco/core";

export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, invites } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Chama name is required" },
        { status: 400 },
      );
    }

    // Process invites to ensure they have the correct structure
    const processedInvites: ChamaInvite[] = (invites || []).map(
      (invite: {
        phoneNumber?: string;
        nostrNpub?: string;
        roles?: number[];
      }) => ({
        phoneNumber: invite.phoneNumber,
        nostrNpub: invite.nostrNpub,
        roles: invite.roles || [0], // Default to Member role
      }),
    );

    const request: CreateChamaRequest = {
      name,
      description,
      members: [
        {
          userId: session.user.id,
          roles: [1], // Admin role for creator
        },
      ],
      invites: processedInvites,
      createdBy: session.user.id,
    };

    console.log("Creating chama:", request);

    const response = await client.chamas.createChama(request);

    if (!response.data) {
      throw new Error("Failed to create chama");
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Failed to create chama:", error);
    return NextResponse.json(
      { error: "Failed to create chama" },
      { status: 500 },
    );
  }
}
