import {
  CheckCheck,
  CheckCircle2,
  Clock,
  UserX,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
  showIcon?: boolean;
}

const STATUS_CONFIG: Record<
  BookingStatus,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    icon: typeof Clock;
  }
> = {
  PENDING: {
    label: "Menunggu",
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-800 dark:text-amber-300",
    border: "border-amber-200/80 dark:border-amber-800/60",
    dot: "bg-amber-500",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Terkonfirmasi",
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-800 dark:text-indigo-300",
    border: "border-indigo-200/80 dark:border-indigo-800/60",
    dot: "bg-indigo-600",
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: "Selesai",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-200/80 dark:border-emerald-800/60",
    dot: "bg-emerald-500",
    icon: CheckCheck,
  },
  CANCELLED: {
    label: "Dibatalkan",
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-800 dark:text-rose-300",
    border: "border-rose-200/80 dark:border-rose-800/60",
    dot: "bg-rose-500",
    icon: XCircle,
  },
  NO_SHOW: {
    label: "Tidak Hadir",
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700",
    dot: "bg-slate-400",
    icon: UserX,
  },
};

export function StatusBadge({
  status,
  className,
  showIcon = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-tight shadow-2xs select-none",
        config.bg,
        config.text,
        config.border,
        className
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", config.dot)} />
      {showIcon && <Icon className="size-3 shrink-0 opacity-80" />}
      <span>{config.label}</span>
    </span>
  );
}
