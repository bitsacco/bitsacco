import { NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

// GET /api/lnaddr/my-addresses - Get user's lightning addresses
export async function GET() {
  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Call the backend API
    const response = await client.lightningAddress.getUserLightningAddresses();

    if (response.error) {
      console.error("Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    if (!response.data) {
      return NextResponse.json(
        { error: "No data received from backend" },
        { status: 500 },
      );
    }

    // Return backend response directly
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching lightning addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch lightning addresses" },
      { status: 500 },
    );
  }
}
