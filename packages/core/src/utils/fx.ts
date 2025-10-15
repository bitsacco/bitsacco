/**
 * Pure exchange rate and currency conversion utilities
 * Platform-agnostic functions that can be used by web and mobile
 */

import { SATS_PER_BTC, MSATS_PER_BTC } from "../types";

/**
 * Convert fiat to Bitcoin
 */
export function fiatToBtc({
  amountFiat,
  btcToFiatRate,
}: {
  amountFiat: number;
  btcToFiatRate: number;
}): {
  amountBtc: number;
  amountSats: number;
  amountMsats: number;
} {
  const amountBtc = amountFiat / btcToFiatRate;
  // First calculate millisats and ensure it's a whole number
  const amountMsats = Math.floor(amountBtc * MSATS_PER_BTC);
  // Then derive sats and btc from the whole millisats
  const amountSats = Math.floor(amountMsats / 1000);
  const amountBtcFinal = amountMsats / MSATS_PER_BTC;

  return {
    amountBtc: amountBtcFinal,
    amountSats,
    amountMsats,
  };
}

/**
 * Convert Bitcoin to fiat
 */
export function btcToFiat({
  amountBtc,
  amountSats,
  amountMsats,
  fiatToBtcRate,
}: {
  amountBtc?: number;
  amountSats?: number;
  amountMsats?: number;
  fiatToBtcRate: number;
}): {
  amountFiat: number;
} {
  let btcAmount: number;

  if (amountBtc !== undefined) {
    btcAmount = amountBtc;
  } else if (amountSats !== undefined) {
    btcAmount = amountSats / SATS_PER_BTC;
  } else if (amountMsats !== undefined) {
    btcAmount = amountMsats / MSATS_PER_BTC;
  } else {
    throw new Error(
      "One of amountBtc, amountSats, or amountMsats must be provided",
    );
  }

  const amountFiat = btcAmount * fiatToBtcRate;

  return { amountFiat };
}

/**
 * Convert KES to sats
 */
export function kesToSats(kesAmount: number, btcToKesRate: number): number {
  if (isNaN(btcToKesRate) || btcToKesRate <= 0) {
    throw new Error("Exchange rate must be a positive number");
  }

  if (kesAmount < 0) {
    throw new Error("KES amount must be non-negative");
  }

  const btcAmount = kesAmount / btcToKesRate;
  return Math.floor(btcAmount * SATS_PER_BTC);
}

/**
 * Convert sats to KES
 */
export function satsToKes(satsAmount: number, btcToKesRate: number): number {
  if (isNaN(btcToKesRate) || btcToKesRate <= 0) {
    throw new Error("Exchange rate must be a positive number");
  }

  if (satsAmount < 0) {
    throw new Error("Sats amount must be non-negative");
  }

  const btcAmount = satsAmount / SATS_PER_BTC;
  return btcAmount * btcToKesRate;
}

/**
 * Format number for display
 */
export function formatNumber(
  num: number,
  options?: {
    decimals?: number;
    locale?: string;
  },
): string {
  const { decimals = 2, locale = "en-US" } = options || {};

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
}
