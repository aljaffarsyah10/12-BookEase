import { Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

const DAYS = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

export default function ScheduleManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Jam Operasional (Schedule)"
        description="Tentukan jam buka dan tutup harian serta hari libur bisnis Anda."
        actions={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Simpan Jadwal
          </Button>
        }
      />

      <SectionCard
        title="Jadwal Operasional Mingguan"
        description="Slot reservasi dihitung otomatis berdasarkan jam operasional di bawah ini."
      >
        <div className="divide-y divide-slate-100">
          {DAYS.map((day, idx) => (
            <div
              key={day}
              className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <Clock className="size-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-900">
                  {day}
                </span>
              </div>
              <div className="text-sm text-slate-600 font-mono">
                {idx === 6 ? (
                  <span className="text-amber-600 font-sans font-medium">
                    Tutup (Libur)
                  </span>
                ) : (
                  "09:00 – 18:00"
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

