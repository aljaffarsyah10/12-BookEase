import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <PageHeader
        title="Syarat & Ketentuan Layanan"
        description="Terakhir diperbarui: 5 November 2026"
      />
      <SectionCard>
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            Dengan menggunakan BookEase, Anda menyetujui ketentuan penggunaan
            platform manajemen reservasi online ini.
          </p>
          <h2 className="text-base font-semibold text-slate-900">
            1. Penggunaan Layanan
          </h2>
          <p>
            Pemilik bisnis bertanggung jawab atas keakuratan informasi layanan,
            harga, dan jam operasional yang ditampilkan pada halaman booking
            publik masing-masing.
          </p>
          <h2 className="text-base font-semibold text-slate-900">
            2. Kebijakan Pembatalan Reservasi
          </h2>
          <p>
            Setiap reservasi yang dibatalkan tercatat dalam riwayat sistem dan
            slot waktunya akan dibuka kembali sesuai ketersediaan jadwal bisnis.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

