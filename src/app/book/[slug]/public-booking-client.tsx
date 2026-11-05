"use client";

import * as React from "react";
import { CalendarCheck, Clock, MapPin, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookingWizard } from "@/components/booking/booking-wizard";
import { ErrorState } from "@/components/shared/error-state";
import { LoadingState } from "@/components/shared/loading-state";
import { businessApi } from "@/features/business/services/business.api";
import type { Business, Service, Staff } from "@/types";

export function PublicBookingClientView({ slug }: { slug: string }) {
  const [business, setBusiness] = React.useState<Business | null>(null);
  const [services, setServices] = React.useState<Service[]>([]);
  const [staffList, setStaffList] = React.useState<Staff[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    businessApi
      .getPublicBySlug(slug)
      .then((data) => {
        if (!active) return;
        setBusiness(data);
        setServices(data.services);
        setStaffList(data.staff);
        setIsLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setBusiness(null);
        setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl p-6 space-y-6">
        <LoadingState variant="detail" />
        <LoadingState variant="cards" count={3} />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="mx-auto max-w-xl py-16 px-4">
        <ErrorState
          title="Halaman Bisnis Tidak Ditemukan (404)"
          message={`Tidak ditemukan bisnis dengan alamat URL "/book/${slug}". Pastikan tautan yang Anda buka sudah benar.`}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-6">
        {/* Business Identity Header */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                  <CalendarCheck className="size-5" />
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                    {business.name}
                  </h1>
                  <p className="text-xs font-medium text-indigo-600">
                    {business.category}
                  </p>
                </div>
              </div>

              {business.description && (
                <p className="text-sm text-slate-600 max-w-2xl">
                  {business.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-500 pt-1">
                {business.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-slate-400" />
                    {business.address}
                  </span>
                )}
                {business.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-4 text-slate-400" />
                    {business.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-slate-400" />
                  Zona Waktu: {business.timezone}
                </span>
              </div>
            </div>

            <Badge
              variant="outline"
              className="w-fit bg-emerald-50 text-emerald-700 border-emerald-200 shrink-0"
            >
              Menerima Reservasi Online
            </Badge>
          </div>
        </div>

        {/* Interactive Booking Wizard */}
        <BookingWizard
          business={business}
          services={services}
          staffList={staffList}
        />
      </div>
    </div>
  );
}

