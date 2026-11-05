"use client";

import { Edit3, Power, Sparkles, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Service, Staff } from "@/types";

interface StaffCardProps {
  staff: Staff;
  services: Service[];
  onEdit: (staff: Staff) => void;
  onToggleActive: (staff: Staff) => void;
}

export function StaffCard({
  staff,
  services,
  onEdit,
  onToggleActive,
}: StaffCardProps) {
  const assignedServices = services.filter(
    (srv) =>
      staff.serviceIds.includes(srv.id) || srv.staffIds.includes(staff.id)
  );

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm">
              {staff.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {staff.name}
              </h3>
              <p className="text-xs text-slate-500">
                {staff.roleOrTitle || "Penyedia Layanan"}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={
              staff.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }
          >
            {staff.isActive ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 min-h-10">
          {staff.bio || "Belum ada bio singkat staf."}
        </p>

        <div className="space-y-1.5 pt-1">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Sparkles className="size-3.5 text-indigo-600" />
            <span>Layanan yang Ditangani ({assignedServices.length}):</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {assignedServices.length === 0 ? (
              <span className="text-xs text-slate-400">
                Belum ditugaskan ke layanan
              </span>
            ) : (
              assignedServices.map((srv) => (
                <span
                  key={srv.id}
                  className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                >
                  {srv.name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <UserCheck className="size-3.5 text-slate-400" />
          <span>{staff.isActive ? "Tersedia untuk booking" : "Cuti / Off"}</span>
        </span>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(staff)}
            className="gap-1.5 text-xs"
          >
            <Edit3 className="size-3.5" />
            <span>Edit</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(staff)}
            className="gap-1.5 text-xs"
          >
            <Power className="size-3.5" />
            <span>{staff.isActive ? "Nonaktifkan" : "Aktifkan"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

