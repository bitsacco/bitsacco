import Link from "next/link";
import * as React from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "tealPrimary"
  | "tealOutline"
  | "tealSubmit";

export interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export type ButtonProps = BaseButtonProps &
  (
    | (React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
    | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
  );

export const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  ButtonProps
>((props, ref) => {
  const {
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    className = "",
    children,
    ...restProps
  } = props;

  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const variantClasses = {
    primary:
      "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500",
    secondary:
      "bg-purple-500 text-white hover:bg-purple-600 focus:ring-purple-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
    tealPrimary:
      "bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500 font-semibold uppercase tracking-wide",
    tealOutline:
      "border-2 border-teal-500 bg-transparent text-teal-500 hover:bg-teal-500 hover:text-white focus:ring-teal-500 font-semibold uppercase tracking-wide",
    tealSubmit: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const loadingSpinner = loading && (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  // If href is provided and not empty, render as Link
  if ("href" in props && props.href && props.href.trim() !== "") {
    const { href, ...linkProps } =
      restProps as React.AnchorHTMLAttributes<HTMLAnchorElement>;
    return (
      <Link
        href={href as string}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={classes}
        {...linkProps}
      >
        {loadingSpinner}
        {children}
      </Link>
    );
  }

  // Otherwise render as button
  const { disabled, ...buttonProps } =
    restProps as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      className={classes}
      disabled={disabled || loading}
      {...buttonProps}
    >
      {loadingSpinner}
      {children}
    </button>
  );
});

Button.displayName = "Button";
