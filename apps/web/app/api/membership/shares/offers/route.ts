import { NextResponse } from "next/server";
import { createAuthenticatedApiClient } from "@/lib/api-helper";
import type { AllSharesOffers } from "@bitsacco/core";

export async function GET() {
  console.log("[SHARES-OFFERS API] Request received");

  try {
    const { client, session } = await createAuthenticatedApiClient();

    if (!client || !session) {
      console.log(
        "[SHARES-OFFERS API] Authentication failed - no client or session",
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(
      "[SHARES-OFFERS API] Making request to backend with authenticated client",
    );
    const response = await client.membership.getShareOffers();

    console.log("[SHARES-OFFERS API] Response received:", {
      hasData: !!response.data,
      hasError: !!response.error,
      dataPreview: response.data ? "Data received" : "No data",
    });

    // The response might have offers nested, ensure correct structure
    const responseData = response.data as
      | AllSharesOffers
      | { data: AllSharesOffers }
      | null;
    if (
      responseData &&
      !("offers" in responseData) &&
      "data" in responseData &&
      responseData.data?.offers
    ) {
      response.data = responseData.data;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("[SHARES-OFFERS API] Failed to fetch share offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch share offers" },
      { status: 500 },
    );
  }
}
