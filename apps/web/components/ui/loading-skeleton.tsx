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
        "bg-slate-800/30 border border-slate-700/50 rounded-xl p-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="space-y-4">
        <LoadingSkeleton className="h-6 w-3/4" />
        <LoadingSkeleton className="h-4 w-full" />
        <LoadingSkeleton className="h-4 w-24" />
        <div className="border-t border-slate-700 pt-4 space-y-3">
          <LoadingSkeleton className="h-16" />
          <div className="flex gap-2">
            <LoadingSkeleton className="flex-1 h-10" />
            <LoadingSkeleton className="flex-1 h-10" />
          </div>
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

export function StatsSkeleton({ className, columns = 4 }: StatsSkeletonProps) {
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
      <div
        className={`grid gap-6 ${columns === 2 ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4"}`}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <LoadingSkeleton className="h-4 w-24 mx-auto" />
            <LoadingSkeleton className="h-8 w-20 mx-auto" />
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
