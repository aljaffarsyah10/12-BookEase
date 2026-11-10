import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xs dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <CardContent className="p-5 sm:p-5.5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
              {value}
            </p>
          </div>
          <div className="flex size-10.5 shrink-0 items-center justify-center rounded-xl bg-indigo-50/90 text-indigo-600 border border-indigo-100/80 shadow-2xs dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/60">
            <Icon className="size-5" />
          </div>
        </div>
        {(subtitle || trend) && (
          <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100/80 dark:border-slate-800/80 pt-2.5">
            {trend && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900">
                <span>↑</span>
                <span>{trend}</span>
              </span>
            )}
            {subtitle && <span className="truncate text-slate-500 text-[11px]">{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
