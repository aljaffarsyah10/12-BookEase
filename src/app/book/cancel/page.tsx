"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionCard } from "@/components/shared/section-card";
import { bookingApi } from "@/features/bookings/services/booking.api";
import { ApiClientError } from "@/lib/api-client";
import { formatDateId } from "@/lib/format";
import type { Booking } from "@/types";

function CustomerCancellationView() {
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref") || "";
  const token = searchParams.get("token") || "";

  const [booking, setBooking] = React.useState<Booking | null>(null);
  const [isLoading, setIsLoading] = React.useState(Boolean(ref));
  const [loadError, setLoadError] = React.useState<string | null>(
    !ref ? "Kode referensi tidak ditemukan pada tautan." : null
  );

  const [reason, setReason] = React.useState("");
  const [isCancelling, setIsCancelling] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    if (!ref) {
      return;
    }

    bookingApi
      .getBookingByReference(ref)
      .then((data) => {
        if (!active) return;
        setBooking(data);
        setIsLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(
          err instanceof Error
            ? err.message
            : "Data reservasi tidak dapat dimuat."
        );
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ref]);

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref || !token) {
      toast.error("Tautan pembatalan tidak lengkap (ref atau token hilang).");
      return;
    }

    setIsCancelling(true);
    try {
      const updated = await bookingApi.customerCancel({
        reference: ref,
        token,
        reason: reason || undefined,
      });
      setBooking(updated);
      setIsSuccess(true);
      toast.success("Reservasi berhasil dibatalkan.");
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error("Gagal membatalkan reservasi", {
          description: err.message,
        });
      } else {
        toast.error("Terjadi kesalahan saat memproses pembatalan.");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg p-6">
        <LoadingState variant="detail" />
      </div>
    );
  }

  if (loadError || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md">
          <SectionCard>
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <XCircle className="size-6" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">
                Tautan Tidak Valid
              </h1>
              <p className="text-xs text-slate-600">
                {loadError || "Data reservasi tidak ditemukan."}
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Kembali ke Beranda
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  if (isSuccess || booking.status === "CANCELLED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md">
          <SectionCard>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex size-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <CheckCircle2 className="size-8" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-bold text-slate-900">
                  Reservasi Dibatalkan
                </h1>
                <p className="text-xs text-slate-600">
                  Reservasi dengan kode referensi{" "}
                  <strong className="font-mono text-slate-800">
                    {booking.reference}
                  </strong>{" "}
                  telah berhasil dibatalkan.
                </p>
              </div>

              <div className="w-full rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Layanan:</span>
                  <span className="font-semibold text-slate-800">
                    {booking.serviceNameSnapshot}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Staf:</span>
                  <span className="font-medium text-slate-700">
                    {booking.staffName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Jadwal:</span>
                  <span className="font-medium text-slate-700">
                    {formatDateId(booking.date)} • {booking.time}
                  </span>
                </div>
                {booking.cancelReason && (
                  <div className="flex justify-between border-t border-slate-200 pt-2">
                    <span className="text-slate-500">Alasan:</span>
                    <span className="italic text-slate-700">
                      {booking.cancelReason}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500">
                Slot waktu ini telah dibuka kembali dalam sistem. Jika Anda ingin
                menjadwalkan ulang di waktu lain, Anda dapat membuat reservasi baru.
              </p>

              <Link
                href="/"
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Selesai
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/75 px-4 py-12">
      <div className="w-full max-w-lg">
        <SectionCard
          title="Batalkan Reservasi"
          description="Konfirmasi pembatalan reservasi janji temu Anda."
        >
          <div className="space-y-5">
            <div className="rounded-xl border border-amber-200/90 bg-amber-50/70 p-4 flex items-start gap-3.5">
              <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">
                  Apakah Anda yakin ingin membatalkan jadwal ini?
                </p>
                <p className="leading-relaxed">
                  Pembatalan bersifat permanen. Slot waktu yang Anda lepaskan akan dibuka kembali untuk pelanggan lain.
                </p>
              </div>
            </div>

            {/* Booking Summary Box */}
            <div className="rounded-xl border border-slate-200/90 bg-slate-50/75 p-4.5 space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Kode Referensi:</span>
                <span className="font-mono font-bold text-indigo-700">
                  {booking.reference}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Nama Pelanggan:</span>
                <span className="font-semibold text-slate-800">
                  {booking.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Layanan:</span>
                <span className="font-semibold text-slate-800">
                  {booking.serviceNameSnapshot}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Staf:</span>
                <span className="font-medium text-slate-700">
                  {booking.staffName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Jadwal:</span>
                <span className="font-medium text-slate-900">
                  {formatDateId(booking.date)} pukul {booking.time} WIB
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="cancel-reason">
                  Alasan Pembatalan (Opsional)
                </Label>
                <Input
                  id="cancel-reason"
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Contoh: Ada keperluan mendesak / jadwal bentrok"
                  className="text-xs sm:text-sm h-10"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isCancelling}
                  className="flex-1 gap-2 text-xs sm:text-sm font-semibold h-10 shadow-2xs"
                >
                  {isCancelling && <Loader2 className="size-4 animate-spin" />}
                  <span>
                    {isCancelling
                      ? "Membatalkan..."
                      : "Ya, Batalkan Reservasi Saya"}
                  </span>
                </Button>
                <Link
                  href="/"
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-200/90 bg-white px-4 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
                >
                  Kembali
                </Link>
              </div>
            </form>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default function CustomerCancellationPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg p-6">
          <LoadingState variant="detail" />
        </div>
      }
    >
      <CustomerCancellationView />
    </Suspense>
  );
}
