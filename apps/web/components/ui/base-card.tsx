"use client";

import React from "react";

interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  clickable?: boolean;
  onClick?: () => void;
  gradient?: boolean;
}

export function BaseCard({
  children,
  className,
  hover = true,
  clickable = false,
  onClick,
  gradient = false,
}: BaseCardProps) {
  const Component = clickable ? "button" : "div";

  return (
    <Component
      onClick={clickable ? onClick : undefined}
      className={[
        "bg-slate-800/40 backdrop-blur-sm border border-slate-700 rounded-xl p-6",
        hover &&
          "hover:bg-slate-800/60 transition-all duration-300 hover:border-slate-600 hover:shadow-lg hover:shadow-slate-900/20 group",
        clickable &&
          "hover:border-teal-500/50 focus:outline-none focus:ring-2 focus:ring-teal-500/50",
        gradient && "bg-gradient-to-br from-slate-800/40 to-slate-900/40",
        "h-full flex flex-col min-h-[320px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Component>
  );
}

interface CreateCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  className?: string;
}

export function CreateCard({
  title,
  description,
  icon,
  onClick,
  className,
}: CreateCardProps) {
  return (
    <button
      onClick={onClick}
      className={[
        "bg-slate-800/20 border-2 border-dashed border-slate-600/60 rounded-xl p-6 hover:bg-slate-800/40 hover:border-slate-500/80 transition-all duration-300 hover:shadow-lg hover:shadow-slate-900/20 group h-full flex flex-col min-h-[320px] w-full text-left hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-teal-500/50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Content Container */}
      <div className="flex flex-col items-center justify-center flex-1 space-y-6">
        {/* Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-slate-600/20 to-slate-500/20 rounded-xl flex items-center justify-center border border-dashed border-slate-500/40 group-hover:from-teal-500/20 group-hover:to-blue-500/20 group-hover:border-teal-500/50 group-hover:border-solid transition-all duration-300 group-hover:scale-110">
          {icon}
        </div>

        {/* Text Content */}
        <div className="text-center space-y-3">
          <h3 className="font-semibold text-gray-300 text-lg group-hover:text-gray-100 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-gray-500 group-hover:text-gray-400 transition-colors duration-300 max-w-48 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Subtle indicator */}
        <div className="w-12 h-1 bg-gradient-to-r from-slate-500/30 to-slate-400/30 rounded-full group-hover:from-teal-500/60 group-hover:to-blue-500/60 transition-all duration-300"></div>
      </div>
    </button>
  );
}
