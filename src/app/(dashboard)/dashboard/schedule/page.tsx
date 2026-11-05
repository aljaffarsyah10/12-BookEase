"use client";

import * as React from "react";
import { Clock, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { businessMockService } from "@/features/business/services/business.mock-service";
import { scheduleMockService } from "@/features/schedule/services/schedule.mock-service";
import { DAY_NAMES_ID } from "@/lib/format";
import { scheduleFormSchema } from "@/lib/validations/schedule.schema";
import type { OperatingHour } from "@/types";

const ORDERED_DAYS = [1, 2, 3, 4, 5, 6, 0]; // Senin s/d Minggu

export default function ScheduleManagementPage() {
  const [hours, setHours] = React.useState<OperatingHour[]>([]);
  const [bufferMinutes, setBufferMinutes] = React.useState<number>(10);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      scheduleMockService.getSchedule(),
      businessMockService.getBusiness(),
    ]).then(([sched, biz]) => {
      if (!active) return;
      setHours(sched);
      setBufferMinutes(biz.bufferTimeMinutes);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const updateDayField = (
    dayOfWeek: number,
    patch: Partial<OperatingHour>
  ) => {
    setErrorMsg(null);
    setHours((prev) =>
      prev.map((item) =>
        item.dayOfWeek === dayOfWeek ? { ...item, ...patch } : item
      )
    );
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const parsed = scheduleFormSchema.safeParse({
      bufferTimeMinutes: bufferMinutes,
      schedule: hours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      })),
    });

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      setErrorMsg(
        firstIssue?.message ??
          "Periksa kembali jam buka dan jam tutup setiap hari."
      );
      toast.error("Validasi jadwal gagal", {
        description: firstIssue?.message,
      });
      return;
    }

    setIsSaving(true);
    const currentBiz = await businessMockService.getBusiness();
    await Promise.all([
      scheduleMockService.updateSchedule(parsed.data.schedule),
      businessMockService.updateBusiness({
        name: currentBiz.name,
        slug: currentBiz.slug,
        category: currentBiz.category,
        description: currentBiz.description ?? "",
        phone: currentBiz.phone ?? "+6281234567890",
        address: currentBiz.address ?? "Jl. Sudirman No. 45",
        timezone: currentBiz.timezone,
        bufferTimeMinutes: parsed.data.bufferTimeMinutes,
      }),
    ]);
    setIsSaving(false);
    toast.success("Jadwal operasional mingguan berhasil disimpan!");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Jam Operasional (Schedule)"
          description="Tentukan jam buka dan tutup harian serta hari libur bisnis Anda."
        />
        <LoadingState variant="table" count={7} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveSchedule} className="space-y-6">
      <PageHeader
        title="Jam Operasional (Schedule)"
        description="Tentukan jam buka dan tutup harian, hari libur, serta buffer time antar-reservasi."
        actions={
          <Button
            type="submit"
            disabled={isSaving}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSaving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            <span>{isSaving ? "Menyimpan..." : "Simpan Jadwal"}</span>
          </Button>
        }
      />

      {errorMsg && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorMsg}
        </div>
      )}

      <SectionCard
        title="Jadwal Operasional Mingguan"
        description="Hari yang ditandai Tutup tidak akan menghasilkan slot booking pada halaman publik."
      >
        <div className="divide-y divide-slate-100">
          {ORDERED_DAYS.map((dayNum) => {
            const item = hours.find((h) => h.dayOfWeek === dayNum);
            if (!item) return null;

            return (
              <div
                key={dayNum}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center justify-between sm:w-56">
                  <div className="flex items-center gap-2.5">
                    <Clock className="size-4 text-slate-400" />
                    <span className="text-sm font-semibold text-slate-900">
                      {DAY_NAMES_ID[dayNum]}
                    </span>
                  </div>

                  <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!item.isClosed}
                      onChange={(e) =>
                        updateDayField(dayNum, { isClosed: !e.target.checked })
                      }
                      className="size-4 rounded border-slate-300 text-indigo-600"
                    />
                    <span>{item.isClosed ? "Tutup" : "Buka"}</span>
                  </label>
                </div>

                {item.isClosed ? (
                  <div className="rounded-lg bg-amber-50/80 border border-amber-200/70 px-3.5 py-2 text-xs font-medium text-amber-700">
                    Tidak menerima booking pada hari {DAY_NAMES_ID[dayNum]}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`open-${dayNum}`}
                        className="text-xs text-slate-500"
                      >
                        Buka
                      </Label>
                      <Input
                        id={`open-${dayNum}`}
                        type="time"
                        value={item.openTime}
                        onChange={(e) =>
                          updateDayField(dayNum, { openTime: e.target.value })
                        }
                        className="w-32 font-mono text-xs sm:text-sm"
                      />
                    </div>
                    <span className="text-slate-400">–</span>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`close-${dayNum}`}
                        className="text-xs text-slate-500"
                      >
                        Tutup
                      </Label>
                      <Input
                        id={`close-${dayNum}`}
                        type="time"
                        value={item.closeTime}
                        onChange={(e) =>
                          updateDayField(dayNum, { closeTime: e.target.value })
                        }
                        className="w-32 font-mono text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard
        title="Jeda Waktu Antar-Reservasi (Buffer Time)"
        description="Tambahkan jeda otomatis setelah setiap layanan selesai agar staf memiliki waktu persiapan."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <Label htmlFor="buffer-minutes">Durasi Buffer Time (Menit)</Label>
            <p className="text-xs text-slate-500">
              Jika diisi 10 menit, layanan 60 menit pada pukul 09:00 akan
              memblokir jadwal staf hingga 10:10.
            </p>
          </div>
          <div className="w-full sm:w-40">
            <Input
              id="buffer-minutes"
              type="number"
              min={0}
              max={120}
              step={5}
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value) || 0)}
              className="font-mono"
            />
          </div>
        </div>
      </SectionCard>
    </form>
  );
}
