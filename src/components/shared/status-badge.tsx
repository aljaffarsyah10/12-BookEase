import {
  CheckCheck,
  CheckCircle2,
  Clock,
  UserX,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/types";

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  BookingStatus,
  {
    label: string;
    className: string;
    icon: typeof Clock;
  }
> = {
  PENDING: {
    label: "Menunggu Konfirmasi",
    className: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock,
  },
  CONFIRMED: {
    label: "Terkonfirmasi",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: CheckCircle2,
  },
  COMPLETED: {
    label: "Selesai",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: CheckCheck,
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-red-50 text-red-700 border-red-200",
    icon: XCircle,
  },
  NO_SHOW: {
    label: "Tidak Hadir",
    className: "bg-slate-100 text-slate-700 border-slate-300",
    icon: UserX,
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
}

