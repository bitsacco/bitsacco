"use client";

interface PhosphorIconProps {
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
}

export interface BitcoinRateDisplayProps {
  loading?: boolean;
  quote?: { rate: string } | null;
  showBtcRate?: boolean;
  onToggleRate?: () => void;
  onRefresh?: () => void;
  kesToSats?: (amount: number) => number;
  formatNumber?: (value: number, options?: { decimals?: number }) => string;
  btcToFiat?: (params: { amountBtc: number; fiatToBtcRate: number }) => {
    amountFiat: number;
  };
  RefreshIcon?: React.ComponentType<PhosphorIconProps>;
  SpinnerIcon?: React.ComponentType<PhosphorIconProps>;
  isDark?: boolean;
}

export function BitcoinRateDisplay({
  loading = false,
  quote,
  showBtcRate = false,
  onToggleRate,
  onRefresh,
  kesToSats,
  formatNumber,
  btcToFiat,
  RefreshIcon,
  SpinnerIcon,
}: BitcoinRateDisplayProps) {
  const handleToggle = () => {
    if (onToggleRate) {
      onToggleRate();
    }
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  const getRateText = () => {
    if (loading) return "Loading...";
    if (!quote) return "1 KES = -- sats";

    if (showBtcRate && btcToFiat && formatNumber) {
      const fiatAmount = btcToFiat({
        amountBtc: 1,
        fiatToBtcRate: Number(quote.rate),
      }).amountFiat;
      return `1 BTC = ${formatNumber(fiatAmount)} KES`;
    }

    if (kesToSats && formatNumber) {
      return `1 KES = ${formatNumber(kesToSats(1), { decimals: 2 })} sats`;
    }

    return "1 KES = -- sats";
  };

  if (loading) {
    return (
      <div className="hidden md:flex items-center justify-center space-x-2">
        {SpinnerIcon ? (
          <SpinnerIcon size={16} className="animate-spin" />
        ) : (
          <div className="w-4 h-4">⟳</div>
        )}
        <span className="text-sm text-gray-500">Getting rates...</span>
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center space-x-2">
      <button
        onClick={handleToggle}
        className="text-sm underline decoration-dotted underline-offset-[10px] font-medium"
        disabled={loading}
      >
        {getRateText()}
      </button>
      <button
        className="p-1"
        onClick={handleRefresh}
        disabled={loading}
        aria-label="Refresh rates"
      >
        {RefreshIcon ? (
          <RefreshIcon size={16} />
        ) : (
          <div className="w-4 h-4">⟳</div>
        )}
      </button>
    </div>
  );
}
