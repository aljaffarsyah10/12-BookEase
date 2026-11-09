"use client";

import * as React from "react";
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  List,
  RotateCcw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { BookingCalendarView } from "@/features/bookings/components/booking-calendar-view";
import { BookingTable } from "@/features/bookings/components/booking-table";
import { bookingApi } from "@/features/bookings/services/booking.api";
import type { Booking, BookingStatus } from "@/types";

export default function BookingsManagementPage() {
  const [viewMode, setViewMode] = React.useState<"table" | "calendar">("table");
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "ALL">(
    "ALL"
  );
  const [dateFilter, setDateFilter] = React.useState("");

  // Pagination state
  const [page, setPage] = React.useState<number>(1);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [totalCount, setTotalCount] = React.useState<number>(0);

  const [pendingAction, setPendingAction] = React.useState<{
    booking: Booking;
    nextStatus: BookingStatus;
  } | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  const reloadBookings = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await bookingApi.listBookings({
        search,
        status: statusFilter,
        date: dateFilter || undefined,
        ...(viewMode === "table" ? { page, limit: 10 } : {}),
      });

      if (Array.isArray(res)) {
        setBookings(res);
        setTotalCount(res.length);
        setTotalPages(1);
      } else {
        setBookings(res.items);
        setTotalCount(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, dateFilter, page, viewMode]);

  React.useEffect(() => {
    let active = true;
    bookingApi
      .listBookings({
        search,
        status: statusFilter,
        date: dateFilter || undefined,
        ...(viewMode === "table" ? { page, limit: 10 } : {}),
      })
      .then((res) => {
        if (!active) return;
        if (Array.isArray(res)) {
          setBookings(res);
          setTotalCount(res.length);
          setTotalPages(1);
        } else {
          setBookings(res.items);
          setTotalCount(res.pagination.total);
          setTotalPages(res.pagination.totalPages);
        }
      })
      .catch((err) => {
        console.error("Failed to load bookings:", err);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [search, statusFilter, dateFilter, page, viewMode]);

  const handleResetFilters = () => {
    setIsLoading(true);
    setSearch("");
    setStatusFilter("ALL");
    setDateFilter("");
    setPage(1);
  };

  const handleConfirmStatusUpdate = async () => {
    if (!pendingAction) return;
    setIsUpdating(true);
    try {
      const updated = await bookingApi.updateBookingStatus(
        pendingAction.booking.id,
        pendingAction.nextStatus
      );
      toast.success(
        `Status reservasi ${updated.reference} diperbarui menjadi ${updated.status}`
      );
      setPendingAction(null);
      await reloadBookings();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal memperbarui status reservasi."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Reservasi"
        description="Kelola seluruh reservasi pelanggan, filter jadwal harian, dan perbarui status kehadiran."
        actions={
          <div className="inline-flex items-center rounded-lg border border-slate-200/90 bg-slate-100/80 p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List className="size-3.5" />
              <span>Tabel</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                viewMode === "calendar"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CalendarRange className="size-3.5" />
              <span>Kalender</span>
            </button>
          </div>
        }
      />

      {/* Filter Bar */}
      <SectionCard contentClassName="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="relative sm:col-span-5">
            <Search className="pointer-events-none absolute top-3 left-3.5 size-4 text-slate-400" />
            <Input
              type="search"
              value={search}
              onChange={(e) => {
                setIsLoading(true);
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari nama, email, telepon, atau ref BK-..."
              className="pl-10 h-10 text-sm"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              aria-label="Filter Status Reservasi"
              value={statusFilter}
              onChange={(e) => {
                setIsLoading(true);
                setStatusFilter(e.target.value as BookingStatus | "ALL");
                setPage(1);
              }}
              className="h-10 w-full rounded-lg border border-slate-200/90 bg-white px-3.5 text-xs sm:text-sm font-medium text-slate-800 shadow-2xs transition-colors focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 focus:outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Menunggu (PENDING)</option>
              <option value="CONFIRMED">Dikonfirmasi (CONFIRMED)</option>
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
              onChange={(e) => {
                setIsLoading(true);
                setDateFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 text-sm"
            />
          </div>

          <div className="sm:col-span-1 flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetFilters}
              title="Reset Filter"
              className="w-full sm:w-auto h-10 px-3 text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className="size-4" />
              <span className="sm:hidden ml-2 text-xs">Reset</span>
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* Bookings View: Table or Calendar */}
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
      ) : viewMode === "calendar" ? (
        <BookingCalendarView
          bookings={bookings}
          onRequestStatusChange={(booking, nextStatus) =>
            setPendingAction({ booking, nextStatus })
          }
        />
      ) : (
        <div className="space-y-4">
          <BookingTable
            bookings={bookings}
            onRequestStatusChange={(booking, nextStatus) =>
              setPendingAction({ booking, nextStatus })
            }
          />

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-xs text-slate-600 shadow-2xs">
              <div>
                Menampilkan{" "}
                <span className="font-semibold text-slate-900">
                  {(page - 1) * 10 + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(page * 10, totalCount)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-900">{totalCount}</span>{" "}
                reservasi
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => {
                    setIsLoading(true);
                    setPage((p) => Math.max(1, p - 1));
                  }}
                  className="gap-1 h-8 text-xs"
                >
                  <ChevronLeft className="size-3.5" />
                  <span>Sebelumnya</span>
                </Button>
                <span className="px-2 font-medium">
                  {page} / {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => {
                    setIsLoading(true);
                    setPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className="gap-1 h-8 text-xs"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={`Ubah Status ke ${pendingAction?.nextStatus}?`}
        description={
          pendingAction?.nextStatus === "CANCELLED"
            ? `Reservasi ${pendingAction.booking.reference} atas nama ${pendingAction.booking.customerName} akan dibatalkan. Slot waktu akan dibuka kembali.`
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
