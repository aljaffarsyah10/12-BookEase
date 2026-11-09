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
    <div className="min-h-screen bg-slate-50/75 py-8 sm:py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 space-y-7">
        {/* Business Identity Header */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-2xs">
                  <CalendarCheck className="size-5.5" />
                </span>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                    {business.name}
                  </h1>
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                    {business.category}
                  </p>
                </div>
              </div>

              {business.description && (
                <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                  {business.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-slate-500 pt-1 font-medium">
                {business.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="size-4 text-slate-400 shrink-0" />
                    {business.address}
                  </span>
                )}
                {business.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="size-4 text-slate-400 shrink-0" />
                    {business.phone}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-4 text-slate-400 shrink-0" />
                  Zona Waktu: <strong className="text-slate-700">{business.timezone}</strong>
                </span>
              </div>
            </div>

            <Badge
              variant="outline"
              className="w-fit bg-emerald-50 text-emerald-700 border-emerald-200/80 px-3 py-1 font-semibold text-xs shrink-0 self-start"
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

