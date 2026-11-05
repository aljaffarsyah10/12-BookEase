"use client";

import * as React from "react";
import Link from "next/link";
import { addDays, format, startOfWeek } from "date-fns";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { DAY_NAMES_ID, formatDateId } from "@/lib/format";
import type { Booking, BookingStatus } from "@/types";

interface BookingCalendarViewProps {
  bookings: Booking[];
  onRequestStatusChange: (booking: Booking, nextStatus: BookingStatus) => void;
}

export function BookingCalendarView({
  bookings,
  onRequestStatusChange,
}: BookingCalendarViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = React.useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday as week start
  );

  const weekDays = React.useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(currentWeekStart, i);
      return {
        dateObj: d,
        dateStr: format(d, "yyyy-MM-dd"),
        dayName: DAY_NAMES_ID[d.getDay()] || "",
        dayNumber: format(d, "d MMM"),
      };
    });
  }, [currentWeekStart]);

  const handlePrevWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart((prev) => addDays(prev, 7));
  };

  const handleCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Group bookings by date string (yyyy-MM-dd)
  const bookingsByDate = React.useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      const list = map.get(b.date) || [];
      list.push(b);
      map.set(b.date, list);
    }
    // Sort each day's bookings chronologically
    map.forEach((list) => {
      list.sort((a, b) => a.time.localeCompare(b.time));
    });
    return map;
  }, [bookings]);

  return (
    <div className="space-y-4">
      {/* Navigation Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevWeek}
            className="h-8 px-2"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCurrentWeek}
            className="h-8 px-3 text-xs"
          >
            Minggu Ini
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            className="h-8 px-2"
          >
            <ChevronRight className="size-4" />
          </Button>
          <span className="ml-2 text-sm font-semibold text-slate-800">
            {formatDateId(weekDays[0].dateStr)} -{" "}
            {formatDateId(weekDays[6].dateStr)}
          </span>
        </div>

        <div className="text-xs text-slate-500">
          Menampilkan {bookings.length} reservasi di rentang filter aktif
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays.map((day) => {
          const dayBookings = bookingsByDate.get(day.dateStr) || [];
          const isToday =
            day.dateStr === format(new Date(), "yyyy-MM-dd");

          return (
            <div
              key={day.dateStr}
              className={`flex flex-col rounded-xl border p-3 min-h-[360px] ${
                isToday
                  ? "border-indigo-300 bg-indigo-50/20 shadow-xs"
                  : "border-slate-200 bg-white"
              }`}
            >
              {/* Day Header */}
              <div className="pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <p
                    className={`text-xs font-semibold ${
                      isToday ? "text-indigo-600" : "text-slate-500"
                    }`}
                  >
                    {day.dayName}
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    {day.dayNumber}
                  </p>
                </div>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {dayBookings.length}
                </span>
              </div>

              {/* Bookings in Day */}
              <div className="flex-1 space-y-2 overflow-y-auto">
                {dayBookings.length === 0 ? (
                  <p className="text-[11px] text-slate-400 text-center py-6">
                    Kosong
                  </p>
                ) : (
                  dayBookings.map((bk) => (
                    <div
                      key={bk.id}
                      className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-2xs hover:border-slate-300 transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[11px] font-bold text-indigo-600">
                          {bk.time}
                        </span>
                        <StatusBadge status={bk.status} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {bk.customerName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {bk.serviceNameSnapshot}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <User className="size-3" />
                          <span className="truncate">{bk.staffName}</span>
                        </p>
                      </div>

                      <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                        <Link
                          href={`/dashboard/bookings/${bk.id}`}
                          className="font-medium text-slate-600 hover:text-indigo-600 truncate"
                        >
                          Detail
                        </Link>

                        {/* Quick action for confirmed/pending */}
                        {bk.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() =>
                              onRequestStatusChange(bk, "CONFIRMED")
                            }
                            className="font-semibold text-emerald-600 hover:text-emerald-700"
                          >
                            Konfirmasi
                          </button>
                        )}
                        {bk.status === "CONFIRMED" && (
                          <button
                            type="button"
                            onClick={() =>
                              onRequestStatusChange(bk, "COMPLETED")
                            }
                            className="font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Selesai
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
