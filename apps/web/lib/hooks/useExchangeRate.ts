/**
 * Web-specific React hooks for exchange rates
 * Uses shared utilities from @bitsacco/core and standard React patterns
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { kesToSats } from "@bitsacco/core";
import type { QuoteResponse } from "@bitsacco/core";

/**
 * Hook to get current exchange rates with additional utilities
 */
export function useExchangeRate({ apiClient }: { apiClient?: unknown } = {}) {
  const [showBtcRate, setShowBtcRate] = useState(true);
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeRate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch BTC to KES exchange rate using API route
      const response = await fetch("/api/personal/exchange-rate");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.data) {
        // Convert to QuoteResponse format expected by components
        const quoteData = data.data as any;
        const quoteResponse: QuoteResponse = {
          id: quoteData.id || "default",
          from: "BTC" as any,
          to: "KES" as any,
          rate: String(quoteData.rate || quoteData.value || 0),
          expiry: String(Date.now() + 600000), // 10 minutes from now
          amount: quoteData.amount,
          fee: quoteData.fee,
        };
        setQuote(quoteResponse);
      } else {
        throw new Error("Failed to fetch exchange rates");
      }
    } catch (err) {
      console.error("Failed to fetch exchange rate:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch exchange rates",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchExchangeRate();

    // Refresh exchange rate every 30 seconds
    const interval = setInterval(() => {
      void fetchExchangeRate();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchExchangeRate]);

  const refresh = useCallback(() => {
    void fetchExchangeRate();
  }, [fetchExchangeRate]);

  const kesToSatsHelper = useCallback(
    (amount: number) => {
      if (quote?.rate) {
        return kesToSats(amount, Number(quote.rate));
      }
      return 0;
    },
    [quote?.rate],
  );

  return {
    quote,
    loading,
    error,
    showBtcRate,
    setShowBtcRate,
    refresh,
    kesToSats: kesToSatsHelper,
    exchangeRate: quote,
    refetch: refresh,
  };
}

/**
 * Hook to get a quote for currency conversion
 */
export function useQuote(
  fromCurrency: string,
  toCurrency: string,
  amount: number,
) {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    if (!amount || amount <= 0) {
      setQuote(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // For now, use the same exchange rate endpoint
      const response = await fetch("/api/personal/exchange-rate");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.data) {
        // Convert to QuoteResponse format expected by components
        const quoteData = data.data as any;
        const quoteResponse: QuoteResponse = {
          id: quoteData.id || "default",
          from: fromCurrency as any,
          to: toCurrency as any,
          rate: String(quoteData.rate || quoteData.value || 0),
          expiry: String(Date.now() + 600000), // 10 minutes from now
          amount: String(amount),
          fee: quoteData.fee,
        };
        setQuote(quoteResponse);
      } else {
        throw new Error("Failed to get quote");
      }
    } catch (err) {
      console.error("Failed to fetch quote:", err);
      setError(err instanceof Error ? err.message : "Failed to get quote");
    } finally {
      setLoading(false);
    }
  }, [fromCurrency, toCurrency, amount]);

  useEffect(() => {
    void fetchQuote();
  }, [fetchQuote]);

  return {
    data: quote,
    isLoading: loading,
    error,
    refetch: fetchQuote,
  };
}
