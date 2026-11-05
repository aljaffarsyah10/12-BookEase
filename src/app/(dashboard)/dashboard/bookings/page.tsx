import { CalendarDays } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default function BookingsManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Reservasi (Bookings)"
        description="Kelola semua reservasi pelanggan, pantau jadwal, dan perbarui status kehadiran."
      />

      <SectionCard
        title="Semua Reservasi"
        description="Filter dan cari reservasi berdasarkan nama pelanggan, kode referensi, atau status."
      >
        <EmptyState
          icon={CalendarDays}
          title="Belum Ada Data Reservasi"
          description="Reservasi pelanggan dari halaman booking publik Anda akan ditampilkan di sini."
        />
      </SectionCard>
    </div>
  );
}

