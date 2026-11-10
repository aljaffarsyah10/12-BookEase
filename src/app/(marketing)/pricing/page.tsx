import Link from "next/link";
import { Check, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { SUBSCRIPTION_PLANS } from "@/lib/subscription-plans";

const MARKETING_PLANS = [
  {
    ...SUBSCRIPTION_PLANS.STARTER,
    badge: "Solo & Studio",
    ctaLabel: "Mulai dengan Starter",
    ctaHref: "/register",
    highlighted: false,
  },
  {
    ...SUBSCRIPTION_PLANS.PRO,
    badge: "Paling Populer",
    ctaLabel: "Coba Pro Gratis 14 Hari",
    ctaHref: "/register",
    highlighted: true,
  },
  {
    ...SUBSCRIPTION_PLANS.ENTERPRISE,
    badge: "Skala Besar",
    ctaLabel: "Hubungi Penjualan",
    ctaHref: "/register",
    highlighted: false,
  },
];

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3 py-1 text-xs font-bold text-indigo-700 shadow-2xs dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900">
          <Sparkles className="size-3.5" />
          <span>14 Hari Uji Coba Gratis Tanpa Kartu Kredit</span>
        </div>
        <PageHeader
          title="Paket Berlangganan Transparan & Fleksibel"
          description="Pilih paket terbaik untuk bisnis Anda. Tanpa komitmen jangka panjang, batalkan kapan saja."
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 items-stretch">
        {MARKETING_PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col justify-between rounded-3xl p-7 transition-all ${
              plan.highlighted
                ? "border-2 border-indigo-600 bg-white shadow-xl shadow-indigo-500/10 dark:bg-slate-900 dark:border-indigo-500 ring-4 ring-indigo-500/10"
                : "border border-slate-200/90 bg-white shadow-2xs hover:border-slate-300 dark:bg-slate-900/50 dark:border-slate-800"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-1 text-xs font-bold text-white shadow-xs">
                Paling Populer
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <Badge
                    variant="outline"
                    className={
                      plan.highlighted
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200 font-bold text-xs"
                        : "bg-slate-100 text-slate-700 border-slate-200 font-bold text-xs"
                    }
                  >
                    {plan.badge}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 min-h-[36px] leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div>
                <p className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                  {plan.priceFormatted}
                </p>
                <p className="text-xs text-slate-400 mt-1">Ditagih bulanan via Sandbox Gateway</p>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Fitur Termasuk:
                </p>
                <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5">
                      <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 mt-0.5 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-400">
                        <Check className="size-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href={plan.ctaHref}
                className={
                  plan.highlighted
                    ? "inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 text-sm font-semibold text-white shadow-xs hover:from-indigo-700 hover:to-indigo-800 transition-all active:scale-[0.98]"
                    : "inline-flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200/90 bg-white px-4 text-sm font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition-all active:scale-[0.98] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                }
              >
                {plan.ctaLabel}
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Feature Comparison Guarantee */}
      <div className="rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="space-y-1.5">
            <div className="inline-flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Zap className="size-4.5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Aktivasi Instan</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Daftar dalam 2 menit dan dapatkan halaman booking publik yang langsung siap menerima reservasi.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ShieldCheck className="size-4.5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Sandbox Terintegrasi</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Uji seluruh alur pembayaran QRIS, Virtual Account, dan Kartu Kredit secara aman di lingkungan sandbox.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex size-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
              <Sparkles className="size-4.5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tenant Isolation Mutlak</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Data pelanggan dan reservasi dienkripsi dan diisolasi khusus untuk setiap pemilik workspace bisnis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
