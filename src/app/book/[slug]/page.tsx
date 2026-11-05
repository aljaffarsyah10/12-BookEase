import { Suspense } from "react";
import Link from "next/link";
import { CalendarCheck, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionCard } from "@/components/shared/section-card";

async function PublicBookingContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
        {/* Business Identity Header */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <CalendarCheck className="size-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 capitalize">
                  {slug.replace(/-/g, " ")}
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4 text-slate-400" />
                  Jl. Sudirman No. 45, Jakarta
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-slate-400" />
                  Zona Waktu: Asia/Jakarta (WIB)
                </span>
              </div>
            </div>
            <Badge
              variant="outline"
              className="w-fit bg-emerald-50 text-emerald-700 border-emerald-200"
            >
              Menerima Reservasi Online
            </Badge>
          </div>
        </div>

        {/* 2-Column Booking Wizard Shell */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <SectionCard
              title="Langkah 1 — Pilih Layanan"
              description="Pilih layanan yang ingin Anda pesan untuk melihat jadwal tersedia."
            >
              <p className="text-sm text-slate-600">
                Kerangka halaman Booking Wizard publik untuk bisnis{" "}
                <span className="font-mono font-semibold text-slate-900">
                  {slug}
                </span>
                . Interaksi penuh akan diimplementasikan pada Phase 5.
              </p>
            </SectionCard>
          </div>

          <div className="lg:col-span-4">
            <SectionCard
              title="Ringkasan Reservasi"
              description="Detail pilihan jadwal Anda."
            >
              <div className="space-y-3 text-sm text-slate-600">
                <p>Belum ada layanan yang dipilih.</p>
                <Link
                  href={`/book/${slug}/success`}
                  className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Pratinjau Halaman Konfirmasi
                </Link>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl p-6">
          <LoadingState variant="detail" />
        </div>
      }
    >
      <PublicBookingContent params={params} />
    </Suspense>
  );
}

