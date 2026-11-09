"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  staffFormSchema,
  type StaffFormValues,
} from "@/lib/validations/staff.schema";
import type { Service, Staff } from "@/types";

interface StaffFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Staff | null;
  services: Service[];
  onSubmitStaff: (values: StaffFormValues) => Promise<void>;
}

export function StaffFormDialog({
  open,
  onOpenChange,
  initialData,
  services,
  onSubmitStaff,
}: StaffFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      name: "",
      roleOrTitle: "",
      bio: "",
      isActive: true,
      serviceIds: [],
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          roleOrTitle: initialData.roleOrTitle ?? "",
          bio: initialData.bio ?? "",
          isActive: initialData.isActive,
          serviceIds: initialData.serviceIds,
        });
      } else {
        reset({
          name: "",
          roleOrTitle: "Specialist",
          bio: "",
          isActive: true,
          serviceIds: services.filter((s) => s.isActive).map((s) => s.id),
        });
      }
    }
  }, [open, initialData, services, reset]);

  const selectedServiceIds = useWatch({ control, name: "serviceIds" }) || [];

  const handleToggleService = (serviceId: string) => {
    const next = selectedServiceIds.includes(serviceId)
      ? selectedServiceIds.filter((id) => id !== serviceId)
      : [...selectedServiceIds, serviceId];
    setValue("serviceIds", next, { shouldValidate: true });
  };

  const onSubmit = async (values: StaffFormValues) => {
    await onSubmitStaff(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Data Staf" : "Tambah Staf Baru"}
          </DialogTitle>
          <DialogDescription>
            Atur profil staf penyedia jasa dan pilih layanan yang dapat
            ditangani.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="staff-name">Nama Lengkap Staf</Label>
              <Input
                id="staff-name"
                placeholder="Contoh: Siti Rahma"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="staff-role">Jabatan / Spesialisasi</Label>
              <Input
                id="staff-role"
                placeholder="Contoh: Senior Aesthetician"
                aria-invalid={!!errors.roleOrTitle}
                {...register("roleOrTitle")}
              />
              {errors.roleOrTitle && (
                <p className="text-xs text-red-600">
                  {errors.roleOrTitle.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="staff-bio">Bio Singkat / Keahlian</Label>
            <textarea
              id="staff-bio"
              rows={2}
              placeholder="Pengalaman atau spesialisasi staf..."
              className="w-full rounded-lg border border-slate-200/90 bg-white px-3.5 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-indigo-500/10 focus-visible:border-indigo-500"
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-xs text-rose-600 font-medium">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Penugasan Layanan (Service Assignment)</Label>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto rounded-lg border border-slate-200/90 p-2.5 bg-slate-50/50">
              {services.map((srv) => {
                const checked = selectedServiceIds.includes(srv.id);
                return (
                  <label
                    key={srv.id}
                    className={`flex items-center gap-2.5 rounded-md p-2 text-xs font-medium cursor-pointer transition-colors border ${
                      checked
                        ? "bg-indigo-50/60 border-indigo-200 text-indigo-900"
                        : "bg-white border-slate-200/60 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleService(srv.id)}
                      className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="truncate">{srv.name}</span>
                  </label>
                );
              })}
            </div>
            {errors.serviceIds && (
              <p className="text-xs text-rose-600 font-medium">
                {errors.serviceIds.message}
              </p>
            )}
          </div>

          <label className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register("isActive")}
            />
            <span>Staf aktif dan tersedia untuk menerima reservasi baru</span>
          </label>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              <span>{initialData ? "Simpan Perubahan" : "Tambah Staf"}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

