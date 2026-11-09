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
        "rounded-xl border border-slate-200/80 bg-white shadow-2xs transition-all duration-150 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {value}
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50/80 text-indigo-600 border border-indigo-100/60 shadow-2xs dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900/60">
            <Icon className="size-5" />
          </div>
        </div>
        {(subtitle || trend) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {trend && (
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {trend}
              </span>
            )}
            {subtitle && <span className="truncate">{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
