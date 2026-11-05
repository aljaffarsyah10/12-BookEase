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
        "rounded-xl border border-slate-200/80 bg-white shadow-xs",
        className
      )}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              {value}
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Icon className="size-5" />
          </div>
        </div>
        {(subtitle || trend) && (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            {trend && (
              <span className="font-medium text-emerald-600">{trend}</span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

