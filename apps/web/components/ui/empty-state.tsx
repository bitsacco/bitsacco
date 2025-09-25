"use client";

import React from "react";
import { Button } from "@bitsacco/ui";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?:
      | "primary"
      | "secondary"
      | "outline"
      | "ghost"
      | "tealPrimary"
      | "tealOutline"
      | "tealSubmit";
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={[
        "bg-slate-800/40 border border-slate-700 rounded-xl p-12 text-center animate-in fade-in-50 slide-in-from-bottom-4 duration-700",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-teal-500/30">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-100 mb-3">{title}</h3>
      <p className="text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {action && (
        <Button
          variant={action.variant || "tealPrimary"}
          onClick={action.onClick}
          className="shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 hover:scale-[1.02] transition-all duration-300 group"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface CompactEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function CompactEmptyState({
  icon,
  title,
  description,
  className,
}: CompactEmptyStateProps) {
  return (
    <div className={["text-center py-16", className].filter(Boolean).join(" ")}>
      <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
        {icon}
      </div>
      <h4 className="text-xl font-semibold text-gray-100 mb-3">{title}</h4>
      <p className="text-gray-400 max-w-md mx-auto">{description}</p>
    </div>
  );
}
