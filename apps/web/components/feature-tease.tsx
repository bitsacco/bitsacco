"use client";

import { ReactNode } from "react";

interface FeatureTeaseProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onClick?: () => void;
}

export function FeatureTease({
  icon,
  title,
  description,
  actionText = "Coming Soon",
  onClick,
}: FeatureTeaseProps) {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
        {icon || <div className="w-8 h-8 bg-gray-500/50 rounded" />}
      </div>
      <h4 className="text-xl font-semibold text-gray-100 mb-3">{title}</h4>
      <p className="text-gray-400 max-w-md mx-auto mb-6">{description}</p>
      {onClick && (
        <button
          onClick={onClick}
          className="px-6 py-2 bg-slate-700/50 text-gray-300 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
