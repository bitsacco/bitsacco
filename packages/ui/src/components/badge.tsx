import * as React from "react";

type BadgeVariant =
  | "default"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "destructive"
  | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ variant = "default", className = "", children, ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantClasses = {
      default:
        "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30",
      secondary:
        "bg-slate-700 text-gray-300 hover:bg-slate-600 border border-slate-600",
      success:
        "bg-green-500/20 text-green-300 hover:bg-green-500/30 border border-green-500/30",
      warning:
        "bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 border border-yellow-500/30",
      error:
        "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30",
      destructive:
        "bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30",
      outline:
        "border border-slate-600 bg-transparent text-gray-300 hover:bg-slate-700",
    };

    const classes = [baseClasses, variantClasses[variant], className]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  },
);

Badge.displayName = "Badge";
