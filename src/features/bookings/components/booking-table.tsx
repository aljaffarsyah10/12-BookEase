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
            className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs font-semibold text-indigo-600">
                  {b.reference}
                </p>
                <h3 className="text-sm font-semibold text-slate-900 mt-0.5">
                  {b.customerName}
                </h3>
                <p className="text-xs text-slate-500">{b.customerPhone}</p>
              </div>
              <StatusBadge status={b.status} />
            </div>

            <div className="rounded-lg bg-slate-50 p-2.5 text-xs space-y-1 text-slate-600">
              <p className="font-medium text-slate-800">
                {b.serviceNameSnapshot} ({formatDuration(b.durationMinutesSnapshot)})
              </p>
              <p>Staf: {b.staffName}</p>
              <p className="font-mono text-slate-700">
                {formatDateId(b.date)} • {b.time} WIB •{" "}
                {formatRupiah(b.servicePriceSnapshot)}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              {b.status === "PENDING" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onRequestStatusChange(b, "CONFIRMED")}
                  className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                >
                  Konfirmasi
                </Button>
              )}
              {b.status === "CONFIRMED" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => onRequestStatusChange(b, "COMPLETED")}
                  className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
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
                  className="h-8 text-xs text-red-600 hover:bg-red-50"
                >
                  Batalkan
                </Button>
              )}
              <Link
                href={`/dashboard/bookings/${b.id}`}
                className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Eye className="size-3.5" />
                <span>Detail</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (md+) */}
      <div className="hidden md:block rounded-xl border border-slate-200/80 bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/80">
              <TableHead className="font-semibold text-slate-800">
                Referensi
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Pelanggan
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Layanan & Staf
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Jadwal (WIB)
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Harga
              </TableHead>
              <TableHead className="font-semibold text-slate-800">
                Status
              </TableHead>
              <TableHead className="text-right font-semibold text-slate-800">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs font-semibold text-indigo-600">
                  {b.reference}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                      <User className="size-3.5 text-slate-400" />
                      {b.customerName}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Phone className="size-3 text-slate-400" />
                      {b.customerPhone}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-slate-900">
                      {b.serviceNameSnapshot}
                    </p>
                    <p className="text-xs text-slate-500">
                      Staf: {b.staffName} •{" "}
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
                        className="h-8 bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                      >
                        Konfirmasi
                      </Button>
                    )}
                    {b.status === "CONFIRMED" && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onRequestStatusChange(b, "COMPLETED")}
                        className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
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
                        className="h-8 text-xs text-red-600 hover:bg-red-50"
                      >
                        Batalkan
                      </Button>
                    )}
                    <Link
                      href={`/dashboard/bookings/${b.id}`}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Eye className="size-3.5" />
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

