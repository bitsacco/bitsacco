import { useState, useEffect, useCallback } from "react";
import { DEFAULT_REFRESH_INTERVAL, Currency } from "../types/exchange";
import { kesToSats, satsToKes, btcToFiat } from "../utils/fx";
import type { ApiClient } from "../client/api-client";
import type { QuoteResponse } from "../types/exchange";

export interface UseExchangeRateOptions {
  apiClient: ApiClient;
  refreshInterval?: number;
  currency?: string;
}

export function useExchangeRate({
  apiClient,
  refreshInterval = DEFAULT_REFRESH_INTERVAL,
  currency = "KES",
}: UseExchangeRateOptions) {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBtcRate, setShowBtcRate] = useState(false);

  const fetchQuote = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClient.fx.getQuote(currency);
      setQuote(data);
    } catch (err) {
      console.error("Failed to fetch exchange rate:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch exchange rate",
      );
      // Set a default rate if fetch fails
      setQuote({
        id: "default",
        from: Currency.KES,
        to: Currency.BTC,
        rate: "145000",
        expiry: new Date(Date.now() + DEFAULT_REFRESH_INTERVAL).toISOString(),
      });
    } finally {
      setLoading(false);
    }
  }, [apiClient, currency]);

  useEffect(() => {
    // Fetch quote on mount
    void fetchQuote();

    // Set up auto-refresh
    const intervalId = setInterval(() => {
      void fetchQuote();
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [fetchQuote, refreshInterval]);

  // Convert KES to sats using utility function
  const convertKesToSats = useCallback(
    (kesAmount: number): number => {
      if (!quote) return 0;
      return kesToSats(kesAmount, Number(quote.rate));
    },
    [quote],
  );

  // Convert sats to KES using utility function
  const convertSatsToKes = useCallback(
    (satsAmount: number): number => {
      if (!quote) return 0;
      return satsToKes(satsAmount, Number(quote.rate));
    },
    [quote],
  );

  // Convert BTC to KES using utility function
  const convertBtcToKes = useCallback(
    (btcAmount: number): number => {
      if (!quote) return 0;
      return btcToFiat({
        amountBtc: btcAmount,
        fiatToBtcRate: Number(quote.rate),
      }).amountFiat;
    },
    [quote],
  );

  return {
    quote,
    loading,
    error,
    showBtcRate,
    setShowBtcRate,
    refresh: fetchQuote,
    kesToSats: convertKesToSats,
    satsToKes: convertSatsToKes,
    btcToKes: convertBtcToKes,
    rate: quote ? Number(quote.rate) : null,
  };
}
