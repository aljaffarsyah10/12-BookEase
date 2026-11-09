import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarCheck,
  Camera,
  CheckCircle2,
  Clock,
  Dumbbell,
  Globe,
  HeartPulse,
  Scissors,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CORE_FEATURES = [
  {
    title: "Halaman Booking Publik Unik",
    description:
      "Setiap bisnis mendapatkan URL khusus (/book/nama-bisnis) yang siap dibagikan di bio Instagram, TikTok, atau WhatsApp.",
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

const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Daftarkan Bisnis & Konfigurasi Layanan",
    description:
      "Buat akun bisnis, tambahkan daftar layanan beserta durasi, harga, anggota staf, dan jam operasional mingguan Anda.",
  },
  {
    step: "02",
    title: "Bagikan Link Halaman Booking Publik",
    description:
      "Salin tautan unik bisnis Anda (mis. bookease.com/book/glow-beauty-studio) ke media sosial atau pesan otomatis WhatsApp.",
  },
  {
    step: "03",
    title: "Terima & Kelola Reservasi Real-Time",
    description:
      "Pelanggan memilih slot yang tersedia secara mandiri. Anda cukup memantau dan memperbarui status kehadiran dari dashboard.",
  },
];

const TARGET_BUSINESSES = [
  { name: "Salon & Barbershop", icon: Scissors },
  { name: "Klinik Kecantikan & Estetika", icon: Sparkles },
  { name: "Fisioterapi & Kesehatan Non-Darurat", icon: HeartPulse },
  { name: "Konsultan & Psikolog", icon: Briefcase },
  { name: "Studio Fotografi", icon: Camera },
  { name: "Bengkel & Perawatan Kendaraan", icon: Wrench },
  { name: "Personal Trainer & Fitness", icon: Dumbbell },
  { name: "Terapis & Layanan Profesional", icon: Users },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-200/80 bg-white py-16 sm:py-24 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(79,70,229,0.07),rgba(255,255,255,0))]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7 text-center lg:text-left">
              <Badge
                variant="outline"
                className="mb-4 rounded-full border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-indigo-700"
              >
                Platform Reservasi Online Bisnis Jasa
              </Badge>
              <h1 className="text-3xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight text-slate-900 leading-[1.15]">
                Terima Reservasi Pelanggan 24/7 Tanpa Ribet Chat Manual
              </h1>
              <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                BookEase membantu salon, klinik kecantikan, barbershop,
                konsultan, dan berbagai bisnis jasa mengelola jadwal layanan,
                ketersediaan staf, dan reservasi pelanggan dalam satu tempat.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/register"
                  className="inline-flex h-11.5 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 text-sm font-semibold text-white shadow-xs transition-all hover:bg-indigo-700 hover:shadow-sm"
                >
                  <span>Buat Halaman Booking Gratis</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/book/glow-beauty-studio"
                  className="inline-flex h-11.5 w-full sm:w-auto items-center justify-center rounded-xl border border-slate-200/90 bg-white px-6 text-sm font-semibold text-slate-800 shadow-2xs transition-all hover:bg-slate-50"
                >
                  Coba Demo Booking Pelanggan
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs font-medium text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  Tanpa akun bagi pelanggan
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  Anti bentrok jadwal otomatis
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  Dukungan WIB, WITA, WIT
                </span>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200/90 bg-slate-50/70 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">
                      Pratinjau Halaman Publik
                    </p>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      Glow Beauty Studio
                    </h2>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200/80">
                    Buka Hari Ini
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-indigo-600/90 bg-indigo-50/50 p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">
                        Signature Hydrating Facial
                      </p>
                      <span className="text-sm font-bold text-indigo-700">
                        Rp 250.000
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 font-medium">
                      60 menit • Staf: Siti Rahma
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <span className="flex h-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-xs font-mono font-medium text-slate-700">
                      09:00
                    </span>
                    <span className="flex h-9 items-center justify-center rounded-lg bg-indigo-600 text-xs font-mono font-semibold text-white shadow-2xs">
                      10:00
                    </span>
                    <span className="flex h-9 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-xs font-mono font-medium text-slate-700">
                      11:00
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    bookease.com/book/glow-beauty-studio
                  </span>
                  <Link
                    href="/book/glow-beauty-studio"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
                  >
                    <span>Buka Halaman</span>
                    <span>→</span>
                  </Link>
                </div>
              </div>
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
              jadwal manual di buku atau chat.
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

      {/* How It Works Section */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Cara Kerja BookEase dalam 3 Langkah
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Mulai terima reservasi online dari pelanggan tanpa pengaturan
              teknis yang rumit.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {HOW_IT_WORKS_STEPS.map((item) => (
              <div
                key={item.step}
                className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-6"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-lg bg-indigo-600 font-mono text-xs font-bold text-white">
                  {item.step}
                </span>
                <h3 className="mt-4 text-base sm:text-lg font-semibold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Target Business Categories Section */}
      <section className="border-t border-slate-200 bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
              Cocok untuk Berbagai Kategori Bisnis Jasa
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Fleksibel digunakan oleh bisnis berbasis janji temu tunggal maupun
              multi-staf.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TARGET_BUSINESSES.map((biz) => {
              const Icon = biz.icon;
              return (
                <div
                  key={biz.name}
                  className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon className="size-5" />
                  </div>
                  <span className="text-sm font-semibold text-slate-800">
                    {biz.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer CTA Section */}
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
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/register"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-white px-6 text-sm font-semibold text-indigo-700 shadow-xs transition-colors hover:bg-indigo-50"
              >
                Daftar Gratis Sekarang
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-indigo-400 bg-indigo-700/50 px-5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
              >
                Lihat Dashboard Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
