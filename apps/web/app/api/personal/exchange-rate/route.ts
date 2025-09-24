import { NextResponse } from "next/server";
import { getExchangeRateService } from "@/lib/services/exchange-rate";

// GET /api/personal/exchange-rate - Get current exchange rate information
export async function GET() {
  try {
    const exchangeRateService = getExchangeRateService();

    // Get current exchange rate with metadata
    const { rate, quote, isFromCache } =
      await exchangeRateService.getExchangeRate();
    const cacheStatus = exchangeRateService.getCacheStatus();

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
        isFromCache,
        cacheStatus: {
          hasCachedQuote: cacheStatus.hasCachedQuote,
          isExpired: cacheStatus.isExpired,
          expiresAt: cacheStatus.expiresAt,
        },
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

// POST /api/personal/exchange-rate/refresh - Force refresh the exchange rate cache
export async function POST() {
  try {
    const exchangeRateService = getExchangeRateService();

    // Clear cache to force a fresh fetch
    exchangeRateService.clearCache();

    // Get fresh exchange rate
    const { rate, quote, isFromCache } =
      await exchangeRateService.getExchangeRate();

    return NextResponse.json({
      message: "Exchange rate cache refreshed",
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
        isFromCache,
        refreshedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error refreshing exchange rate:", error);
    return NextResponse.json(
      {
        error: "Failed to refresh exchange rate",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
