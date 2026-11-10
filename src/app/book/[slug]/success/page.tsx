"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarPlus, CheckCircle2, Copy, Download, MessageSquareShare } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { bookingApi } from "@/features/bookings/services/booking.api";
import {
  downloadIcsFile,
  generateGoogleCalendarUrl,
  generateWhatsAppReminderUrl,
} from "@/lib/calendar-export";
import { formatDateId, formatDuration, formatRupiah } from "@/lib/format";
import type { Booking } from "@/types";

function BookingSuccessView({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref") ?? "BK-20261106-8F92A1";

  const [booking, setBooking] = React.useState<Booking | null>(null);

  React.useEffect(() => {
    let active = true;
    bookingApi.getBookingByReference(refParam).then((data) => {
      if (!active) return;
      setBooking(data);
    });
    return () => {
      active = false;
    };
  }, [refParam]);

  const handleCopyReference = () => {
    const code = booking?.reference ?? refParam;
    navigator.clipboard.writeText(code);
    toast.success("Kode referensi berhasil disalin!", { description: code });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/75 px-4 py-12">
      <div className="w-full max-w-lg">
        <SectionCard>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex size-15 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-2xs">
              <CheckCircle2 className="size-8" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Reservasi Berhasil Dibuat!
              </h1>
              <p className="text-sm text-slate-600">
                Simpan kode referensi berikut sebagai bukti reservasi resmi Anda.
              </p>
            </div>

            {/* Reference Code Box */}
            <div className="w-full rounded-xl border border-indigo-200/90 bg-indigo-50/60 px-4.5 py-3.5 flex items-center justify-between shadow-2xs">
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kode Referensi Reservasi</p>
                <p className="mt-0.5 font-mono text-xl font-bold tracking-wider text-indigo-700">
                  {booking?.reference ?? refParam}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopyReference}
                className="gap-1.5 text-xs h-8.5 font-semibold text-indigo-700 border-indigo-200 bg-white hover:bg-indigo-50"
              >
                <Copy className="size-3.5" />
                <span>Salin</span>
              </Button>
            </div>

            {/* Booking Details Summary */}
            {booking && (
              <div className="w-full rounded-xl border border-slate-200/80 bg-slate-50/70 p-4.5 text-left space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Status</span>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Pelanggan</span>
                  <span className="font-semibold text-slate-900">
                    {booking.customerName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Layanan</span>
                  <span className="font-semibold text-slate-900">
                    {booking.serviceNameSnapshot} (
                    {formatDuration(booking.durationMinutesSnapshot)})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Staf Penyedia</span>
                  <span className="font-medium text-slate-800">
                    {booking.staffName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Jadwal</span>
                  <span className="font-mono text-xs font-semibold text-slate-900">
                    {formatDateId(booking.date)} • {booking.time} WIB
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5">
                  <span className="font-bold text-slate-900">Total Biaya</span>
                  <span className="font-bold text-base text-indigo-600">
                    {formatRupiah(booking.servicePriceSnapshot)}
                  </span>
                </div>
              </div>
            )}

            {/* Calendar & Share Integration */}
            {booking && (
              <div className="w-full space-y-2 pt-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-left">
                  Simpan Jadwal ke Kalender
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <a
                    href={generateGoogleCalendarUrl(
                      booking,
                      booking.serviceNameSnapshot,
                      "Glow Beauty Studio"
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-colors"
                  >
                    <CalendarPlus className="size-3.5 text-indigo-600" />
                    <span>Google Calendar</span>
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      downloadIcsFile(
                        booking,
                        booking.serviceNameSnapshot,
                        "Glow Beauty Studio"
                      )
                    }
                    className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="size-3.5 text-slate-500" />
                    <span>Apple / Outlook (.ics)</span>
                  </button>
                </div>
                <a
                  href={generateWhatsAppReminderUrl(
                    booking,
                    "Glow Beauty Studio",
                    "Jl. Jenderal Sudirman No. 45, Jakarta Selatan"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-200/80 bg-emerald-50/80 px-3 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/80 shadow-2xs transition-colors"
                >
                  <MessageSquareShare className="size-3.5 text-emerald-600" />
                  <span>Kirim Rincian Reservasi ke WhatsApp Saya</span>
                </a>
              </div>
            )}

            <div className="flex flex-col sm:flex-row w-full gap-2.5 pt-3 border-t border-slate-100">
              <Link
                href={`/book/${slug}`}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700 shadow-2xs transition-colors"
              >
                Buat Reservasi Lain
              </Link>
              <Link
                href="/dashboard/bookings"
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200/90 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
              >
                Buka Dashboard
              </Link>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

async function BookingSuccessSlugResolver({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BookingSuccessView slug={slug} />;
}

export default function BookingSuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg p-6">
          <LoadingState variant="detail" />
        </div>
      }
    >
      <BookingSuccessSlugResolver params={params} />
    </Suspense>
  );
}
