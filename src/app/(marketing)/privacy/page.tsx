import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <PageHeader
        title="Kebijakan Privasi"
        description="Terakhir diperbarui: 5 November 2026"
      />
      <SectionCard>
        <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
          <p>
            BookEase berkomitmen melindungi privasi pemilik bisnis dan pelanggan
            yang melakukan reservasi melalui platform kami.
          </p>
          <h2 className="text-base font-semibold text-slate-900">
            1. Data yang Kami Kumpulkan
          </h2>
          <p>
            Kami hanya menyimpan data yang diperlukan untuk operasional
            penjadwalan: profil bisnis, daftar layanan, jadwal operasional,
            serta informasi kontak pelanggan (nama, email, dan nomor telepon)
            untuk keperluan reservasi.
          </p>
          <h2 className="text-base font-semibold text-slate-900">
            2. Perlindungan & Isolasi Data
          </h2>
          <p>
            Data pelanggan hanya dapat diakses oleh pemilik bisnis tempat
            reservasi dibuat. Email dan nomor telepon pelanggan tidak pernah
            ditampilkan pada halaman publik.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}

