"use client";

import { Clock, Edit3, Power, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuration, formatRupiah } from "@/lib/format";
import type { Service, Staff } from "@/types";

interface ServiceCardProps {
  service: Service;
  staffList: Staff[];
  onEdit: (service: Service) => void;
  onToggleActive: (service: Service) => void;
  onDelete: (service: Service) => void;
}

export function ServiceCard({
  service,
  staffList,
  onEdit,
  onToggleActive,
  onDelete,
}: ServiceCardProps) {
  const assignedStaffNames = staffList
    .filter((st) => service.staffIds.includes(st.id))
    .map((st) => st.name);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">
              {service.name}
            </h3>
            <p className="mt-0.5 text-lg font-bold text-indigo-600">
              {formatRupiah(service.price)}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              service.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }
          >
            {service.isActive ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 min-h-10">
          {service.description || "Tidak ada deskripsi layanan."}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
            <Clock className="size-3.5 text-slate-500" />
            {formatDuration(service.durationMinutes)}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50/70 px-2.5 py-1 font-medium text-indigo-700">
            <Users className="size-3.5" />
            {assignedStaffNames.length > 0
              ? assignedStaffNames.join(", ")
              : "Belum ada staf"}
          </span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(service)}
          className="gap-1.5 text-xs"
        >
          <Edit3 className="size-3.5" />
          <span>Edit</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onToggleActive(service)}
          className="gap-1.5 text-xs"
        >
          <Power className="size-3.5" />
          <span>{service.isActive ? "Nonaktifkan" : "Aktifkan"}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onDelete(service)}
          aria-label={`Hapus ${service.name}`}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

