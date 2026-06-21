type SkeletonProps = {
  className?: string;
  "aria-label"?: string;
};

export function Skeleton({ className = "h-6 w-full", "aria-label": ariaLabel }: SkeletonProps) {
  return <div aria-label={ariaLabel} role="status" className={`animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-700 ${className}`} />;
}
