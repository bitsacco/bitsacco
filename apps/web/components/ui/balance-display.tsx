"use client";

import React from "react";
import { satsToKes } from "@bitsacco/core";
import { formatSats, formatCurrency } from "@/lib/utils/format";

interface ExchangeRate {
  rate: string;
}

interface BalanceDisplayProps {
  /** Balance value in millisats */
  balanceMsats: number;
  /** Label for the balance (e.g., "Group Balance", "Your Contribution") */
  label: string;
  /** Whether to hide the balance values */
  hideBalances?: boolean;
  /** Exchange rate for KES conversion */
  exchangeRate?: ExchangeRate;
  /** Text color class for the primary balance value */
  textColor?: string;
  /** Size variant for different contexts */
  size?: "sm" | "md" | "lg";
  /** Configuration options */
  config?: {
    /** Whether to center the content */
    centered?: boolean;
  };
}

export function BalanceDisplay({
  balanceMsats,
  label,
  hideBalances = false,
  exchangeRate,
  textColor = "text-gray-100",
  size = "md",
  config,
}: BalanceDisplayProps) {
  const sats = Math.floor(balanceMsats / 1000);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          label: "text-xs",
          primary: "text-sm font-semibold",
          secondary: "text-xs",
        };
      case "md":
        return {
          label:
            "text-xs text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wider font-medium",
          primary: "text-lg sm:text-xl lg:text-2xl font-bold tracking-tight",
          secondary: "text-xs sm:text-sm text-gray-400",
        };
      case "lg":
        return {
          label: "text-sm text-gray-400 mb-1",
          primary: "text-3xl font-bold",
          secondary: "text-sm text-gray-400 mt-1",
        };
      default:
        return {
          label:
            "text-xs text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wider font-medium",
          primary: "text-lg sm:text-xl lg:text-2xl font-bold tracking-tight",
          secondary: "text-xs sm:text-sm text-gray-400",
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const centered = config?.centered ?? false; // Default to centered

  return (
    <div className={centered ? "text-center" : ""}>
      <p className={sizeClasses.label}>{label}</p>
      <div className="space-y-1">
        <p className={`${sizeClasses.primary} ${textColor}`}>
          {hideBalances ? "•••••" : formatSats(sats)}
        </p>
        {!hideBalances && exchangeRate && (
          <p className={sizeClasses.secondary}>
            ≈ {formatCurrency(satsToKes(sats, Number(exchangeRate.rate)))}
          </p>
        )}
        {hideBalances && exchangeRate && (
          <p className={sizeClasses.secondary}>≈ •••••</p>
        )}
      </div>
    </div>
  );
}
