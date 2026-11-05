import Link from "next/link";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

const PLANS = [
  {
    name: "Starter MVP",
    price: "Gratis",
    subtitle: "Cocok untuk usaha jasa yang baru memulai reservasi digital.",
    badge: "Tersedia Sekarang",
    features: [
      "1 Workspace Bisnis",
      "Halaman Booking Publik (/book/slug)",
      "Layanan & Staf Tanpa Batas",
      "Pengaturan Jam Operasional & Buffer Time",
      "Pencegahan Double Booking Otomatis",
      "Dashboard Manajemen Reservasi",
    ],
    ctaLabel: "Mulai Gratis",
    ctaHref: "/register",
    highlighted: true,
  },
  {
    name: "Pro Business",
    price: "Rp 149.000 / bln",
    subtitle: "Untuk bisnis berkembang dengan kebutuhan pengingat otomatis.",
    badge: "Segera Hadir",
    features: [
      "Semua fitur di paket Starter",
      "Pengingat Email Otomatis Pelanggan",
      "Tampilan Kalender Mingguan & Bulanan",
      "Statistik & Analitik Lanjutan",
      "Prioritas Dukungan Teknis",
    ],
    ctaLabel: "Daftar Waiting List",
    ctaHref: "/register",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      <PageHeader
        title="Harga Transparan untuk Setiap Skala Bisnis"
        description="Mulai gunakan BookEase secara gratis tanpa biaya tersembunyi."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {PLANS.map((plan) => (
          <SectionCard
            key={plan.name}
            title={plan.name}
            description={plan.subtitle}
            headerAction={
              <Badge
                variant="outline"
                className={
                  plan.highlighted
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                    : "bg-slate-100 text-slate-700 border-slate-200"
                }
              >
                {plan.badge}
              </Badge>
            }
            className={
              plan.highlighted ? "ring-2 ring-indigo-600 border-indigo-600" : ""
            }
          >
            <div className="space-y-6">
              <p className="text-3xl font-bold text-slate-900">{plan.price}</p>
              <ul className="space-y-2.5 text-sm text-slate-600">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.ctaHref}
                className={
                  plan.highlighted
                    ? "inline-flex h-11 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
                    : "inline-flex h-11 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                }
              >
                {plan.ctaLabel}
              </Link>
            </div>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

