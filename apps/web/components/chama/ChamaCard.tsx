"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@bitsacco/ui";
import type { Chama } from "@bitsacco/core";
import { satsToKes } from "@bitsacco/core";
import { UsersThreeIcon } from "@phosphor-icons/react";
import { formatSats, formatCurrency } from "@/lib/utils/format";

interface ChamaBalances {
  groupBalanceMsats: number;
  memberBalanceMsats: number;
}

interface ExchangeRate {
  rate: string;
}

interface ChamaCardProps {
  chama: Chama;
  balance?: ChamaBalances;
  onDeposit?: () => void;
  hideBalances?: boolean;
  exchangeRate?: ExchangeRate;
}

export function ChamaCard({
  chama,
  balance,
  onDeposit,
  hideBalances,
  exchangeRate,
}: ChamaCardProps) {
  return (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden hover:bg-slate-800/60 transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/20 group h-full flex flex-col min-h-[280px] sm:min-h-[320px] lg:min-h-[340px]">
      {/* Enhanced Header Section */}
      <div className="bg-slate-900/40 border-b border-slate-700/50 p-4 sm:p-5 lg:p-6 relative">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="p-2 sm:p-2.5 lg:p-3 bg-slate-700/50 rounded-lg sm:rounded-xl group-hover:bg-slate-700 transition-colors shadow-sm backdrop-blur-sm flex-shrink-0">
              <UsersThreeIcon
                size={20}
                className="sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-teal-400"
                weight="duotone"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-100 text-base sm:text-lg lg:text-xl truncate">
                {chama.name}
              </h3>
              {/* Description as subtitle */}
              {chama.description && (
                <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                  {chama.description}
                </p>
              )}
            </div>
          </div>
          {/* Members count badge */}
          <span className="text-xs text-gray-300 bg-slate-700/60 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-600/40 flex-shrink-0 font-medium whitespace-nowrap">
            {chama.members.length} member{chama.members.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-4 sm:p-5 lg:p-6 flex-grow flex flex-col">
        {/* Balance section - always show when balance data exists or when hideBalances is true */}
        {(balance || hideBalances) && (
          <div className="mb-4 sm:mb-6 py-3 sm:py-4">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wider font-medium">
                  Group Balance
                </p>
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-100 tracking-tight">
                    {hideBalances
                      ? "•••••"
                      : balance
                        ? formatSats(
                            Math.floor(balance.groupBalanceMsats / 1000),
                          )
                        : "•••••"}
                  </p>
                  {!hideBalances && balance && exchangeRate && (
                    <p className="text-xs sm:text-sm text-gray-400">
                      ≈{" "}
                      {formatCurrency(
                        satsToKes(
                          Math.floor(balance.groupBalanceMsats / 1000),
                          Number(exchangeRate.rate),
                        ),
                      )}
                    </p>
                  )}
                  {hideBalances && (
                    <p className="text-xs sm:text-sm text-gray-400">≈ •••••</p>
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1.5 sm:mb-2 uppercase tracking-wider font-medium">
                  Your Contribution
                </p>
                <div className="space-y-1">
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-teal-300 tracking-tight">
                    {hideBalances
                      ? "•••••"
                      : balance
                        ? formatSats(
                            Math.floor(balance.memberBalanceMsats / 1000),
                          )
                        : "•••••"}
                  </p>
                  {!hideBalances && balance && exchangeRate && (
                    <p className="text-xs sm:text-sm text-gray-400">
                      ≈{" "}
                      {formatCurrency(
                        satsToKes(
                          Math.floor(balance.memberBalanceMsats / 1000),
                          Number(exchangeRate.rate),
                        ),
                      )}
                    </p>
                  )}
                  {hideBalances && (
                    <p className="text-xs sm:text-sm text-gray-400">≈ •••••</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Spacer to push buttons to bottom */}
        <div className="flex-grow"></div>

        {/* Action buttons */}
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant="tealPrimary"
            size="sm"
            fullWidth
            onClick={onDeposit}
            className="text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 font-medium"
          >
            <span className="hidden sm:inline">Deposit Funds</span>
            <span className="sm:hidden">Deposit</span>
          </Button>
          <Link href={`/dashboard/chamas/${chama.id}`} className="w-full">
            <Button
              variant="tealOutline"
              size="sm"
              fullWidth
              className="text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 font-medium"
            >
              <span className="hidden sm:inline">View Details</span>
              <span className="sm:hidden">Details</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
