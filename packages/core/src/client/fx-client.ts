import { BaseApiClient } from "./base-client";
import type { QuoteResponse } from "../types/exchange";

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
  ): Promise<QuoteResponse | null> {
    const params = new URLSearchParams({
      currency,
      amount,
    });

    const response = await this.request<QuoteResponse>(
      `/swap/onramp/quote?${params.toString()}`,
      { method: "GET" },
    );

    if (!response.data) {
      return null;
    }

    return response.data;
  }
}
