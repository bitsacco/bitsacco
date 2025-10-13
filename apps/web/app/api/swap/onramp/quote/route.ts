import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy endpoint for FX rates / onramp quotes
 * GET /api/swap/onramp/quote
 *
 * This allows client-side code to fetch exchange rates without making direct calls to OS API
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const currency = searchParams.get("currency") || "KES";
    const amount = searchParams.get("amount") || "0";

    // Call the OS API
    const apiUrl = process.env.API_URL || "http://localhost:4000";
    const url = `${apiUrl}/swap/onramp/quote?currency=${currency}&amount=${amount}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OS API error:", response.status, errorText);
      return NextResponse.json(
        { error: `OS API returned ${response.status}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Swap onramp quote proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch onramp quote" },
      { status: 500 },
    );
  }
}
