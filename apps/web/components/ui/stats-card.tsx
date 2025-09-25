"use client";

import React from "react";

interface StatItem {
  label: string;
  value: string | number;
  className?: string;
}

interface StatsCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  stats: StatItem[];
  className?: string;
  badge?: {
    value: string | number;
    label: string;
    className?: string;
  };
  toggle?: {
    label: string;
    isActive: boolean;
    onToggle: () => void;
    activeText: string;
    inactiveText: string;
  };
}

export function StatsCard({
  title,
  description,
  icon,
  stats,
  className,
  badge,
  toggle,
}: StatsCardProps) {
  // Dynamic column count based on stats length
  const getGridCols = () => {
    const count = stats.length;
    if (count <= 2) return "grid-cols-1 sm:grid-cols-2";
    if (count <= 3) return "grid-cols-1 sm:grid-cols-3";
    return "grid-cols-2 lg:grid-cols-4";
  };
  return (
    <div
      className={[
        "mb-8 bg-gradient-to-r from-teal-900/30 to-blue-900/30 border border-teal-700/50 rounded-xl p-6 sm:p-8",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-6">
        {/* Header with icon and badge */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="w-14 h-14 bg-teal-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-100">
                  {title}
                </h2>
                <p className="text-gray-400">{description}</p>
              </div>
              {/* Badge and Toggle aligned to the right */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                {toggle && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {toggle.label}:
                    </span>
                    <button
                      onClick={toggle.onToggle}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        toggle.isActive
                          ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                          : "bg-slate-700/50 text-gray-400 border-slate-600/40 hover:bg-slate-700 hover:text-gray-300"
                      }`}
                    >
                      {toggle.isActive
                        ? toggle.activeText
                        : toggle.inactiveText}
                    </button>
                  </div>
                )}
                {badge && (
                  <div className="flex justify-center sm:justify-end">
                    <div
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold border backdrop-blur-sm ${badge.className || "bg-amber-500/20 text-amber-300 border-amber-500/40"}`}
                    >
                      <span className="block sm:hidden">{badge.value}</span>
                      <span className="hidden sm:block">
                        {badge.value} {badge.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={`grid gap-6 ${getGridCols()}`}>
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-sm text-gray-400 mb-1">{stat.label}</p>
              <p
                className={`text-2xl font-bold ${stat.className || "text-gray-100"}`}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface CompactStatsCardProps {
  stats: StatItem[];
  className?: string;
  columns?: 2 | 3 | 4;
}

export function CompactStatsCard({
  stats,
  className,
  columns = 4,
}: CompactStatsCardProps) {
  return (
    <div
      className={["bg-slate-900/50 rounded-lg p-4 mb-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          "grid gap-4",
          columns === 2 && "grid-cols-2",
          columns === 3 && "grid-cols-3",
          columns === 4 && "grid-cols-2 lg:grid-cols-4",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p
              className={`text-lg font-bold ${stat.className || "text-gray-100"}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
