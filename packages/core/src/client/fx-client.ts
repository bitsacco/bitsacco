import { BaseApiClient } from "./base-client";
import { Currency, type QuoteResponse } from "../types/exchange";

/**
 * FX API client for exchange rate operations
 */
export class FxApiClient extends BaseApiClient {
  /**
   * Get exchange rate quote
   */
  async getQuote(
    currency: string = "KES",
    amount: string = "0",
  ): Promise<QuoteResponse> {
    const params = new URLSearchParams({
      currency,
      amount,
    });

    const response = await this.request<QuoteResponse>(
      `/swap/onramp/quote?${params.toString()}`,
      { method: "GET" },
    );

    if (!response.data) {
      // Return a default quote if the API fails
      return {
        id: "default",
        from: Currency.KES,
        to: Currency.BTC,
        rate: "145000",
        expiry: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      };
    }

    return response.data;
  }
}
