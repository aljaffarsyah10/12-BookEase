import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Akun (Settings)"
        description="Kelola informasi akun pemilik bisnis dan keamanan sesi Anda."
      />

      <SectionCard
        title="Informasi Akun Pemilik"
        description="Pengaturan kredensial dan preferensi akun BookEase."
      >
        <div className="space-y-2 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-900">Nama Akun:</span> Budi
            Santoso
          </p>
          <p>
            <span className="font-medium text-slate-900">Email:</span>{" "}
            budi@glowstudio.id
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

