"use client";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";

interface ChamaActionsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export function ChamaActions({
  searchQuery,
  onSearchChange,
  placeholder,
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
              placeholder={placeholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
