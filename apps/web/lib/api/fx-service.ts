/**
 * Foreign Exchange service for web application
 * Legacy service file - types updated for compatibility
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseApiClient } from "./base-client";
import type {
  ApiResponse,
  QuoteResponse,
  Currency,
  // ConvertCurrencyRequest, // Not available in core
  // ConvertCurrencyResponse, // Not available in core
  // ExchangeRateHistory, // Not available in core
} from "@bitsacco/core";

export class FxService extends BaseApiClient {
  /**
   * Get current exchange rates
   */
  async getQuoteResponses(
    baseCurrency?: string,
  ): Promise<ApiResponse<QuoteResponse[]>> {
    return this.get<QuoteResponse[]>(
      "/fx/rates",
      baseCurrency ? { base: baseCurrency } : {},
    );
  }

  /**
   * Get exchange rate for specific currency pair
   */
  async getQuoteResponse(
    from: string,
    to: string,
  ): Promise<ApiResponse<QuoteResponse>> {
    return this.get<QuoteResponse>(`/fx/rates/${from}/${to}`);
  }

  /**
   * Get historical exchange rates
   */
  async getExchangeRateHistory(
    from: string,
    to: string,
    params?: {
      period?: "1h" | "1d" | "1w" | "1m" | "3m" | "6m" | "1y";
      limit?: number;
    },
  ): Promise<ApiResponse<unknown[]>> {
    return this.get<unknown[]>(`/fx/rates/${from}/${to}/history`, params);
  }

  /**
   * Convert currency amounts
   */
  async convertCurrency(request: unknown): Promise<ApiResponse<unknown>> {
    return this.post<unknown>("/fx/convert", request);
  }

  /**
   * Get list of supported currencies
   */
  async getSupportedCurrencies(): Promise<ApiResponse<Currency[]>> {
    return this.get<Currency[]>("/fx/currencies");
  }

  /**
   * Subscribe to real-time exchange rate updates
   * Returns a WebSocket URL for real-time updates
   */
  async subscribeToRates(
    pairs: Array<{ from: string; to: string }>,
  ): Promise<ApiResponse<{ websocketUrl: string; subscriptionId: string }>> {
    return this.post<{ websocketUrl: string; subscriptionId: string }>(
      "/fx/subscribe",
      { pairs },
    );
  }

  /**
   * Unsubscribe from real-time updates
   */
  async unsubscribeFromRates(
    subscriptionId: string,
  ): Promise<ApiResponse<void>> {
    return this.delete<void>(`/fx/subscribe/${subscriptionId}`);
  }
}
