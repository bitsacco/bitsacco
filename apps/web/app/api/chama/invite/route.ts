import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { InviteMembersRequest, ChamaInvite } from "@bitsacco/core";

export async function POST(req: NextRequest) {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { chamaId, invites } = body;

    // Validate required fields
    if (!chamaId || !invites || invites.length === 0) {
      return NextResponse.json(
        { error: "Chama ID and invites are required" },
        { status: 400 },
      );
    }

    // Process invites to ensure they have the correct structure
    const processedInvites: ChamaInvite[] = invites.map(
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

    const request: InviteMembersRequest = {
      chamaId,
      invites: processedInvites,
    };

    console.log("Inviting members to chama:", request);

    const response = await client.chamas.inviteMembers(request);

    if (!response.data) {
      throw new Error("Failed to send invites");
    }

    return NextResponse.json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Failed to invite members:", error);
    return NextResponse.json(
      { error: "Failed to send invitations" },
      { status: 500 },
    );
  }
}
