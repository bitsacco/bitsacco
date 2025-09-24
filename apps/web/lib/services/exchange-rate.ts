import { FxApiClient, Currency } from "@bitsacco/core";
import { satsToKes } from "@bitsacco/core";
import type { QuoteResponse } from "@bitsacco/core";

/**
 * Server-side exchange rate service for API routes
 * Handles fetching exchange rates and converting between BTC units and KES
 */
export class ExchangeRateService {
  private static instance: ExchangeRateService;
  private fxClient: FxApiClient;
  private cachedQuote: QuoteResponse | null = null;
  private cacheExpiry: Date | null = null;
  private readonly CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    // Initialize FX client with base URL from environment
    this.fxClient = new FxApiClient({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService();
    }
    return ExchangeRateService.instance;
  }

  /**
   * Get current BTC/KES exchange rate with caching
   */
  public async getExchangeRate(): Promise<{
    rate: number;
    quote: QuoteResponse;
    isFromCache: boolean;
  }> {
    try {
      // Check if we have a valid cached quote
      if (
        this.cachedQuote &&
        this.cacheExpiry &&
        new Date() < this.cacheExpiry
      ) {
        return {
          rate: Number(this.cachedQuote.rate),
          quote: this.cachedQuote,
          isFromCache: true,
        };
      }

      // Fetch fresh quote from API
      const quote = await this.fxClient.getQuote("KES");

      // Cache the quote
      this.cachedQuote = quote;
      this.cacheExpiry = new Date(Date.now() + this.CACHE_DURATION_MS);

      return {
        rate: Number(quote.rate),
        quote,
        isFromCache: false,
      };
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);

      // If we have a cached quote, use it even if expired
      if (this.cachedQuote) {
        console.warn("Using expired cached exchange rate due to API failure");
        return {
          rate: Number(this.cachedQuote.rate),
          quote: this.cachedQuote,
          isFromCache: true,
        };
      }

      // Fallback to default rate if no cache available
      const fallbackQuote: QuoteResponse = {
        id: "fallback",
        from: Currency.KES,
        to: Currency.BTC,
        rate: "145000", // Reasonable fallback rate
        expiry: new Date(Date.now() + this.CACHE_DURATION_MS).toISOString(),
      };

      console.warn("Using fallback exchange rate:", fallbackQuote.rate);
      return {
        rate: Number(fallbackQuote.rate),
        quote: fallbackQuote,
        isFromCache: false,
      };
    }
  }

  /**
   * Convert msats to KES using current exchange rate
   */
  public async msatsToKes(msats: number): Promise<{
    kesAmount: number;
    rate: number;
    satsAmount: number;
  }> {
    const { rate } = await this.getExchangeRate();

    // Convert msats to sats first (1 sat = 1000 msats)
    const satsAmount = Math.floor(msats / 1000);

    // Convert sats to KES using the utility function
    const kesAmount = satsToKes(satsAmount, rate);

    return {
      kesAmount: Math.round(kesAmount), // Round to nearest cent
      rate,
      satsAmount,
    };
  }

  /**
   * Convert sats to KES using current exchange rate
   */
  public async satsToKes(sats: number): Promise<{
    kesAmount: number;
    rate: number;
  }> {
    const { rate } = await this.getExchangeRate();

    // Convert sats to KES using the utility function
    const kesAmount = satsToKes(sats, rate);

    return {
      kesAmount: Math.round(kesAmount), // Round to nearest cent
      rate,
    };
  }

  /**
   * Clear cache (useful for testing or manual refresh)
   */
  public clearCache(): void {
    this.cachedQuote = null;
    this.cacheExpiry = null;
  }

  /**
   * Get cache status
   */
  public getCacheStatus(): {
    hasCachedQuote: boolean;
    isExpired: boolean;
    expiresAt: Date | null;
  } {
    return {
      hasCachedQuote: this.cachedQuote !== null,
      isExpired: this.cacheExpiry ? new Date() >= this.cacheExpiry : true,
      expiresAt: this.cacheExpiry,
    };
  }
}

/**
 * Convenience function to get exchange rate service instance
 */
export const getExchangeRateService = () => ExchangeRateService.getInstance();
