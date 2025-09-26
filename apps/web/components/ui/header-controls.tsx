"use client";

import {
  ArrowsClockwiseIcon,
  EyeIcon,
  EyeSlashIcon,
  SpinnerIcon,
} from "@phosphor-icons/react";
import { formatNumber, btcToFiat } from "@bitsacco/core";
import { useHideBalances } from "@/hooks/use-hide-balances";
import { Button } from "@bitsacco/ui";

interface HeaderControlsProps {
  /**
   * Exchange rate quote object
   */
  quote: { rate: string } | null | undefined;

  /**
   * Whether rates are currently loading
   */
  rateLoading: boolean;

  /**
   * Whether to show BTC rate (true) or KES to sats rate (false)
   */
  showBtcRate: boolean;

  /**
   * Function to toggle between BTC and KES rates
   */
  onToggleRate: () => void;

  /**
   * Function to refresh the rates
   */
  onRefresh: () => void;

  /**
   * Function to convert KES to sats
   */
  kesToSats: (amount: number) => number;

  /**
   * Additional CSS classes for the container
   */
  className?: string;
}

/**
 * A reusable header controls component that displays Bitcoin/KES exchange rates
 * with optional hide balances toggle. Provides consistent styling and behavior
 * across different pages in the application.
 */
export function HeaderControls({
  quote,
  rateLoading,
  showBtcRate,
  onToggleRate,
  onRefresh,
  kesToSats,
  className = "",
}: HeaderControlsProps) {
  const { hideBalances, toggleHideBalances } = useHideBalances();

  return (
    <div
      className={`flex-shrink-0 flex items-center gap-2 sm:gap-3 ${className}`}
    >
      {/* Bitcoin Rate Display - Compact on mobile */}
      <div className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-slate-800/40 border border-slate-700/50 rounded-lg text-xs sm:text-sm">
        {rateLoading ? (
          <>
            <SpinnerIcon size={14} className="animate-spin text-teal-400" />
            <span className="text-gray-400 hidden sm:inline">
              Getting rates...
            </span>
            <span className="text-gray-400 sm:hidden">...</span>
          </>
        ) : (
          <>
            <button
              onClick={onToggleRate}
              className="underline decoration-dotted underline-offset-[8px] font-medium text-gray-300 hover:text-teal-400 transition-colors truncate"
              disabled={rateLoading}
            >
              {quote
                ? showBtcRate
                  ? `1 BTC = ${formatNumber(btcToFiat({ amountBtc: 1, fiatToBtcRate: Number(quote.rate) }).amountFiat)} KES`
                  : `1 KES = ${formatNumber(kesToSats(1), { decimals: 2 })} sats`
                : "1 KES = -- sats"}
            </button>
            <button
              className="p-0.5 sm:p-1 text-gray-400 hover:text-teal-400 transition-colors flex-shrink-0"
              onClick={onRefresh}
              disabled={rateLoading}
              aria-label="Refresh rates"
            >
              <ArrowsClockwiseIcon size={14} />
            </button>
          </>
        )}
      </div>

      <Button
        variant="outline"
        size="md"
        onClick={toggleHideBalances}
        className={`!bg-slate-700/50 !text-gray-300 !border-slate-600 
    hover:!bg-slate-700 hover:!text-gray-200 hover:!border-slate-500 
    flex items-center justify-center gap-2 transition-all duration-200 ${className}`}
        aria-label={hideBalances ? "Show balances" : "Hide balances"}
      >
        {hideBalances ? <EyeIcon size={16} /> : <EyeSlashIcon size={16} />}
        <span>balances</span>
      </Button>
    </div>
  );
}
