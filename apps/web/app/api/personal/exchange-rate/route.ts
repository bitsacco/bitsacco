import { NextResponse } from "next/server";
import { getExchangeRateService } from "@/lib/services/exchange-rate";

// GET /api/personal/exchange-rate - Get current exchange rate information
export async function GET() {
  try {
    const exchangeRateService = getExchangeRateService();

    // Get current exchange rate
    const result = await exchangeRateService.getExchangeRate();

    if (!result) {
      return NextResponse.json(
        { error: "Exchange rate service unavailable" },
        { status: 503 },
      );
    }

    const { rate, quote } = result;

    return NextResponse.json({
      rate,
      currency: "KES",
      quote: {
        id: quote.id,
        from: quote.from,
        to: quote.to,
        rate: quote.rate,
        expiry: quote.expiry,
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch exchange rate",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// POST /api/personal/exchange-rate/refresh - Get fresh exchange rate (no caching)
export async function POST() {
  try {
    const exchangeRateService = getExchangeRateService();

    // Get fresh exchange rate
    const result = await exchangeRateService.getExchangeRate();

    if (!result) {
      return NextResponse.json(
        { error: "Exchange rate service unavailable" },
        { status: 503 },
      );
    }

    const { rate, quote } = result;

    return NextResponse.json({
      message: "Fresh exchange rate retrieved",
      rate,
      currency: "KES",
      quote: {
        id: quote.id,
        from: quote.from,
        to: quote.to,
        rate: quote.rate,
        expiry: quote.expiry,
      },
      metadata: {
        refreshedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch exchange rate",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
