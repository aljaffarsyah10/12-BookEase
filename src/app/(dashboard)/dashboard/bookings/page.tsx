"use client";

import * as React from "react";
import { CalendarDays, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { BookingTable } from "@/features/bookings/components/booking-table";
import { bookingApi } from "@/features/bookings/services/booking.api";
import type { Booking, BookingStatus } from "@/types";

export default function BookingsManagementPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "ALL">(
    "ALL",
  );
  const [dateFilter, setDateFilter] = React.useState("");

  const [pendingAction, setPendingAction] = React.useState<{
    booking: Booking;
    nextStatus: BookingStatus;
  } | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const reloadBookings = React.useCallback(async () => {
    setIsLoading(true);
    const data = await bookingApi.listBookings({
      search,
      status: statusFilter,
      date: dateFilter || undefined,
    });
    setBookings(data);
    setIsLoading(false);
  }, [search, statusFilter, dateFilter]);

  React.useEffect(() => {
    let active = true;
    bookingApi
      .listBookings({
        search,
        status: statusFilter,
        date: dateFilter || undefined,
      })
      .then((data) => {
        if (active) {
          setBookings(data);
          setIsLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [search, statusFilter, dateFilter]);

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDateFilter("");
  };

  const handleConfirmStatusUpdate = async () => {
    if (!pendingAction) return;
    setIsUpdating(true);
    const updated = await bookingApi.updateBookingStatus(
      pendingAction.booking.id,
      pendingAction.nextStatus,
    );
    toast.success(
      `Status reservasi ${updated.reference} diperbarui menjadi ${updated.status}`,
    );
    setIsUpdating(false);
    setPendingAction(null);
    await reloadBookings();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Reservasi (Bookings)"
        description="Kelola semua reservasi pelanggan, filter jadwal harian, dan perbarui status kehadiran."
      />

      {/* Filter Bar */}
      <SectionCard contentClassName="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="relative sm:col-span-5">
            <Search className="pointer-events-none absolute top-2.5 left-3 size-4 text-slate-400" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama pelanggan, telepon, atau kode BK-..."
              className="pl-9"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              aria-label="Filter Status Reservasi"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as BookingStatus | "ALL")
              }
              className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu Konfirmasi (PENDING)</option>
              <option value="CONFIRMED">Terkonfirmasi (CONFIRMED)</option>
              <option value="COMPLETED">Selesai (COMPLETED)</option>
              <option value="CANCELLED">Dibatalkan (CANCELLED)</option>
              <option value="NO_SHOW">Tidak Hadir (NO_SHOW)</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <Input
              type="date"
              aria-label="Filter Tanggal Reservasi"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div className="sm:col-span-1 flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilters}
              title="Reset Filter"
              className="w-full sm:w-auto"
            >
              <RotateCcw className="size-4" />
              <span className="sm:hidden ml-2">Reset Filter</span>
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Bookings List / Table */}
      {isLoading ? (
        <LoadingState variant="table" count={5} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Tidak Ada Reservasi yang Sesuai"
          description="Belum ada data reservasi untuk filter pencarian atau tanggal yang dipilih."
          action={
            <Button variant="outline" onClick={handleResetFilters}>
              Tampilkan Semua Reservasi
            </Button>
          }
        />
      ) : (
        <BookingTable
          bookings={bookings}
          onRequestStatusChange={(booking, nextStatus) =>
            setPendingAction({ booking, nextStatus })
          }
        />
      )}

      <ConfirmDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={`Ubah Status ke ${pendingAction?.nextStatus}?`}
        description={
          pendingAction?.nextStatus === "CANCELLED"
            ? `Reservasi ${pendingAction.booking.reference} atas nama ${pendingAction.booking.customerName} akan dibatalkan. Data tidak dihapus dari histori dan slot waktu akan dibuka kembali.`
            : `Konfirmasi perubahan status reservasi ${pendingAction?.booking.reference} (${pendingAction?.booking.customerName}) menjadi ${pendingAction?.nextStatus}.`
        }
        confirmLabel="Ya, Perbarui Status"
        variant={
          pendingAction?.nextStatus === "CANCELLED" ? "destructive" : "default"
        }
        isLoading={isUpdating}
        onConfirm={handleConfirmStatusUpdate}
      />
    </div>
  );
}
