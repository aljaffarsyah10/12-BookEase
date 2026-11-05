"use client";

import * as React from "react";
import Link from "next/link";
import { Copy, ExternalLink, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

interface DashboardHeaderProps {
  businessName?: string;
  businessSlug?: string;
  ownerName?: string;
}

export function DashboardHeader({
  businessName = "Glow Beauty Studio",
  businessSlug = "glow-beauty-studio",
  ownerName = "Budi Santoso",
}: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleCopyBookingLink = () => {
    const url = `${window.location.origin}/book/${businessSlug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link halaman booking berhasil disalin!", {
      description: url,
    });
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Buka menu navigasi dashboard"
            className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {businessName}
            </p>
            <p className="text-xs text-slate-500 hidden sm:block">
              Zona Waktu: Asia/Jakarta (WIB)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyBookingLink}
            className="gap-1.5 text-xs sm:text-sm"
          >
            <Copy className="size-3.5" />
            <span className="hidden sm:inline">Salin Link Booking</span>
            <span className="sm:hidden">Salin Link</span>
          </Button>

          <Link
            href={`/book/${businessSlug}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-50 px-3 text-xs font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
          >
            <span className="hidden sm:inline">Lihat Halaman Publik</span>
            <ExternalLink className="size-3.5" />
          </Link>

          <div
            title={ownerName}
            className="ml-1 flex size-9 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white"
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-white shadow-xl">
            <div className="absolute top-3.5 right-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Tutup menu navigasi"
                className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <DashboardSidebar
              businessName={businessName}
              businessSlug={businessSlug}
              onNavigate={() => setMobileMenuOpen(false)}
              className="w-full border-r-0"
            />
          </div>
        </div>
      )}
    </>
  );
}

