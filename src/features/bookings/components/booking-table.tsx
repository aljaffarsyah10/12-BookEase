"use client";

import Link from "next/link";
import { Calendar, Eye, Phone, User } from "lucide-react";
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
import { formatDateId, formatDuration, formatRupiah } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types";

interface BookingTableProps {
  bookings: Booking[];
  onRequestStatusChange: (booking: Booking, nextStatus: BookingStatus) => void;
}

export function BookingTable({
  bookings,
  onRequestStatusChange,
}: BookingTableProps) {
  return (
    <div>
      {/* Mobile Card List (< md) */}
      <div className="space-y-3 md:hidden">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="rounded-xl border border-slate-200/90 bg-white p-4 space-y-3.5 shadow-2xs hover:border-slate-300 transition-all"
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 font-semibold text-xs text-indigo-700">
                  {b.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                    {b.customerName}
                  </h3>
                  <p className="font-mono text-[11px] font-medium text-indigo-600 mt-0.5">
                    {b.reference}
                  </p>
                </div>
              </div>
              <StatusBadge status={b.status} />
            </div>

            <div className="rounded-lg bg-slate-50/80 p-3 text-xs space-y-1.5 border border-slate-200/60">
              <div className="flex items-center justify-between text-slate-800">
                <span className="font-semibold text-slate-900">
                  {b.serviceNameSnapshot}
                </span>
                <span className="font-semibold text-indigo-600">
                  {formatRupiah(b.servicePriceSnapshot)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <span>Staf: {b.staffName}</span>
                <span>•</span>
                <span>{formatDuration(b.durationMinutesSnapshot)}</span>
              </div>
              <p className="font-mono text-slate-600 text-[11px] pt-0.5">
                {formatDateId(b.date)} • {b.time} WIB
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-0.5">
              {b.status === "PENDING" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onRequestStatusChange(b, "CONFIRMED")}
                  className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium"
                >
                  Konfirmasi
                </Button>
              )}
              {b.status === "CONFIRMED" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onRequestStatusChange(b, "COMPLETED")}
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
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
              <Link
                href={`/dashboard/bookings/${b.id}`}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
              >
                <Eye className="size-3.5 text-slate-400" />
                <span>Detail</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/75 border-b border-slate-200/80">
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                Referensi
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                Pelanggan
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                Layanan & Staf
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                Jadwal
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                Tarif
              </TableHead>
              <TableHead className="font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                Status
              </TableHead>
              <TableHead className="text-right font-semibold text-[11px] uppercase tracking-wider text-slate-500 py-3.5">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.id} className="hover:bg-slate-50/60 transition-colors">
                <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                  {b.reference}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-[11px] text-slate-700">
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
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-900">
                      {b.serviceNameSnapshot}
                    </p>
                    <p className="text-xs text-slate-500">
                      Staf: <span className="font-medium text-slate-700">{b.staffName}</span> •{" "}
                      {formatDuration(b.durationMinutesSnapshot)}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
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
                <TableCell className="text-sm font-semibold text-slate-900">
                  {formatRupiah(b.servicePriceSnapshot)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={b.status} />
                </TableCell>
                <TableCell className="text-right">
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
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

