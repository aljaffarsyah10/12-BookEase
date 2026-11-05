import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  variant?: "cards" | "table" | "slots" | "detail";
  count?: number;
  className?: string;
}

export function LoadingState({
  variant = "cards",
  count = 4,
  className,
}: LoadingStateProps) {
  if (variant === "slots") {
    return (
      <div
        className={cn(
          "grid grid-cols-3 sm:grid-cols-4 gap-2.5 sm:gap-3",
          className
        )}
      >
        {Array.from({ length: 8 }).map((_, idx) => (
          <Skeleton key={idx} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (variant === "table") {
    return (
      <div
        className={cn(
          "space-y-3 rounded-xl border border-slate-200 bg-white p-5",
          className
        )}
      >
        <Skeleton className="h-9 w-full rounded-lg" />
        {Array.from({ length: count }).map((_, idx) => (
          <Skeleton key={idx} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div className={cn("space-y-4", className)}>
        <Skeleton className="h-10 w-64 rounded-lg" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-3 w-36" />
        </div>
      ))}
    </div>
  );
}

