"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, ExternalLink, Globe, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

interface DashboardHeaderProps {
  businessName?: string;
  businessSlug?: string;
  ownerName?: string;
}

export function DashboardHeader({
  businessName = "Bisnis Jasa",
  businessSlug = "bisnis-jasa",
  ownerName = "Owner",
}: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleCopyBookingLink = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/book/${businessSlug}`;
    navigator.clipboard.writeText(url);
    toast.success("Tautan halaman booking berhasil disalin!", {
      description: url,
    });
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Buka menu navigasi dashboard"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200/90 text-slate-700 hover:bg-slate-100 transition-colors lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Menu className="size-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {businessName}
              </p>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <Globe className="size-3 text-slate-400" />
              <span>Zona Waktu: Asia/Jakarta (WIB)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyBookingLink}
            className="gap-1.5 text-xs shadow-2xs font-semibold rounded-lg"
          >
            <Copy className="size-3.5 text-slate-500" />
            <span className="hidden sm:inline">Salin Link Booking</span>
            <span className="sm:hidden">Salin</span>
          </Button>

          <Link
            href={`/book/${businessSlug}`}
            target="_blank"
            className="inline-flex h-8.5 items-center gap-1.5 rounded-lg border border-indigo-200/90 bg-indigo-50/80 px-3 text-xs font-semibold text-indigo-700 shadow-2xs transition-all hover:bg-indigo-100/90 active:scale-[0.98] dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300"
          >
            <span className="hidden sm:inline">Halaman Booking</span>
            <ExternalLink className="size-3.5" />
          </Link>

          <div
            title={ownerName}
            className="ml-1 flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 to-slate-700 ring-2 ring-slate-200/80 text-[11px] font-bold text-white shadow-2xs select-none dark:from-slate-100 dark:to-slate-300 dark:text-slate-900 dark:ring-slate-800"
          >
            {ownerName
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white shadow-2xl dark:bg-slate-950">
            <div className="absolute top-3.5 right-3 z-20">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup menu navigasi"
                className="inline-flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>
            <DashboardSidebar
              businessName={businessName}
              businessSlug={businessSlug}
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
