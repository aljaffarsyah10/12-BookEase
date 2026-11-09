import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200/90 bg-slate-50/40 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/40",
        className
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500 mb-3.5 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
        <Icon className="size-5" />
      </div>
      <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
