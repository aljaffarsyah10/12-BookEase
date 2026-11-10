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
import { businessApi } from "@/features/business/services/business.api";
import { scheduleApi } from "@/features/schedule/services/schedule.api";
import { DAY_NAMES_ID } from "@/lib/format";
import { scheduleFormSchema } from "@/lib/validations/schedule.schema";
import { cn } from "@/lib/utils";
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
      scheduleApi.getSchedule(),
      businessApi.getBusiness(),
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
    try {
      await scheduleApi.saveSchedule(parsed.data);
      toast.success("Jadwal operasional mingguan berhasil disimpan!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan jadwal.");
    } finally {
      setIsSaving(false);
    }
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
        description="Hari yang ditandai Tutup tidak akan menampilkan slot reservasi pada halaman publik."
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
                    <div className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Clock className="size-3.5" />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {DAY_NAMES_ID[dayNum]}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      updateDayField(dayNum, { isClosed: !item.isClosed })
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-all cursor-pointer select-none",
                      item.isClosed
                        ? "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200/70"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/70"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        item.isClosed ? "bg-slate-400" : "bg-emerald-500"
                      )}
                    />
                    <span>{item.isClosed ? "Tutup" : "Buka"}</span>
                  </button>
                </div>

                {item.isClosed ? (
                  <div className="rounded-lg bg-slate-100/80 border border-slate-200/60 px-3.5 py-2 text-xs font-medium text-slate-500">
                    Tidak menerima reservasi pada hari {DAY_NAMES_ID[dayNum]}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`open-${dayNum}`}
                        className="text-xs font-medium text-slate-500"
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
                        className="w-32 font-mono text-xs sm:text-sm h-9"
                      />
                    </div>
                    <span className="text-slate-300 font-medium">–</span>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`close-${dayNum}`}
                        className="text-xs font-medium text-slate-500"
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
                        className="w-32 font-mono text-xs sm:text-sm h-9"
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1 max-w-xl">
            <Label htmlFor="buffer-minutes" className="text-sm font-semibold text-slate-900">
              Durasi Buffer Time (Menit)
            </Label>
            <p className="text-xs text-slate-500 leading-relaxed">
              Jika diatur 10 menit, layanan berdurasi 60 menit pada pukul 09:00 akan
              memblokir jadwal staf hingga pukul 10:10 WIB untuk mencegah overlap.
            </p>
          </div>
          <div className="w-full sm:w-44">
            <Input
              id="buffer-minutes"
              type="number"
              min={0}
              max={120}
              step={5}
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value) || 0)}
              className="font-mono h-10"
            />
          </div>
        </div>
      </SectionCard>
    </form>
  );
}
