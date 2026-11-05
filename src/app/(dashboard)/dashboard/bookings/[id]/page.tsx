"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCheck,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  Sparkles,
  User,
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
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
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
            description="Snapshot layanan dan harga pada saat pelanggan melakukan reservasi."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/70 space-y-1">
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-indigo-600" />
                  Layanan Dipesan
                </p>
                <p className="text-base font-semibold text-slate-900">
                  {booking.serviceNameSnapshot}
                </p>
                <p className="text-sm font-bold text-indigo-600">
                  {formatRupiah(booking.servicePriceSnapshot)} •{" "}
                  {formatDuration(booking.durationMinutesSnapshot)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4 border border-slate-200/70 space-y-1">
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-indigo-600" />
                  Jadwal & Staf Penyedia
                </p>
                <p className="text-base font-semibold text-slate-900">
                  {formatDateId(booking.date)}
                </p>
                <p className="text-sm text-slate-700 font-mono flex items-center gap-1.5">
                  <Clock className="size-3.5 text-slate-400" />
                  {booking.time} WIB • Staf: {booking.staffName}
                </p>
              </div>
            </div>

            {booking.cancelReason && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50/70 p-3.5 text-xs text-red-700">
                <span className="font-semibold">Alasan Pembatalan:</span>{" "}
                {booking.cancelReason}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Informasi Kontak Pelanggan"
            description="Data ini bersifat privat dan hanya dapat diakses oleh pemilik bisnis."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-sm">
              <div className="space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <User className="size-3.5 text-slate-400" />
                  Nama Pelanggan
                </p>
                <p className="font-semibold text-slate-900">
                  {booking.customerName}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Mail className="size-3.5 text-slate-400" />
                  Email
                </p>
                <p className="font-medium text-slate-800 break-all">
                  {booking.customerEmail}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Phone className="size-3.5 text-slate-400" />
                  Nomor Telepon
                </p>
                <p className="font-mono font-medium text-slate-800">
                  {booking.customerPhone}
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium text-slate-500">
                Catatan Pelanggan:
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {booking.customerNotes || "Tidak ada catatan khusus."}
              </p>
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Status Actions */}
        <div>
          <SectionCard
            title="Tindakan Status Reservasi"
            description="Perbarui status reservasi sesuai kehadiran pelanggan."
          >
            {canTransition ? (
              <div className="flex flex-col gap-2.5">
                {booking.status === "PENDING" && (
                  <Button
                    type="button"
                    onClick={() => setTargetStatus("CONFIRMED")}
                    className="w-full justify-start gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Konfirmasi Reservasi (CONFIRMED)</span>
                  </Button>
                )}

                {booking.status === "CONFIRMED" && (
                  <>
                    <Button
                      type="button"
                      onClick={() => setTargetStatus("COMPLETED")}
                      className="w-full justify-start gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCheck className="size-4" />
                      <span>Tandai Selesai (COMPLETED)</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTargetStatus("NO_SHOW")}
                      className="w-full justify-start gap-2 text-slate-700"
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
                  className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <XCircle className="size-4" />
                  <span>Batalkan Reservasi (CANCELLED)</span>
                </Button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 leading-relaxed">
                Reservasi ini berada pada status terminal (
                <span className="font-semibold text-slate-700">
                  {booking.status}
                </span>
                ) dan disimpan sebagai arsip histori operasional bisnis.
              </p>
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
