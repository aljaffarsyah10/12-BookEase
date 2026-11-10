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
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8 space-y-10">
      <PageHeader
        title="Paket Berlangganan Transparan"
        description="Mulai gunakan BookEase secara gratis tanpa kartu kredit atau biaya tersembunyi."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
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
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200/80 font-bold text-xs px-3 py-1 shadow-2xs"
                    : "bg-slate-100 text-slate-700 border-slate-200 font-bold text-xs px-3 py-1"
                }
              >
                {plan.badge}
              </Badge>
            }
            className={
              plan.highlighted
                ? "rounded-2xl ring-2 ring-indigo-600 border-indigo-600 shadow-md hover:shadow-lg transition-all"
                : "rounded-2xl border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all"
            }
          >
            <div className="space-y-6 pt-1 flex flex-col justify-between h-full">
              <div className="space-y-6">
                <p className="text-4xl font-extrabold tracking-tight text-slate-900">
                  {plan.price}
                </p>
                <ul className="space-y-3.5 text-sm text-slate-600">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-3">
                      <div className="flex size-5.5 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600">
                        <Check className="size-3.5" />
                      </div>
                      <span className="font-medium text-slate-700">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={plan.ctaHref}
                className={
                  plan.highlighted
                    ? "inline-flex h-11.5 w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 text-sm font-semibold text-white shadow-xs hover:from-indigo-700 hover:to-indigo-800 transition-all active:scale-[0.98]"
                    : "inline-flex h-11.5 w-full items-center justify-center rounded-xl border border-slate-200/90 bg-white px-4 text-sm font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition-all active:scale-[0.98]"
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

