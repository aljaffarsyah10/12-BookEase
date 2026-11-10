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
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-sm">
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100/80 text-indigo-700 font-extrabold text-sm border border-indigo-200/60 shadow-2xs">
              {staff.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {staff.name}
              </h3>
              <p className="text-xs font-semibold text-slate-500">
                {staff.roleOrTitle || "Penyedia Layanan"}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={
              staff.isActive
                ? "inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200/80 font-semibold text-[11px] px-2.5 py-0.5"
                : "bg-slate-100 text-slate-600 border-slate-200 font-semibold text-[11px] px-2.5 py-0.5"
            }
          >
            {staff.isActive && <span className="size-1.5 rounded-full bg-emerald-500" />}
            <span>{staff.isActive ? "Aktif" : "Nonaktif"}</span>
          </Badge>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 min-h-10 leading-relaxed">
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
                  className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200/60"
                >
                  {srv.name}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <UserCheck className="size-3.5 text-slate-400" />
          <span>{staff.isActive ? "Tersedia untuk reservasi" : "Sedang Cuti / Off"}</span>
        </span>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onEdit(staff)}
            className="gap-1.5 text-xs h-8 text-slate-700 hover:text-slate-900"
          >
            <Edit3 className="size-3.5" />
            <span>Edit</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(staff)}
            className="gap-1.5 text-xs h-8 text-slate-700 hover:text-slate-900"
          >
            <Power className="size-3.5" />
            <span>{staff.isActive ? "Nonaktifkan" : "Aktifkan"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

