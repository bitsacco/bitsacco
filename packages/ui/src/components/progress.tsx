import * as React from "react";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indeterminate?: boolean;
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    { className = "", value = 0, max = 100, indeterminate = false, ...props },
    ref,
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const classes = [
      "relative h-2 w-full overflow-hidden rounded-full bg-gray-200",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        className={classes}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : value}
        {...props}
      >
        <div
          className={`h-full bg-blue-500 transition-all duration-200 ease-in-out ${
            indeterminate
              ? "animate-pulse bg-gradient-to-r from-blue-400 to-blue-600"
              : ""
          }`}
          style={{
            width: indeterminate ? "100%" : `${percentage}%`,
          }}
        />
      </div>
    );
  },
);

Progress.displayName = "Progress";
