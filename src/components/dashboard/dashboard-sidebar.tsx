"use client";

import * as React from "react";
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
import { businessApi } from "@/features/business/services/business.api";

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
      <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
        {label}
      </p>
      <div className="space-y-1">
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
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-150 select-none",
                isActive
                  ? "bg-indigo-50/90 text-indigo-700 font-semibold shadow-xs ring-1 ring-indigo-500/10 dark:bg-indigo-950/60 dark:text-indigo-300 dark:ring-indigo-800"
                  : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100"
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400" />
              )}
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-transform duration-150 group-hover:scale-105",
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
  const [fetchedBiz, setFetchedBiz] = React.useState<{
    name: string;
    slug: string;
  } | null>(null);

  React.useEffect(() => {
    let active = true;
    if (businessName === "Bisnis Jasa") {
      businessApi
        .getBusiness()
        .then((biz) => {
          if (active && biz) {
            setFetchedBiz({ name: biz.name, slug: biz.slug });
          }
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [businessName]);

  const actualName = fetchedBiz?.name ?? businessName;
  const actualSlug = fetchedBiz?.slug ?? businessSlug;
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
          <span className="flex size-8.5 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 text-white shadow-xs shadow-indigo-500/20">
            <CalendarCheck className="size-4.5" />
          </span>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              BookEase
            </span>
          </div>
        </Link>
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900">
          PRO
        </span>
      </div>

      {/* Active Workspace Pill */}
      <div className="border-b border-slate-100 p-3.5 dark:border-slate-800">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 transition-all hover:border-slate-300 hover:shadow-2xs dark:border-slate-800 dark:bg-slate-900/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Workspace Aktif
              </p>
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded px-1.5 py-0.2">
              Online
            </span>
          </div>
          <p className="mt-1.5 truncate text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            {actualName}
          </p>
          <Link
            href={`/book/${actualSlug}`}
            target="_blank"
            onClick={onNavigate}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200/90 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-700 hover:bg-slate-50 transition-colors dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-400"
          >
            <span className="truncate">/book/{actualSlug}</span>
            <ExternalLink className="size-3 shrink-0 text-slate-400" />
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
