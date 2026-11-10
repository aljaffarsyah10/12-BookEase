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
  CreditCard,
  ExternalLink,
  Plus,
  Sparkles,
  User,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { billingApi } from "@/features/billing/services/billing.api";
import { bookingApi } from "@/features/bookings/services/booking.api";
import { businessApi } from "@/features/business/services/business.api";
import {
  dashboardApi,
  type DashboardSummaryStats,
} from "@/features/dashboard/services/dashboard.service";
import { formatDateId, formatRupiah } from "@/lib/format";
import type { BusinessUsageSummary } from "@/server/services/subscription.service";
import type { Booking, Business } from "@/types";

export default function DashboardOverviewPage() {
  const [recentBookings, setRecentBookings] = React.useState<Booking[]>([]);
  const [todayBookings, setTodayBookings] = React.useState<Booking[]>([]);
  const [business, setBusiness] = React.useState<Business | null>(null);
  const [stats, setStats] = React.useState<DashboardSummaryStats | null>(null);
  const [subscription, setSubscription] = React.useState<BusinessUsageSummary | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [biz, backendStats, recentRes, sub] = await Promise.all([
          businessApi.getBusiness(),
          dashboardApi.getStats(),
          bookingApi.listBookings({ limit: 5 }),
          billingApi.getSubscription().catch(() => null),
        ]);

        if (!active) return;
        setBusiness(biz);
        setStats(backendStats);
        setRecentBookings(Array.isArray(recentRes) ? recentRes : recentRes.items);
        setSubscription(sub);

        // Fetch up to 10 of today's bookings specifically for the widget
        const tz = biz.timezone || "Asia/Jakarta";
        const todayStr = format(toZonedTime(new Date(), tz), "yyyy-MM-dd");
        const todayRes = await bookingApi.listBookings({ date: todayStr, limit: 10 });

        if (!active) return;
        setTodayBookings(Array.isArray(todayRes) ? todayRes : todayRes.items);
      } catch (err) {
        console.error("Failed to load dashboard overview:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();

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

  return (
    <div className="space-y-7">
      <PageHeader
        title="Ringkasan Operasional"
        description="Pantau jadwal janji temu, ketersediaan staf, dan riwayat reservasi pelanggan hari ini."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href={`/book/${business.slug}`}
              target="_blank"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <span>Halaman Booking Publik</span>
              <ExternalLink className="size-3.5" />
            </Link>
            <Link
              href="/dashboard/services"
              className={buttonVariants({ size: "sm" })}
            >
              <Plus className="size-4" />
              <span>Tambah Layanan</span>
            </Link>
          </div>
        }
      />

      {/* Trial Countdown or Onboarding Guide Banner */}
      {subscription && subscription.plan === "FREE_TRIAL" && (
        <div className="relative overflow-hidden rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/90 via-violet-50/60 to-white p-5 shadow-2xs dark:border-indigo-900/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-md bg-indigo-600 text-white">
                  <Sparkles className="size-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Masa Uji Coba Gratis Sedang Berjalan
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Nikmati akses seluruh fitur Pro BookEase ({subscription.trialDaysLeft} hari tersisa).
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Layanan aktif: {subscription.usage.services.used}/{subscription.usage.services.limit} • Staf: {subscription.usage.staff.used}/{subscription.usage.staff.limit} • Reservasi bulan ini: {subscription.usage.bookingsThisMonth.used}/{subscription.usage.bookingsThisMonth.limit}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard/billing"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                <CreditCard className="size-3.5" />
                <span>Pilih Paket Langganan</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Checklist for New Business */}
      {stats.totalBookings === 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Panduan Memulai Bisnis Baru Anda
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selesaikan 4 langkah mudah ini agar halaman reservasi Anda siap digunakan pelanggan.
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full dark:bg-indigo-950/60 dark:border-indigo-800">
              Langkah Awal
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-emerald-900 dark:text-emerald-300">1. Profil Bisnis</p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">Selesai terkonfigurasi</p>
              </div>
            </div>

            <Link
              href="/dashboard/services"
              className="group flex items-center justify-between rounded-xl border border-slate-200/80 p-3 hover:border-indigo-400 hover:shadow-2xs transition-all dark:border-slate-800"
            >
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  2. Buat Layanan
                </p>
                <p className="text-[11px] text-slate-500">Tentukan harga & durasi</p>
              </div>
              <ArrowRight className="size-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/dashboard/staff"
              className="group flex items-center justify-between rounded-xl border border-slate-200/80 p-3 hover:border-indigo-400 hover:shadow-2xs transition-all dark:border-slate-800"
            >
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  3. Atur Tim Staf
                </p>
                <p className="text-[11px] text-slate-500">Hubungkan staf & layanan</p>
              </div>
              <ArrowRight className="size-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href={`/book/${business.slug}`}
              target="_blank"
              className="group flex items-center justify-between rounded-xl border border-slate-200/80 p-3 hover:border-indigo-400 hover:shadow-2xs transition-all dark:border-slate-800"
            >
              <div className="text-xs space-y-0.5">
                <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  4. Uji Coba Booking
                </p>
                <p className="text-[11px] text-slate-500">Buka halaman publik</p>
              </div>
              <ExternalLink className="size-4 text-slate-400 group-hover:text-indigo-600 transition-all" />
            </Link>
          </div>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reservasi"
          value={stats.totalBookings}
          subtitle="Seluruh riwayat booking"
          icon={CalendarDays}
          trend={stats.totalBookings > 0 ? "+100% aktif" : undefined}
        />
        <StatCard
          title="Jadwal Hari Ini"
          value={stats.todayBookingsCount}
          subtitle={`${stats.pendingBookingsCount} menunggu konfirmasi`}
          icon={Calendar}
          trend={stats.todayBookingsCount > 0 ? "Hari ini" : undefined}
        />
        <StatCard
          title="Booking Mendatang"
          value={stats.upcomingBookingsCount}
          subtitle="Terjadwal di masa depan"
          icon={Clock}
          trend={stats.upcomingBookingsCount > 0 ? "Terjadwal" : undefined}
        />
        <StatCard
          title="Layanan Selesai"
          value={stats.completedBookingsCount}
          subtitle="Layanan tuntas berhasil"
          icon={CheckCircle2}
          trend={stats.completedBookingsCount > 0 ? "Tuntas" : undefined}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Bookings List */}
        <SectionCard
          title="Reservasi Terbaru"
          description="Daftar reservasi pelanggan yang baru masuk ke sistem."
          className="lg:col-span-2"
          headerAction={
            <Link
              href="/dashboard/bookings"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors"
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
              description="Ketika pelanggan memesan layanan via halaman booking publik, data akan otomatis muncul di sini."
            />
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col gap-3 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/60 rounded-lg p-2.5 -mx-2.5 transition-colors dark:hover:bg-slate-800/40"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100/80 text-xs font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900">
                      {booking.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {booking.customerName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded dark:bg-slate-800 dark:text-slate-400">
                          {booking.reference}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {booking.serviceNameSnapshot} • Staf:{" "}
                        <span className="font-medium text-slate-800 dark:text-slate-300">
                          {booking.staffName}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDateId(booking.date)} pukul{" "}
                        <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                          {booking.time}
                        </span>{" "}
                        • {formatRupiah(booking.servicePriceSnapshot)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
                    <StatusBadge status={booking.status} />
                    <Link
                      href={`/dashboard/bookings/${booking.id}`}
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Right Column: Today's Schedule & Shortcuts */}
        <div className="space-y-6">
          <SectionCard
            title="Jadwal Hari Ini"
            description={
              todayBookings.length > 0
                ? `${todayBookings.length} pelanggan terjadwal`
                : "Tidak ada jadwal hari ini"
            }
          >
            {todayBookings.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                Belum ada jadwal reservasi untuk hari ini.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {todayBookings.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg border border-slate-200/80 bg-slate-50/70 p-3 space-y-1.5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {item.time} WIB
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {item.customerName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <User className="size-3 shrink-0" />
                      <span>{item.serviceNameSnapshot} ({item.staffName})</span>
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            title="Pintasan Cepat"
            description="Konfigurasi operasional workspace."
          >
            <div className="grid grid-cols-1 gap-2 text-sm">
              <Link
                href="/dashboard/services"
                className="flex items-center justify-between rounded-lg border border-slate-200/80 p-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all dark:border-slate-800 dark:hover:border-indigo-900"
              >
                <span className="inline-flex items-center gap-2.5 font-medium text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <span className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Sparkles className="size-3.5" />
                  </span>
                  Kelola Layanan Jasa
                </span>
                <ArrowRight className="size-3.5 text-slate-400" />
              </Link>
              <Link
                href="/dashboard/schedule"
                className="flex items-center justify-between rounded-lg border border-slate-200/80 p-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all dark:border-slate-800 dark:hover:border-indigo-900"
              >
                <span className="inline-flex items-center gap-2.5 font-medium text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <span className="flex size-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <Clock className="size-3.5" />
                  </span>
                  Atur Jam Operasional
                </span>
                <ArrowRight className="size-3.5 text-slate-400" />
              </Link>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
