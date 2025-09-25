"use client";

import { Button } from "@bitsacco/ui";
import {
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react";

interface ChamaActionsProps {
  hideBalances: boolean;
  onToggleBalances: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function ChamaActions({
  hideBalances,
  onToggleBalances,
  searchQuery,
  onSearchChange,
}: ChamaActionsProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col gap-4">
        {/* Search and Primary Action Row */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlassIcon
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search chamas..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            {/* Hide Balance Button */}
            <Button
              variant="outline"
              size="lg"
              onClick={onToggleBalances}
              className="flex items-center gap-2 !bg-slate-700/50 !text-gray-300 !border-slate-600 hover:!bg-slate-700 hover:!text-gray-200 hover:!border-slate-500"
            >
              {hideBalances ? (
                <EyeIcon size={16} />
              ) : (
                <EyeSlashIcon size={16} />
              )}
              {hideBalances ? "Show Balances" : "Hide Balances"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
