import { NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

export async function GET() {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call the real OS API for membership tiers
    const response = await client.membership.getMembershipTiers();

    if (response.error) {
      console.error("Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        tiers: response.data || [],
      },
    });
  } catch (error) {
    console.error("Failed to fetch membership tiers:", error);
    return NextResponse.json(
      { error: "Failed to fetch membership tiers" },
      { status: 500 },
    );
  }
}
