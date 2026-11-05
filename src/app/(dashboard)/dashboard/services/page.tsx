import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default function ServicesManagementPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Layanan (Services)"
        description="Atur katalog layanan, durasi pengerjaan, harga, dan penugasan staf."
        actions={
          <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="size-4" />
            <span>Tambah Layanan</span>
          </Button>
        }
      />

      <SectionCard
        title="Katalog Layanan Bisnis"
        description="Layanan yang aktif akan ditampilkan pada halaman booking publik."
      >
        <EmptyState
          icon={Sparkles}
          title="Belum Ada Layanan Terdaftar"
          description="Tambahkan layanan pertama Anda beserta harga dan durasinya agar pelanggan dapat mulai melakukan reservasi."
        />
      </SectionCard>
    </div>
  );
}

