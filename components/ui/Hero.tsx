"use client";

import React from "react";

export interface HeroProps {
  title?: {
    first?: string;
    highlight?: string;
    last?: string;
  };
  badge?: string;
  description?: string;
  buttons?: Array<{
    text: string;
    href: string;
    variant?: "tealPrimary" | "tealOutline";
  }>;
  className?: string;
}

export function Hero({
  title = {
    first: "PLAN",
    highlight: "SAVE",
    last: "GROW",
  },
  badge = "USING BITCOIN",
  description = "Plan your finances. Save towards targets. Grow your finances together with community, friends and family.",
  buttons = [],
  className = "",
}: HeroProps) {
  return (
    <section
      className={`relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-800 via-slate-900 to-slate-800 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-teal-900/10 via-transparent to-slate-900/20" />
      <div className="relative flex min-h-screen items-center justify-center py-10 px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-white sm:text-7xl">
              <span className="flex flex-col sm:block">
                {title.first && (
                  <>
                    <span className="block sm:inline">{title.first}</span>
                    <span className="block text-3xl sm:hidden">·</span>
                    <span className="hidden sm:inline"> · </span>
                  </>
                )}
                {title.highlight && (
                  <>
                    <span className="block text-teal-400 sm:inline">
                      {title.highlight}
                    </span>
                    <span className="block text-3xl sm:hidden">·</span>
                    <span className="hidden sm:inline"> · </span>
                  </>
                )}
                {title.last && (
                  <span className="block sm:inline">{title.last}</span>
                )}
              </span>
            </h1>

            {badge && (
              <div className="mb-8 inline-flex items-center rounded-full bg-slate-700/60 px-4 py-1.5 mt-12">
                <span className="text-sm font-medium text-gray-200">
                  {badge}
                </span>
              </div>
            )}

            {description && (
              <p className="mx-auto mb-12 max-w-2xl text-xl text-gray-300 leading-relaxed">
                {description}
              </p>
            )}

            {buttons.length > 0 && (
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                {buttons.map((button, index) => (
                  <a
                    key={index}
                    href={button.href}
                    className={getButtonClassName(
                      button.variant || "tealPrimary",
                    )}
                  >
                    {button.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function getButtonClassName(variant: "tealPrimary" | "tealOutline") {
  const baseStyles =
    "inline-flex items-center justify-center rounded-lg px-8 py-3 text-lg font-semibold tracking-wide whitespace-nowrap uppercase transition-all";

  if (variant === "tealOutline") {
    return `${baseStyles} border-2 border-teal-500 bg-transparent text-teal-500 hover:bg-teal-500 hover:text-white`;
  }

  return `${baseStyles} bg-teal-500 text-white hover:bg-teal-600`;
}
