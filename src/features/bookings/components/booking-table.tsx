"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Check,
  Eye,
  MessageSquareShare,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { generateWhatsAppReminderUrl } from "@/lib/calendar-export";
import { formatDateId, formatDuration, formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Booking, BookingStatus } from "@/types";

export type BookingSortField =
  | "startAt"
  | "customerName"
  | "servicePriceSnapshot"
  | "status";

interface BookingTableProps {
  bookings: Booking[];
  onRequestStatusChange: (booking: Booking, nextStatus: BookingStatus) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onSelectAll?: () => void;
  sortBy?: BookingSortField;
  sortOrder?: "asc" | "desc";
  onSortChange?: (field: BookingSortField) => void;
}

export function BookingTable({
  bookings,
  onRequestStatusChange,
  selectedIds = new Set(),
  onToggleSelect,
  onSelectAll,
  sortBy = "startAt",
  sortOrder = "desc",
  onSortChange,
}: BookingTableProps) {
  const isAllSelected =
    bookings.length > 0 && bookings.every((b) => selectedIds.has(b.id));
  const isPartiallySelected =
    bookings.some((b) => selectedIds.has(b.id)) && !isAllSelected;

  const renderSortIndicator = (field: BookingSortField) => {
    if (sortBy !== field) {
      return (
        <ArrowUpDown className="size-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="size-3 text-indigo-600" />
    ) : (
      <ArrowDown className="size-3 text-indigo-600" />
    );
  };

  return (
    <div>
      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {bookings.map((b) => {
          const isSelected = selectedIds.has(b.id);
          return (
            <div
              key={b.id}
              className={cn(
                "rounded-2xl border bg-white p-4.5 space-y-3.5 shadow-2xs transition-all",
                isSelected
                  ? "border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-50/20"
                  : "border-slate-200/90 hover:border-slate-300"
              )}
            >
              <div className="flex items-start justify-between gap-2.5">
                <div className="flex items-center gap-3">
                  {onToggleSelect && (
                    <button
                      type="button"
                      onClick={() => onToggleSelect(b.id)}
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer",
                        isSelected
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 bg-white hover:border-indigo-500"
                      )}
                      aria-label={`Pilih reservasi ${b.reference}`}
                    >
                      {isSelected && <Check className="size-3.5 stroke-[3]" />}
                    </button>
                  )}
                  <div className="flex size-9.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100/80 border border-indigo-200/60 font-extrabold text-xs text-indigo-700">
                    {b.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {b.customerName}
                    </h3>
                    <p className="font-mono text-[11px] font-bold text-indigo-600 mt-0.5">
                      {b.reference}
                    </p>
                  </div>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div className="rounded-xl bg-slate-50/80 p-3.5 text-xs space-y-1.5 border border-slate-200/60">
                <div className="flex items-center justify-between text-slate-800">
                  <span className="font-bold text-slate-900">
                    {b.serviceNameSnapshot}
                  </span>
                  <span className="font-bold text-indigo-600">
                    {formatRupiah(b.servicePriceSnapshot)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>Staf: {b.staffName}</span>
                  <span>{formatDuration(b.durationMinutesSnapshot)}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/70 text-slate-700">
                  <span className="flex items-center gap-1 font-medium">
                    <Calendar className="size-3 text-slate-400" />
                    {formatDateId(b.date)}
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    {b.time} WIB
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-100">
                {b.status === "PENDING" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onRequestStatusChange(b, "CONFIRMED")}
                    className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-3 font-semibold shadow-2xs"
                  >
                    Konfirmasi
                  </Button>
                )}
                {b.status === "CONFIRMED" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onRequestStatusChange(b, "COMPLETED")}
                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 font-semibold shadow-2xs"
                  >
                    Selesai
                  </Button>
                )}
                {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRequestStatusChange(b, "CANCELLED")}
                    className="h-8 text-xs text-rose-600 border-rose-200/80 hover:bg-rose-50 hover:text-rose-700"
                  >
                    Batalkan
                  </Button>
                )}
                <a
                  href={generateWhatsAppReminderUrl(b, "Glow Beauty Studio")}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Kirim Pengingat WhatsApp"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-200/90 bg-emerald-50/80 px-2.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 shadow-2xs transition-colors"
                >
                  <MessageSquareShare className="size-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>
                <Link
                  href={`/dashboard/bookings/${b.id}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
                >
                  <Eye className="size-3.5 text-slate-400" />
                  <span>Detail</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80 border-b border-slate-200/80">
              {onSelectAll && (
                <TableHead className="w-10 py-3.5 pl-4 pr-1">
                  <button
                    type="button"
                    onClick={onSelectAll}
                    className={cn(
                      "flex size-4.5 items-center justify-center rounded border transition-colors cursor-pointer",
                      isAllSelected
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : isPartiallySelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                          : "border-slate-300 bg-white hover:border-slate-400"
                    )}
                    aria-label="Pilih semua reservasi"
                  >
                    {isAllSelected && <Check className="size-3.5 stroke-[3]" />}
                    {isPartiallySelected && (
                      <span className="h-0.5 w-2 bg-indigo-600 rounded-full" />
                    )}
                  </button>
                </TableHead>
              )}
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                Referensi
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                {onSortChange ? (
                  <button
                    type="button"
                    onClick={() => onSortChange("customerName")}
                    className="group inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span>Pelanggan</span>
                    {renderSortIndicator("customerName")}
                  </button>
                ) : (
                  "Pelanggan"
                )}
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                Layanan & Staf
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                {onSortChange ? (
                  <button
                    type="button"
                    onClick={() => onSortChange("startAt")}
                    className="group inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span>Jadwal</span>
                    {renderSortIndicator("startAt")}
                  </button>
                ) : (
                  "Jadwal"
                )}
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                {onSortChange ? (
                  <button
                    type="button"
                    onClick={() => onSortChange("servicePriceSnapshot")}
                    className="group inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span>Tarif</span>
                    {renderSortIndicator("servicePriceSnapshot")}
                  </button>
                ) : (
                  "Tarif"
                )}
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                {onSortChange ? (
                  <button
                    type="button"
                    onClick={() => onSortChange("status")}
                    className="group inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    <span>Status</span>
                    {renderSortIndicator("status")}
                  </button>
                ) : (
                  "Status"
                )}
              </TableHead>
              <TableHead className="text-right font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5 pr-4">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => {
              const isSelected = selectedIds.has(b.id);
              return (
                <TableRow
                  key={b.id}
                  className={cn(
                    "hover:bg-slate-50/70 transition-colors",
                    isSelected && "bg-indigo-50/25"
                  )}
                >
                  {onToggleSelect && (
                    <TableCell className="w-10 py-3.5 pl-4 pr-1">
                      <button
                        type="button"
                        onClick={() => onToggleSelect(b.id)}
                        className={cn(
                          "flex size-4.5 items-center justify-center rounded border transition-colors cursor-pointer",
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-slate-300 bg-white hover:border-slate-400"
                        )}
                        aria-label={`Pilih reservasi ${b.reference}`}
                      >
                        {isSelected && <Check className="size-3.5 stroke-[3]" />}
                      </button>
                    </TableCell>
                  )}
                  <TableCell className="font-mono text-xs font-semibold text-indigo-600 py-3.5">
                    {b.reference}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7.5 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-100/80 font-bold text-[11px] text-indigo-700">
                        {b.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-slate-900 leading-tight">
                          {b.customerName}
                        </p>
                        <p className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                          <Phone className="size-3 text-slate-400" />
                          {b.customerPhone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-slate-900">
                        {b.serviceNameSnapshot}
                      </p>
                      <p className="text-xs text-slate-500">
                        Staf:{" "}
                        <span className="font-medium text-slate-700">
                          {b.staffName}
                        </span>{" "}
                        • {formatDuration(b.durationMinutesSnapshot)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                        <Calendar className="size-3.5 text-slate-400" />
                        {formatDateId(b.date)}
                      </p>
                      <p className="font-mono text-xs text-slate-600">
                        Pukul {b.time} WIB
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-semibold tabular-nums text-slate-900 py-3.5">
                    {formatRupiah(b.servicePriceSnapshot)}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <StatusBadge status={b.status} />
                  </TableCell>
                  <TableCell className="text-right py-3.5 pr-4">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {b.status === "PENDING" && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onRequestStatusChange(b, "CONFIRMED")}
                          className="h-7.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2.5 font-medium shadow-2xs"
                        >
                          Konfirmasi
                        </Button>
                      )}
                      {b.status === "CONFIRMED" && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => onRequestStatusChange(b, "COMPLETED")}
                          className="h-7.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 font-medium shadow-2xs"
                        >
                          Selesai
                        </Button>
                      )}
                      {(b.status === "PENDING" || b.status === "CONFIRMED") && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onRequestStatusChange(b, "CANCELLED")}
                          className="h-7.5 text-xs px-2 text-rose-600 border-rose-200/80 hover:bg-rose-50 hover:text-rose-700"
                        >
                          Batalkan
                        </Button>
                      )}
                      <a
                        href={generateWhatsAppReminderUrl(b, "Glow Beauty Studio")}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Kirim Pengingat WhatsApp"
                        className="inline-flex h-7.5 items-center gap-1 rounded-lg border border-emerald-200/90 bg-emerald-50/80 px-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 shadow-2xs transition-colors"
                      >
                        <MessageSquareShare className="size-3 text-emerald-600" />
                        <span>WA</span>
                      </a>
                      <Link
                        href={`/dashboard/bookings/${b.id}`}
                        className="inline-flex h-7.5 items-center gap-1 rounded-lg border border-slate-200/90 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
                      >
                        <Eye className="size-3 text-slate-400" />
                        <span>Detail</span>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
