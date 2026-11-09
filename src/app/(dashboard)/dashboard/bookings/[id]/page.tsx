"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCheck,
  CheckCircle2,
  Mail,
  Phone,
  Sparkles,
  UserX,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { bookingApi } from "@/features/bookings/services/booking.api";
import { formatDateId, formatDuration, formatRupiah } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types";

function BookingDetailView({ bookingId }: { bookingId: string }) {
  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [targetStatus, setTargetStatus] = React.useState<BookingStatus | null>(
    null
  );
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    bookingApi.getBookingById(bookingId).then((found) => {
      if (!active) return;
      setBooking(found);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [bookingId]);

  const handleConfirmTransition = async () => {
    if (!booking || !targetStatus) return;
    setIsUpdating(true);
    const updated = await bookingApi.updateBookingStatus(
      booking.id,
      targetStatus
    );
    setBooking(updated);
    setIsUpdating(false);
    setTargetStatus(null);
    toast.success(`Status reservasi berhasil diubah ke ${updated.status}`);
  };

  if (isLoading) {
    return <LoadingState variant="detail" />;
  }

  if (!booking) {
    return (
      <ErrorState
        title="Reservasi Tidak Ditemukan"
        message={`Tidak ditemukan data reservasi dengan ID "${bookingId}".`}
      />
    );
  }

  const canTransition =
    booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Reservasi ${booking.reference}`}
        description={`Dibuat pada ${formatDateId(booking.createdAt.slice(0, 10))}`}
        badge={<StatusBadge status={booking.status} />}
        actions={
          <Link
            href="/dashboard/bookings"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke Daftar</span>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Customer & Service Details */}
        <div className="space-y-6 lg:col-span-2">
          <SectionCard
            title="Informasi Layanan & Jadwal"
            description="Detail layanan dan harga pada saat pelanggan melakukan reservasi."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-200/70 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-indigo-600" />
                  Layanan Dipesan
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {booking.serviceNameSnapshot}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-semibold text-sm text-indigo-600 bg-indigo-50/80 px-2.5 py-1 rounded-md">
                    {formatRupiah(booking.servicePriceSnapshot)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {formatDuration(booking.durationMinutesSnapshot)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50/80 p-4 border border-slate-200/70 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-indigo-600" />
                  Waktu & Staf Penyedia
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {formatDateId(booking.date)}
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-700 font-medium">
                  <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-indigo-700 font-semibold">
                    {booking.time} WIB
                  </span>
                  <span>•</span>
                  <span>Staf: <strong className="text-slate-900">{booking.staffName}</strong></span>
                </div>
              </div>
            </div>

            {booking.cancelReason && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-800">
                <span className="font-bold">Alasan Pembatalan:</span>{" "}
                {booking.cancelReason}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Informasi Kontak Pelanggan"
            description="Data pelanggan bersifat privat untuk keperluan operasional."
          >
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 font-bold text-base">
                {booking.customerName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {booking.customerName}
                </h4>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {booking.id.slice(0, 12)}...
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-4 text-sm">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-slate-400" />
                  Alamat Email
                </p>
                <p className="font-medium text-slate-900 break-all">
                  {booking.customerEmail}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-slate-400" />
                  Nomor WhatsApp / Telepon
                </p>
                <p className="font-mono font-semibold text-slate-900">
                  {booking.customerPhone}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500">
                Catatan dari Pelanggan:
              </p>
              <div className="mt-1.5 rounded-lg bg-slate-50 p-3 text-xs text-slate-700 leading-relaxed border border-slate-200/50">
                {booking.customerNotes || "Tidak ada catatan khusus dari pelanggan."}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Status Actions */}
        <div>
          <SectionCard
            title="Tindakan Status"
            description="Perbarui status reservasi sesuai kehadiran pelanggan."
          >
            {canTransition ? (
              <div className="flex flex-col gap-2.5">
                {booking.status === "PENDING" && (
                  <Button
                    type="button"
                    onClick={() => setTargetStatus("CONFIRMED")}
                    className="w-full justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Konfirmasi Reservasi</span>
                  </Button>
                )}

                {booking.status === "CONFIRMED" && (
                  <>
                    <Button
                      type="button"
                      onClick={() => setTargetStatus("COMPLETED")}
                      className="w-full justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    >
                      <CheckCheck className="size-4" />
                      <span>Tandai Selesai</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTargetStatus("NO_SHOW")}
                      className="w-full justify-center gap-2 text-slate-700 font-medium"
                    >
                      <UserX className="size-4" />
                      <span>Tandai Tidak Hadir (NO_SHOW)</span>
                    </Button>
                  </>
                )}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTargetStatus("CANCELLED")}
                  className="w-full justify-center gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 font-medium"
                >
                  <XCircle className="size-4" />
                  <span>Batalkan Reservasi</span>
                </Button>
              </div>
            ) : (
              <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-200/60">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Reservasi ini berada pada status terminal (
                  <span className="font-semibold text-slate-800">
                    {booking.status}
                  </span>
                  ) dan disimpan permanen sebagai arsip catatan operasional.
                </p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>

      <ConfirmDialog
        open={!!targetStatus}
        onOpenChange={(open) => !open && setTargetStatus(null)}
        title={`Konfirmasi Perubahan Status ke ${targetStatus}`}
        description={`Apakah Anda yakin ingin mengubah status reservasi ${booking.reference} menjadi ${targetStatus}?`}
        confirmLabel="Ya, Simpan Status"
        variant={targetStatus === "CANCELLED" ? "destructive" : "default"}
        isLoading={isUpdating}
        onConfirm={handleConfirmTransition}
      />
    </div>
  );
}

async function BookingDetailParamResolver({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <BookingDetailView bookingId={id} />;
}

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState variant="detail" />}>
      <BookingDetailParamResolver params={params} />
    </Suspense>
  );
}
