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
  serviceFormSchema,
  type ServiceFormValues,
} from "@/lib/validations/service.schema";
import type { Service, Staff } from "@/types";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Service | null;
  staffList: Staff[];
  onSubmitService: (values: ServiceFormValues) => Promise<void>;
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  initialData,
  staffList,
  onSubmitService,
}: ServiceFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 150000,
      durationMinutes: 60,
      isActive: true,
      staffIds: [],
    },
  });

  React.useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          name: initialData.name,
          description: initialData.description ?? "",
          price: initialData.price,
          durationMinutes: initialData.durationMinutes,
          isActive: initialData.isActive,
          staffIds: initialData.staffIds,
        });
      } else {
        reset({
          name: "",
          description: "",
          price: 150000,
          durationMinutes: 60,
          isActive: true,
          staffIds: staffList.filter((s) => s.isActive).map((s) => s.id),
        });
      }
    }
  }, [open, initialData, staffList, reset]);

  const selectedStaffIds = useWatch({ control, name: "staffIds" }) || [];

  const handleToggleStaff = (staffId: string) => {
    const next = selectedStaffIds.includes(staffId)
      ? selectedStaffIds.filter((id) => id !== staffId)
      : [...selectedStaffIds, staffId];
    setValue("staffIds", next, { shouldValidate: true });
  };

  const onSubmit = async (values: ServiceFormValues) => {
    await onSubmitService(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Layanan" : "Tambah Layanan Baru"}
          </DialogTitle>
          <DialogDescription>
            Masukkan nama layanan, harga, durasi pengerjaan, dan pilih staf yang
            dapat menangani layanan ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="service-name">Nama Layanan</Label>
            <Input
              id="service-name"
              placeholder="Contoh: Signature Hydrating Facial"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="service-price">Harga (Rp)</Label>
              <Input
                id="service-price"
                type="number"
                min={0}
                step={5000}
                aria-invalid={!!errors.price}
                {...register("price", { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs text-red-600">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="service-duration">Durasi (Menit)</Label>
              <Input
                id="service-duration"
                type="number"
                min={5}
                max={480}
                step={5}
                aria-invalid={!!errors.durationMinutes}
                {...register("durationMinutes", { valueAsNumber: true })}
              />
              {errors.durationMinutes && (
                <p className="text-xs text-red-600">
                  {errors.durationMinutes.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="service-desc">Deskripsi Layanan</Label>
            <textarea
              id="service-desc"
              rows={2}
              placeholder="Jelaskan manfaat atau tahapan layanan..."
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Staf yang Menangani Layanan Ini</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-36 overflow-y-auto rounded-lg border border-slate-200 p-2.5">
              {staffList.map((st) => {
                const checked = selectedStaffIds.includes(st.id);
                return (
                  <label
                    key={st.id}
                    className="flex items-center gap-2 rounded-md p-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleStaff(st.id)}
                      className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <span className="truncate">{st.name}</span>
                  </label>
                );
              })}
            </div>
            {errors.staffIds && (
              <p className="text-xs text-red-600">{errors.staffIds.message}</p>
            )}
          </div>

          <label className="flex items-center gap-2.5 text-sm font-medium text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              className="size-4 rounded border-slate-300 text-indigo-600"
              {...register("isActive")}
            />
            <span>Tampilkan layanan ini di halaman booking publik</span>
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
              <span>
                {initialData ? "Simpan Perubahan" : "Tambah Layanan"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

