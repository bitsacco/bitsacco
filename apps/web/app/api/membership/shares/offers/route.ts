import { NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";

export async function GET() {
  console.log("[SHARES-OFFERS API] Request received");

  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session?.user) {
      console.log("[SHARES-OFFERS API] Authentication failed - no client or session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[SHARES-OFFERS API] Making request to backend with authenticated client");
    const response = await client.membership.getShareOffers();

    console.log("[SHARES-OFFERS API] Response received:", {
      hasData: !!response.data,
      hasError: !!response.error,
      dataPreview: response.data ? "Data received" : "No data",
    });

    if (response.error) {
      console.error("[SHARES-OFFERS API] Backend error:", response.error);
      return NextResponse.json({ error: response.error }, { status: 500 });
    }

    return NextResponse.json({
      data: response.data,
      error: null,
    });
  } catch (error) {
    console.error("[SHARES-OFFERS API] Failed to fetch share offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch share offers" },
      { status: 500 },
    );
  }
}
