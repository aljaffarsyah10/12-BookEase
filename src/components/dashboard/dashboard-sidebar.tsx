"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CalendarDays,
  Clock,
  ExternalLink,
  LayoutDashboard,
  Settings,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  businessName?: string;
  businessSlug?: string;
  onNavigate?: () => void;
  className?: string;
}

const PRIMARY_NAV = [
  { title: "Ringkasan", href: "/dashboard", icon: LayoutDashboard, exact: true },
  { title: "Daftar Reservasi", href: "/dashboard/bookings", icon: CalendarDays },
  { title: "Katalog Layanan", href: "/dashboard/services", icon: Sparkles },
  { title: "Tim Staf", href: "/dashboard/staff", icon: Users },
  { title: "Jam Operasional", href: "/dashboard/schedule", icon: Clock },
];

const SETTINGS_NAV = [
  { title: "Profil Bisnis", href: "/dashboard/business", icon: Store },
  { title: "Pengaturan Akun", href: "/dashboard/settings", icon: Settings },
];

function SidebarNavGroup({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string;
  items: typeof PRIMARY_NAV;
  pathname: string | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 select-none">
        {label}
      </p>
      <div className="space-y-0.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname
            ? item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
            : false;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-all duration-150 select-none",
                isActive
                  ? "bg-indigo-50/80 text-indigo-700 font-semibold shadow-2xs dark:bg-indigo-950/50 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500"
                )}
              />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function ActiveSidebarNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      <SidebarNavGroup
        label="Operasional"
        items={PRIMARY_NAV}
        pathname={pathname}
        onNavigate={onNavigate}
      />
      <SidebarNavGroup
        label="Konfigurasi"
        items={SETTINGS_NAV}
        pathname={pathname}
        onNavigate={onNavigate}
      />
    </nav>
  );
}

export function DashboardSidebar({
  businessName = "Bisnis Jasa",
  businessSlug = "bisnis-jasa",
  onNavigate,
  className,
}: DashboardSidebarProps) {
  return (
    <aside
      aria-label="Dashboard Sidebar"
      className={cn(
        "flex h-full w-64 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-slate-800">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 text-slate-900 font-semibold dark:text-slate-100"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-2xs">
            <CalendarCheck className="size-4" />
          </span>
          <span className="text-base font-bold tracking-tight">BookEase</span>
        </Link>
        <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900">
          Owner
        </span>
      </div>

      {/* Active Workspace Pill */}
      <div className="border-b border-slate-100 p-3.5 dark:border-slate-800">
        <div className="rounded-xl border border-slate-200/70 bg-slate-50/70 p-3 transition-colors hover:border-slate-300/80 dark:border-slate-800 dark:bg-slate-900/60">
          <p className="text-[11px] font-medium text-slate-400">Workspace Aktif</p>
          <p className="mt-0.5 truncate text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
            {businessName}
          </p>
          <Link
            href={`/book/${businessSlug}`}
            target="_blank"
            onClick={onNavigate}
            className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <span className="truncate">/book/{businessSlug}</span>
            <ExternalLink className="size-3 shrink-0" />
          </Link>
        </div>
      </div>

      {/* Nav Links */}
      <Suspense
        fallback={
          <div className="p-4 space-y-2">
            <div className="h-8 rounded-lg bg-slate-100 animate-pulse" />
            <div className="h-8 rounded-lg bg-slate-100 animate-pulse" />
          </div>
        }
      >
        <ActiveSidebarNavLinks onNavigate={onNavigate} />
      </Suspense>

      {/* Footer Link */}
      <div className="border-t border-slate-100 p-3.5 dark:border-slate-800">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <span>Kembali ke Beranda</span>
          <ExternalLink className="size-3.5" />
        </Link>
      </div>
    </aside>
  );
}
