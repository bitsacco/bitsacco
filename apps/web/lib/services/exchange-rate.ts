import { FxApiClient } from "@bitsacco/core";
import { satsToKes } from "@bitsacco/core";
import type { QuoteResponse } from "@bitsacco/core";

/**
 * Server-side exchange rate service for API routes
 * Handles fetching exchange rates and converting between BTC units and KES
 */
export class ExchangeRateService {
  private static instance: ExchangeRateService;
  private fxClient: FxApiClient;

  private constructor() {
    // Initialize FX client with OS API base URL
    this.fxClient = new FxApiClient({
      baseUrl: process.env.API_URL || "http://localhost:4000",
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
   * Get current BTC/KES exchange rate from API
   */
  public async getExchangeRate(): Promise<{
    rate: number;
    quote: QuoteResponse;
  } | null> {
    try {
      // Fetch fresh quote from API
      const quote = await this.fxClient.getQuote("KES");

      if (!quote) {
        console.error("Failed to fetch exchange rate: API returned null");
        return null;
      }

      // Validate the rate is a positive number
      const rate = Number(quote.rate);
      if (isNaN(rate) || rate <= 0) {
        console.error("Invalid exchange rate received:", quote.rate);
        return null;
      }

      return {
        rate,
        quote,
      };
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      return null;
    }
  }

  /**
   * Convert msats to KES using current exchange rate
   */
  public async msatsToKes(msats: number): Promise<{
    kesAmount: number;
    rate: number;
    satsAmount: number;
  } | null> {
    const result = await this.getExchangeRate();
    if (!result) {
      return null;
    }

    const { rate } = result;

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
  } | null> {
    const result = await this.getExchangeRate();
    if (!result) {
      return null;
    }

    const { rate } = result;

    // Convert sats to KES using the utility function
    const kesAmount = satsToKes(sats, rate);

    return {
      kesAmount: Math.round(kesAmount), // Round to nearest cent
      rate,
    };
  }
}

/**
 * Convenience function to get exchange rate service instance
 */
export const getExchangeRateService = () => ExchangeRateService.getInstance();
