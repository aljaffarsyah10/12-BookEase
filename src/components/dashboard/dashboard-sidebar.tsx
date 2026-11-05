"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, ExternalLink } from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  businessName?: string;
  businessSlug?: string;
  onNavigate?: () => void;
  className?: string;
}

function SidebarNavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
      {DASHBOARD_NAV_ITEMS.map((item) => {
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
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                isActive ? "text-indigo-600" : "text-slate-400"
              )}
            />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function ActiveSidebarNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <SidebarNavLinks pathname={pathname} onNavigate={onNavigate} />;
}

export function DashboardSidebar({
  businessName = "Glow Beauty Studio",
  businessSlug = "glow-beauty-studio",
  onNavigate,
  className,
}: DashboardSidebarProps) {
  return (
    <aside
      aria-label="Dashboard Sidebar"
      className={cn(
        "flex h-full w-64 flex-col border-r border-slate-200 bg-white",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex items-center gap-2.5 text-slate-900 font-semibold"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
            <CalendarCheck className="size-4" />
          </span>
          <span className="text-base font-bold tracking-tight">BookEase</span>
        </Link>
        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">
          Owner
        </span>
      </div>

      {/* Active Workspace Summary */}
      <div className="border-b border-slate-100 px-4 py-3.5">
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200/60">
          <p className="text-xs font-medium text-slate-500">Workspace Bisnis</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">
            {businessName}
          </p>
          <Link
            href={`/book/${businessSlug}`}
            onClick={onNavigate}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
          >
            <span>/book/{businessSlug}</span>
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </div>

      {/* Navigation Links */}
      <Suspense
        fallback={<SidebarNavLinks pathname={null} onNavigate={onNavigate} />}
      >
        <ActiveSidebarNavLinks onNavigate={onNavigate} />
      </Suspense>

      {/* Bottom Footer Link */}
      <div className="border-t border-slate-100 p-4">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <span>Halaman Utama BookEase</span>
          <ExternalLink className="size-3.5" />
        </Link>
      </div>
    </aside>
  );
}
