import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  Globe,
  LayoutDashboard,
  ShieldCheck,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

const FEATURE_SECTIONS = [
  {
    icon: Globe,
    title: "Halaman Booking Publik Berbasis Slug Unik",
    description:
      "Tampilkan identitas bisnis, daftar layanan, durasi, harga, dan ketersediaan staf secara profesional tanpa perlu membangun website terpisah.",
  },
  {
    icon: Clock,
    title: "Mesin Kalkulasi Slot Waktu Otomatis",
    description:
      "Menghitung slot waktu secara akurat berdasarkan jam operasional bisnis, durasi layanan, buffer time, dan zona waktu bisnis (WIB/WITA/WIT).",
  },
  {
    icon: ShieldCheck,
    title: "Proteksi Anti Double-Booking",
    description:
      "Menjamin satu staf tidak pernah menerima dua reservasi aktif pada waktu yang bertabrakan.",
  },
  {
    icon: Users,
    title: "Manajemen Staf & Penugasan Layanan",
    description:
      "Hubungkan setiap staf dengan layanan keahliannya. Mendukung pemilihan staf spesifik maupun alokasi otomatis.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Operasional Pemilik Bisnis",
    description:
      "Pantau booking hari ini, reservasi mendatang, serta ubah status reservasi (Confirmed, Completed, Cancelled, No-Show) secara terpusat.",
  },
  {
    icon: CalendarCheck,
    title: "Pengalaman Pelanggan Mobile-First",
    description:
      "Proses booking 4 langkah yang ringan dan responsif di smartphone tanpa mengharuskan pelanggan membuat akun.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 space-y-10">
      <PageHeader
        title="Fitur Lengkap BookEase"
        description="Dirancang khusus untuk menyederhanakan penjadwalan janji temu dan operasional harian bisnis jasa Anda."
        actions={
          <Link
            href="/register"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-indigo-600 px-5 text-xs sm:text-sm font-semibold text-white shadow-2xs hover:bg-indigo-700 transition-colors"
          >
            Coba Gratis Sekarang
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURE_SECTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <SectionCard key={item.title} title={item.title} className="hover:border-slate-300 transition-all shadow-2xs">
              <div className="space-y-3 pt-1">
                <div className="flex size-10.5 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/80">
                  <Icon className="size-5" />
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}

