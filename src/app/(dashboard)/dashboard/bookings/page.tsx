"use client";

import * as React from "react";
import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  List,
  RotateCcw,
  Search,
  Sparkles,
  X,
  XCircle,
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
import {
  BookingTable,
  type BookingSortField,
} from "@/features/bookings/components/booking-table";
import { bookingApi } from "@/features/bookings/services/booking.api";
import { exportBookingsToCsv } from "@/lib/calendar-export";
import type { Booking, BookingStatus } from "@/types";

export default function BookingsManagementPage() {
  const [viewMode, setViewMode] = React.useState<"table" | "calendar">("table");
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Filters & Search
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | "ALL">(
    "ALL"
  );
  const [dateFilter, setDateFilter] = React.useState("");

  // Sorting
  const [sortBy, setSortBy] = React.useState<BookingSortField>("startAt");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");

  // Multi-selection for bulk actions
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isTodaySelected, setIsTodaySelected] = React.useState(false);

  // Pagination state
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);
  const [totalPages, setTotalPages] = React.useState<number>(1);
  const [totalCount, setTotalCount] = React.useState<number>(0);

  // Single status update modal
  const [pendingAction, setPendingAction] = React.useState<{
    booking: Booking;
    nextStatus: BookingStatus;
  } | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Bulk action confirmation
  const [pendingBulkAction, setPendingBulkAction] = React.useState<
    "CONFIRMED" | "COMPLETED" | "CANCELLED" | null
  >(null);
  const [isBulkUpdating, setIsBulkUpdating] = React.useState(false);

  const reloadBookings = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await bookingApi.listBookings({
        search,
        status: statusFilter,
        date: dateFilter || undefined,
        sortBy,
        sortOrder,
        ...(viewMode === "table" ? { page, limit: pageSize } : {}),
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
  }, [search, statusFilter, dateFilter, sortBy, sortOrder, page, pageSize, viewMode]);

  React.useEffect(() => {
    let active = true;
    bookingApi
      .listBookings({
        search,
        status: statusFilter,
        date: dateFilter || undefined,
        sortBy,
        sortOrder,
        ...(viewMode === "table" ? { page, limit: pageSize } : {}),
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
  }, [search, statusFilter, dateFilter, sortBy, sortOrder, page, pageSize, viewMode]);

  // Handle Sort Change
  const handleSortChange = (field: BookingSortField) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    const allCurrentPageSelected =
      bookings.length > 0 && bookings.every((b) => selectedIds.has(b.id));

    if (allCurrentPageSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        bookings.forEach((b) => next.delete(b.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        bookings.forEach((b) => next.add(b.id));
        return next;
      });
    }
  };

  const handleClearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleResetFilters = () => {
    setIsLoading(true);
    setSearch("");
    setStatusFilter("ALL");
    setDateFilter("");
    setIsTodaySelected(false);
    setPage(1);
  };

  const handleQuickFilter = (type: "ALL" | "TODAY" | BookingStatus) => {
    setIsLoading(true);
    setPage(1);
    if (type === "ALL") {
      setStatusFilter("ALL");
      setDateFilter("");
      setIsTodaySelected(false);
    } else if (type === "TODAY") {
      const today = new Date().toISOString().split("T")[0];
      setDateFilter(today);
      setStatusFilter("ALL");
      setIsTodaySelected(true);
    } else {
      setStatusFilter(type);
      setDateFilter("");
      setIsTodaySelected(false);
    }
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

  // Bulk Status Update
  const handleExecuteBulkUpdate = async () => {
    if (!pendingBulkAction || selectedIds.size === 0) return;
    setIsBulkUpdating(true);
    try {
      const ids = Array.from(selectedIds);
      const res = await bookingApi.updateBulkStatus(ids, pendingBulkAction);
      toast.success(
        `Berhasil memperbarui ${res.updatedCount} dari ${ids.length} reservasi yang dipilih!`
      );
      setPendingBulkAction(null);
      setSelectedIds(new Set());
      await reloadBookings();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal melakukan aksi massal."
      );
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleExportSelected = () => {
    const selectedBookings = bookings.filter((b) => selectedIds.has(b.id));
    if (selectedBookings.length === 0) {
      toast.error("Tidak ada reservasi yang dipilih.");
      return;
    }
    exportBookingsToCsv(selectedBookings, `bookease-terpilih-${selectedBookings.length}`);
    toast.success(`${selectedBookings.length} reservasi berhasil diekspor ke CSV!`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daftar Reservasi"
        description="Kelola seluruh reservasi pelanggan, filter jadwal harian, aksi massal, dan perbarui kehadiran."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                exportBookingsToCsv(bookings, "bookease-semua");
                toast.success("Data reservasi berhasil diekspor ke CSV!");
              }}
              disabled={bookings.length === 0}
              className="gap-1.5 h-8.5 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              <Download className="size-3.5 text-slate-500" />
              <span>Export CSV</span>
            </Button>

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
          </div>
        }
      />

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => handleQuickFilter("ALL")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            statusFilter === "ALL" && !dateFilter
              ? "bg-indigo-600 text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua ({totalCount})
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter("TODAY")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            isTodaySelected
              ? "bg-indigo-600 text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <CalendarDays className="size-3" />
          Hari Ini
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter("PENDING")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            statusFilter === "PENDING"
              ? "bg-amber-600 text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Clock className="size-3 text-amber-500" />
          Menunggu
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter("CONFIRMED")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            statusFilter === "CONFIRMED"
              ? "bg-blue-600 text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <CheckCircle2 className="size-3 text-blue-500" />
          Terkonfirmasi
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter("COMPLETED")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            statusFilter === "COMPLETED"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Sparkles className="size-3 text-emerald-500" />
          Selesai
        </button>
        <button
          type="button"
          onClick={() => handleQuickFilter("CANCELLED")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            statusFilter === "CANCELLED"
              ? "bg-rose-600 text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <XCircle className="size-3 text-rose-500" />
          Dibatalkan
        </button>
      </div>

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
                setIsTodaySelected(false);
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

      {/* Floating / Sticky Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-20 z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-indigo-200/80 bg-gradient-to-r from-indigo-50/95 via-white/95 to-indigo-50/95 px-5 py-3 shadow-lg shadow-indigo-500/10 backdrop-blur-md animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <span className="flex size-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-2xs">
              {selectedIds.size}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-900">
              {selectedIds.size} reservasi dipilih
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setPendingBulkAction("CONFIRMED")}
              className="gap-1.5 h-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Konfirmasi Massal</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setPendingBulkAction("COMPLETED")}
              className="gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
            >
              <Sparkles className="size-3.5" />
              <span>Selesai Massal</span>
            </Button>

            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPendingBulkAction("CANCELLED")}
              className="gap-1.5 h-8 text-rose-600 border-rose-200/80 hover:bg-rose-50 text-xs font-medium"
            >
              <XCircle className="size-3.5" />
              <span>Batalkan Massal</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportSelected}
              className="gap-1.5 h-8 text-slate-700 text-xs font-medium"
            >
              <Download className="size-3.5" />
              <span>Export Terpilih</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearSelection}
              className="size-8 p-0 text-slate-400 hover:text-slate-700"
              title="Batalkan Pilihan"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Bookings View: Table or Calendar */}
      {isLoading ? (
        <LoadingState variant="table" count={5} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Tidak Ada Reservasi yang Sesuai"
          description="Belum ada data reservasi untuk filter pencarian, status, atau tanggal yang dipilih."
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
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onSelectAll={handleSelectAll}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />

          {/* Pagination Controls & Page Size Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-xs text-slate-600 shadow-2xs">
            <div className="flex items-center gap-3">
              <div>
                Menampilkan{" "}
                <span className="font-semibold text-slate-900">
                  {totalCount === 0 ? 0 : (page - 1) * pageSize + 1}
                </span>{" "}
                –{" "}
                <span className="font-semibold text-slate-900">
                  {Math.min(page * pageSize, totalCount)}
                </span>{" "}
                dari{" "}
                <span className="font-semibold text-slate-900">{totalCount}</span>{" "}
                reservasi
              </div>

              <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-200">
                <span>Per halaman:</span>
                <select
                  aria-label="Jumlah reservasi per halaman"
                  value={pageSize}
                  onChange={(e) => {
                    setIsLoading(true);
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
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
                {page} / {Math.max(1, totalPages)}
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
        </div>
      )}

      {/* Single status update dialog */}
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

      {/* Bulk status update dialog */}
      <ConfirmDialog
        open={!!pendingBulkAction}
        onOpenChange={(open) => !open && setPendingBulkAction(null)}
        title={`Perbarui ${selectedIds.size} Reservasi ke ${pendingBulkAction}?`}
        description={
          pendingBulkAction === "CANCELLED"
            ? `Sebanyak ${selectedIds.size} reservasi yang dipilih akan dibatalkan secara bersamaan. Reservasi yang sudah selesai atau sudah dibatalkan tidak akan terpengaruh.`
            : `Sebanyak ${selectedIds.size} reservasi yang dipilih akan diubah statusnya menjadi ${pendingBulkAction}.`
        }
        confirmLabel={`Ya, Ubah ${selectedIds.size} Reservasi`}
        variant={
          pendingBulkAction === "CANCELLED" ? "destructive" : "default"
        }
        isLoading={isBulkUpdating}
        onConfirm={handleExecuteBulkUpdate}
      />
    </div>
  );
}
