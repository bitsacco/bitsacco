import * as React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", ...props }, ref) => {
    const classes = [
      "flex h-10 w-full rounded-md border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-gray-100",
      "file:border-0 file:bg-transparent file:text-sm file:font-medium",
      "placeholder:text-gray-500",
      "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 focus:border-teal-500",
      "hover:border-slate-500 transition-colors",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return <input type={type} className={classes} ref={ref} {...props} />;
  },
);

Input.displayName = "Input";
