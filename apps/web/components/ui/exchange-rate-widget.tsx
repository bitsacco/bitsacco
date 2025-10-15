"use client";

import { formatNumber, btcToFiat } from "@bitsacco/core";
import { useExchangeRate } from "@/lib/hooks/useExchangeRate";
import { apiClient } from "@/lib/auth";
import { ArrowsClockwiseIcon, SpinnerIcon } from "@phosphor-icons/react";

interface ExchangeRateWidgetProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function ExchangeRateWidget({
  className = "",
  size = "md",
}: ExchangeRateWidgetProps) {
  const {
    quote,
    loading: rateLoading,
    showBtcRate,
    setShowBtcRate,
    refresh,
    kesToSats,
  } = useExchangeRate({ apiClient });

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2 text-xs sm:text-sm";
      case "lg":
        return "px-6 py-3 text-base lg:text-lg";
      default:
        return "px-4 py-2.5 text-sm";
    }
  };

  const getIconSize = () => {
    switch (size) {
      case "sm":
        return 14;
      case "lg":
        return 18;
      default:
        return 16;
    }
  };

  return (
    <div className={`flex-shrink-0 w-full sm:w-auto ${className}`}>
      <div
        className={`flex items-center justify-center sm:justify-end space-x-2 bg-slate-800/40 border border-slate-700/50 rounded-lg ${getSizeClasses()}`}
      >
        {rateLoading ? (
          <>
            <SpinnerIcon
              size={getIconSize()}
              className="animate-spin text-teal-400"
            />
            <span className="text-gray-400">Getting rates...</span>
          </>
        ) : (
          <>
            <button
              onClick={() => setShowBtcRate(!showBtcRate)}
              className="underline decoration-dotted underline-offset-[10px] font-medium text-gray-300 hover:text-teal-400 transition-colors"
              disabled={rateLoading}
            >
              {quote
                ? showBtcRate
                  ? `1 BTC = ${formatNumber(btcToFiat({ amountBtc: 1, fiatToBtcRate: Number(quote.rate) }).amountFiat)} KES`
                  : `1 KES = ${formatNumber(kesToSats(1), { decimals: 2 })} sats`
                : "1 KES = -- sats"}
            </button>
            <button
              className="p-1 text-gray-400 hover:text-teal-400 transition-colors"
              onClick={refresh}
              disabled={rateLoading}
              aria-label="Refresh rates"
            >
              <ArrowsClockwiseIcon size={getIconSize()} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
