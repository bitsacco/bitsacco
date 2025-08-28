export enum Currency {
  BTC = "BTC",
  KES = "KES",
  USD = "USD",
}

export interface QuoteRequest {
  from: Currency;
  to: Currency;
  amount?: string;
}

export interface QuoteResponse {
  id: string;
  from: Currency;
  to: Currency;
  rate: string;
  expiry: string;
  amount?: string;
  fee?: string;
}

export interface ExchangeRateData {
  quote: QuoteResponse | null;
  loading: boolean;
  error: string | null;
}

// Constants
export const SATS_PER_BTC = 100_000_000;
export const MSATS_PER_BTC = 100_000_000_000;
export const DEFAULT_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
