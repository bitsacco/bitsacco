"use client";

import Link from "next/link";

const variants = {
  tealPrimary:
    "inline-flex items-center justify-center rounded-lg px-8 py-3 bg-teal-500 text-white text-sm font-semibold tracking-wide whitespace-nowrap uppercase transition-all hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-teal-300 disabled:opacity-50",
  tealOutline:
    "inline-flex items-center justify-center rounded-lg px-8 py-3 border-2 border-teal-500 bg-transparent text-teal-500 text-sm font-semibold tracking-wide whitespace-nowrap uppercase transition-all hover:bg-teal-500 hover:text-white disabled:cursor-not-allowed disabled:border-teal-300 disabled:text-teal-300 disabled:opacity-50",
};

export interface NavButtonProps {
  variant?: keyof typeof variants;
  className?: string;
  href?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function NavButton({
  variant = "tealPrimary",
  className,
  href,
  children,
  onClick,
}: NavButtonProps) {
  const baseClassName = `${variants[variant]} ${className || ""}`;

  if (href) {
    return (
      <Link href={href} className={baseClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button className={baseClassName} onClick={onClick}>
      {children}
    </button>
  );
}
