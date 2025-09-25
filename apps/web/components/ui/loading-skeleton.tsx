"use client";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={["animate-pulse bg-slate-700/50 rounded-lg", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}

interface CardSkeletonProps {
  className?: string;
}

export function CardSkeleton({ className }: CardSkeletonProps) {
  return (
    <div
      className={[
        "bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden min-h-[280px] sm:min-h-[320px] lg:min-h-[340px] flex flex-col",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Header section skeleton */}
      <div className="bg-slate-900/40 border-b border-slate-700/50 p-4 sm:p-5 lg:p-6">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4 flex-1">
            <LoadingSkeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <LoadingSkeleton className="h-6 w-32" />
              <LoadingSkeleton className="h-4 w-48" />
            </div>
          </div>
          <LoadingSkeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>

      {/* Body section skeleton */}
      <div className="p-4 sm:p-5 lg:p-6 flex-grow flex flex-col">
        {/* Balance section skeleton - matches BalanceDisplay structure */}
        <div className="mb-4 sm:mb-6 py-3 sm:py-4">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <LoadingSkeleton className="h-3 w-24 mx-auto" />
                <LoadingSkeleton className="h-6 w-20 mx-auto" />
                <LoadingSkeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-grow"></div>

        {/* Action buttons skeleton */}
        <div className="flex gap-2 sm:gap-3">
          <LoadingSkeleton className="flex-1 h-10 rounded-lg" />
          <LoadingSkeleton className="flex-1 h-10 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

interface PageHeaderSkeletonProps {
  className?: string;
  showActions?: boolean;
}

export function PageHeaderSkeleton({
  className,
  showActions = true,
}: PageHeaderSkeletonProps) {
  return (
    <div className={["mb-6 sm:mb-8", className].filter(Boolean).join(" ")}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <LoadingSkeleton className="h-8 w-32 mb-3" />
          <LoadingSkeleton className="h-4 w-80" />
        </div>
        {showActions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <LoadingSkeleton className="w-32 h-12" />
            <LoadingSkeleton className="w-32 h-12" />
          </div>
        )}
      </div>
    </div>
  );
}

interface StatsSkeletonProps {
  className?: string;
  columns?: 2 | 4;
}

export function StatsSkeleton({ className, columns = 2 }: StatsSkeletonProps) {
  return (
    <div
      className={[
        "mb-8 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-4 mb-6">
        <LoadingSkeleton className="w-14 h-14 rounded-xl" />
        <div className="space-y-3 flex-1">
          <LoadingSkeleton className="h-8 w-48" />
          <LoadingSkeleton className="h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="text-center sm:text-left space-y-2">
            <LoadingSkeleton className="h-4 w-32" />
            <LoadingSkeleton className="h-8 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-14 w-14 border-4",
  };

  return (
    <div
      className={[
        "animate-spin rounded-full border-slate-700 border-t-teal-400",
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
