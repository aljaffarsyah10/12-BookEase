"use client";

import * as React from "react";
import Link from "next/link";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { bookingApi } from "@/features/bookings/services/booking.api";
import { businessApi } from "@/features/business/services/business.api";
import {
  computeDashboardStats,
  type DashboardSummaryStats,
} from "@/features/dashboard/services/dashboard.service";
import { formatDateId, formatRupiah } from "@/lib/format";
import type { Booking, Business } from "@/types";

export default function DashboardOverviewPage() {
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [business, setBusiness] = React.useState<Business | null>(null);
  const [stats, setStats] = React.useState<DashboardSummaryStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    Promise.all([bookingApi.listBookings(), businessApi.getBusiness()])
      .then(([bks, biz]) => {
        if (!active) return;
        const bksList = Array.isArray(bks) ? bks : bks.items;
        setBookings(bksList);
        setBusiness(biz);

        const tz = biz.timezone || "Asia/Jakarta";
        const todayStr = format(toZonedTime(new Date(), tz), "yyyy-MM-dd");
        setStats(computeDashboardStats(bksList, todayStr));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard overview:", err);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (isLoading || !stats || !business) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Ringkasan Operasional"
          description="Pantau aktivitas reservasi dan jadwal layanan bisnis Anda hari ini."
        />
        <LoadingState variant="cards" count={4} />
        <LoadingState variant="table" count={4} />
      </div>
    );
  }

  const tz = business.timezone || "Asia/Jakarta";
  const todayStr = format(toZonedTime(new Date(), tz), "yyyy-MM-dd");
  const todayBookings = bookings.filter((b) => b.date === todayStr);
  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ringkasan Operasional"
        description="Pantau aktivitas reservasi dan jadwal layanan bisnis Anda hari ini."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/book/${business.slug}`}
              target="_blank"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <span>Halaman Booking Publik</span>
              <ExternalLink className="size-3.5" />
            </Link>
            <Link
              href="/dashboard/services"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-xs sm:text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="size-4" />
              <span>Kelola Layanan</span>
            </Link>
          </div>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          subtitle="Seluruh riwayat reservasi"
          icon={CalendarDays}
        />
        <StatCard
          title="Booking Hari Ini"
          value={stats.todayBookingsCount}
          subtitle={`${stats.pendingBookingsCount} menunggu konfirmasi`}
          icon={Calendar}
        />
        <StatCard
          title="Booking Mendatang"
          value={stats.upcomingBookingsCount}
          subtitle="Terjadwal aktif"
          icon={Clock}
        />
        <StatCard
          title="Booking Selesai"
          value={stats.completedBookingsCount}
          subtitle="Layanan tuntas"
          icon={CheckCircle2}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Bookings List */}
        <SectionCard
          title="Reservasi Terbaru (Recent Bookings)"
          description="Daftar reservasi pelanggan terbaru yang masuk ke sistem."
          className="lg:col-span-2"
          headerAction={
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          {recentBookings.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Belum Ada Reservasi"
              description="Reservasi pelanggan yang masuk akan otomatis ditampilkan di sini."
            />
          ) : (
            <div className="divide-y divide-slate-100">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-sm text-slate-900">
                        {booking.customerName}
                      </span>
                      <span className="font-mono text-xs text-slate-500">
                        ({booking.reference})
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      {booking.serviceNameSnapshot} • Staf: {booking.staffName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDateId(booking.date)} pukul{" "}
                      <span className="font-mono font-medium text-slate-700">
                        {booking.time}
                      </span>{" "}
                      • {formatRupiah(booking.servicePriceSnapshot)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <StatusBadge status={booking.status} />
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Right Side: Today's Schedule & Quick Actions */}
        <div className="space-y-6">
          <SectionCard
            title="Jadwal Hari Ini"
            description="Pelanggan terjadwal pada hari aktif."
          >
            {todayBookings.length === 0 ? (
              <p className="text-sm text-slate-500">
                Tidak ada jadwal reservasi untuk hari ini.
              </p>
            ) : (
              <ul className="space-y-3">
                {todayBookings.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600">
                        {item.time}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.customerName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.serviceNameSnapshot} ({item.staffName})
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Pintasan Pengaturan"
            description="Akses cepat konfigurasi workspace bisnis."
          >
            <div className="grid grid-cols-1 gap-2 text-sm">
              <Link
                href="/dashboard/services"
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
              >
                <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                  <Sparkles className="size-4 text-indigo-600" />
                  Tambah / Edit Layanan
                </span>
                <ArrowRight className="size-4 text-slate-400" />
              </Link>
              <Link
                href="/dashboard/schedule"
                className="flex items-center justify-between rounded-lg border border-slate-200 p-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors"
              >
                <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                  <Clock className="size-4 text-indigo-600" />
                  Atur Jam Operasional
                </span>
                <ArrowRight className="size-4 text-slate-400" />
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
