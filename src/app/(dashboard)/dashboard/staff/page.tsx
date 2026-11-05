import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default function StaffManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Staf (Staff)"
        description="Kelola anggota tim atau penyedia layanan serta hubungkan dengan layanan yang ditangani."
        actions={
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="size-4" />
            <span>Tambah Staf</span>
          </Button>
        }
      />

      <SectionCard
        title="Daftar Staf Penyedia Layanan"
        description="Staf yang aktif dapat dipilih oleh pelanggan saat melakukan booking."
      >
        <EmptyState
          icon={Users}
          title="Belum Ada Staf Terdaftar"
          description="Tambahkan anggota staf atau penyedia jasa untuk mulai mengalokasikan jadwal layanan."
        />
      </SectionCard>
    </div>
  );
}

