import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Ringkasan Operasional"
        description="Pantau aktivitas reservasi dan jadwal layanan bisnis Anda hari ini."
        actions={
          <Link
            href="/dashboard/services"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="size-4" />
            <span>Kelola Layanan</span>
          </Link>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Booking Hari Ini"
          value="0"
          subtitle="Jadwal aktif hari ini"
          icon={Calendar}
        />
        <StatCard
          title="Booking Mendatang"
          value="0"
          subtitle="7 hari ke depan"
          icon={Clock}
        />
        <StatCard
          title="Menunggu Konfirmasi"
          value="0"
          subtitle="Perlu tindakan segera"
          icon={AlertCircle}
        />
        <StatCard
          title="Selesai Bulan Ini"
          value="0"
          subtitle="Layanan tuntas"
          icon={CheckCircle2}
        />
      </div>

      {/* Main Overview Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Jadwal Reservasi Hari Ini"
          description="Daftar pelanggan yang dijadwalkan hadir hari ini."
          className="lg:col-span-2"
          headerAction={<StatusBadge status="CONFIRMED" />}
        >
          <EmptyState
            icon={Calendar}
            title="Belum Ada Jadwal Hari Ini"
            description="Reservasi pelanggan yang masuk untuk hari ini akan muncul di sini secara otomatis."
            action={
              <Link
                href="/dashboard/bookings"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Lihat Semua Booking
              </Link>
            }
          />
        </SectionCard>

        <SectionCard
          title="Langkah Persiapan Bisnis"
          description="Pastikan halaman booking Anda siap menerima pelanggan."
        >
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <span className="font-medium text-slate-800">
                1. Profil & Slug Bisnis
              </span>
              <Link
                href="/dashboard/business"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Atur
              </Link>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <span className="font-medium text-slate-800">
                2. Daftar Layanan & Harga
              </span>
              <Link
                href="/dashboard/services"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Atur
              </Link>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <span className="font-medium text-slate-800">
                3. Data Staf Penyedia
              </span>
              <Link
                href="/dashboard/staff"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Atur
              </Link>
            </li>
            <li className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <span className="font-medium text-slate-800">
                4. Jam Operasional
              </span>
              <Link
                href="/dashboard/schedule"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Atur
              </Link>
            </li>
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}

