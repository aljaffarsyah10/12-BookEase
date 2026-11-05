import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  Clock,
  Globe,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CORE_FEATURES = [
  {
    title: "Halaman Booking Publik",
    description:
      "Setiap bisnis mendapatkan URL khusus (/book/nama-bisnis) yang siap dibagikan di bio Instagram atau WhatsApp.",
    icon: Globe,
  },
  {
    title: "Pencegahan Double Booking",
    description:
      "Slot waktu yang sudah dipesan otomatis terkunci agar tidak pernah terjadi benturan jadwal antar-pelanggan.",
    icon: ShieldCheck,
  },
  {
    title: "Manajemen Layanan & Harga",
    description:
      "Atur daftar layanan, durasi pengerjaan, harga transparan, dan status aktif kapan saja dari dashboard.",
    icon: Sparkles,
  },
  {
    title: "Alokasi Staf Fleksibel",
    description:
      "Pelanggan dapat memilih staf favoritnya atau memilih opsi 'Siapa Saja yang Tersedia' secara otomatis.",
    icon: Users,
  },
  {
    title: "Jam Operasional & Buffer Time",
    description:
      "Tetapkan jam buka harian, hari libur mingguan, serta jeda waktu istirahat antar-reservasi.",
    icon: Clock,
  },
  {
    title: "Tanpa Wajib Akun Pelanggan",
    description:
      "Pelanggan cukup memilih layanan, jam, dan mengisi kontak untuk langsung mendapatkan kode referensi booking.",
    icon: CalendarCheck,
  },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge
              variant="outline"
              className="mb-4 rounded-full border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-medium text-indigo-700"
            >
              Platform Reservasi Online Bisnis Jasa
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Terima Reservasi Pelanggan 24/7 Tanpa Ribet Chat Manual
            </h1>
            <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
              BookEase membantu salon, klinik kecantikan, barbershop, konsultan,
              dan berbagai bisnis jasa mengelola jadwal layanan, ketersediaan
              staf, dan reservasi pelanggan dalam satu tempat.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href="/register"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-indigo-600 px-6 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-indigo-700"
              >
                <span>Buat Halaman Booking Gratis</span>
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/book/glow-beauty-studio"
                className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50"
              >
                Lihat Demo Halaman Publik
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Dirancang untuk Kebutuhan Operasional Bisnis Jasa
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Semua fitur inti yang Anda butuhkan untuk menggantikan pencatatan
              jadwal manual.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-200 bg-white py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-indigo-600 px-6 py-10 text-center text-white sm:flex-row sm:px-10 sm:text-left">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-xl sm:text-2xl font-bold">
                Siap memodernisasi sistem janji temu bisnis Anda?
              </h2>
              <p className="text-sm sm:text-base text-indigo-100">
                Daftarkan bisnis Anda dalam hitungan menit dan mulai terima
                reservasi online hari ini.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-indigo-700 shadow-xs transition-colors hover:bg-indigo-50"
            >
              Mulai Sekarang
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

