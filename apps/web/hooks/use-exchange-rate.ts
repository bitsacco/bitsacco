/**
 * Hook to fetch and manage BTC/KES exchange rate
 */
import { useState, useEffect } from "react";
// import { useApiClient } from "@/lib/api-client-provider"; // No longer needed
import type { ExchangeRateData } from "@bitsacco/core";
import { Currency } from "@bitsacco/core";

export interface UseExchangeRateResult {
  exchangeRate: ExchangeRateData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useExchangeRate(): UseExchangeRateResult {
  // const { client } = useApiClient(); // No longer needed
  const [exchangeRate, setExchangeRate] = useState<ExchangeRateData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExchangeRate = async () => {
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
        // Convert to ExchangeRateData format expected by components
        const quoteData = data.data as any;
        setExchangeRate({
          quote: {
            id: quoteData.id || "default",
            from: Currency.BTC,
            to: Currency.KES,
            rate: String(quoteData.rate || quoteData.value || 0),
            expiry: String(Date.now() + 600000), // 10 minutes from now
            amount: quoteData.amount,
            fee: quoteData.fee,
          },
          loading: false,
          error: null,
        });
      }
    } catch (err) {
      console.error("Failed to fetch exchange rate:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch exchange rate",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchExchangeRate();

    // Refresh exchange rate every 30 seconds
    const interval = setInterval(() => {
      void fetchExchangeRate();
    }, 30000);

    return () => clearInterval(interval);
  }, []); // No dependencies needed since we're using direct API call

  return {
    exchangeRate,
    loading,
    error,
    refetch: fetchExchangeRate,
  };
}
