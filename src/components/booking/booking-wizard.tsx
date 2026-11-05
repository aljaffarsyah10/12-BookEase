"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  Loader2,
  Sparkles,
  UserCheck,
  Users,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionCard } from "@/components/shared/section-card";
import { addDays, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { bookingApi } from "@/features/bookings/services/booking.api";
import { ApiClientError } from "@/lib/api-client";
import { formatDateId, formatDuration, formatRupiah } from "@/lib/format";
import {
  customerDetailsSchema,
  type CustomerDetailsFormValues,
} from "@/lib/validations/booking.schema";
import { cn } from "@/lib/utils";
import type { Business, Service, Staff, TimeSlot } from "@/types";

interface BookingWizardProps {
  business: Business;
  services: Service[];
  staffList: Staff[];
}

function generateUpcomingDates(
  daysCount = 7,
  timezone = "Asia/Jakarta"
): string[] {
  const nowZoned = toZonedTime(new Date(), timezone);
  const result: string[] = [];
  for (let i = 0; i < daysCount; i++) {
    result.push(format(addDays(nowZoned, i), "yyyy-MM-dd"));
  }
  return result;
}

const STEPS = [
  { id: 1, title: "Layanan" },
  { id: 2, title: "Staf" },
  { id: 3, title: "Tanggal & Jam" },
  { id: 4, title: "Data Diri & Review" },
];

export function BookingWizard({
  business,
  services,
  staffList,
}: BookingWizardProps) {
  const router = useRouter();
  const [step, setStep] = React.useState<number>(1);

  const [selectedServiceId, setSelectedServiceId] = React.useState<string>(
    services[0]?.id ?? ""
  );
  const [selectedStaffId, setSelectedStaffId] = React.useState<string>("any");
  const upcomingDates = React.useMemo(
    () => generateUpcomingDates(7, business.timezone || "Asia/Jakarta"),
    [business.timezone]
  );
  const [selectedDate, setSelectedDate] = React.useState<string>(
    upcomingDates[0] || ""
  );
  const [selectedTime, setSelectedTime] = React.useState<string>("");

  const [slots, setSlots] = React.useState<TimeSlot[]>([]);
  const [isDayClosed, setIsDayClosed] = React.useState<boolean>(false);
  const [isLoadingSlots, setIsLoadingSlots] = React.useState<boolean>(false);
  const [slotError, setSlotError] = React.useState<string | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId);

  const eligibleStaff = React.useMemo(() => {
    if (!selectedService) return [];
    return staffList.filter(
      (st) =>
        st.isActive &&
        (st.serviceIds.includes(selectedService.id) ||
          selectedService.staffIds.includes(st.id))
    );
  }, [selectedService, staffList]);

  const selectedStaffObj = eligibleStaff.find(
    (st) => st.id === selectedStaffId
  );

  const fetchSlots = React.useCallback(async () => {
    if (!selectedServiceId || !selectedDate) return;
    setIsLoadingSlots(true);
    setSlotError(null);
    try {
      const res = await bookingApi.getAvailability({ slug: business.slug, date: selectedDate, serviceId: selectedServiceId, staffId: selectedStaffId });
      setIsDayClosed(res.isClosed);
      setSlots(res.slots);
      setSelectedTime((prev) =>
        prev && res.slots.some((slot) => slot.time === prev)
          ? prev
          : (res.slots[0]?.time ?? "")
      );
    } catch {
      setSlotError("Gagal memuat ketersediaan jadwal.");
    } finally {
      setIsLoadingSlots(false);
    }
  }, [business.slug, selectedDate, selectedServiceId, selectedStaffId]);

  React.useEffect(() => {
    let active = true;
    if (!selectedServiceId || !selectedDate) return;
    bookingApi
      .getAvailability({
        slug: business.slug,
        date: selectedDate,
        serviceId: selectedServiceId,
        staffId: selectedStaffId,
      })
      .then((res) => {
        if (!active) return;
        setIsDayClosed(res.isClosed);
        setSlots(res.slots);
        setSelectedTime((prev) =>
          prev && res.slots.some((slot) => slot.time === prev)
            ? prev
            : (res.slots[0]?.time ?? "")
        );
        setIsLoadingSlots(false);
      })
      .catch(() => {
        if (!active) return;
        setSlotError("Gagal memuat ketersediaan jadwal.");
        setIsLoadingSlots(false);
      });
    return () => {
      active = false;
    };
  }, [business.slug, selectedDate, selectedServiceId, selectedStaffId]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerDetailsFormValues>({
    resolver: zodResolver(customerDetailsSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerNotes: "",
    },
  });

  const handleConfirmBooking = async (values: CustomerDetailsFormValues) => {
    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error("Silakan lengkapi layanan, tanggal, dan jam reservasi.");
      return;
    }

    try {
      const created = await bookingApi.createBooking({
        businessSlug: business.slug,
        serviceId: selectedService.id,
        staffId: selectedStaffId === "any" ? undefined : selectedStaffId,
        date: selectedDate,
        time: selectedTime,
        customerName: values.customerName,
        customerEmail: values.customerEmail,
        customerPhone: values.customerPhone,
        customerNotes: values.customerNotes || undefined,
      });

      toast.success("Reservasi berhasil dikonfirmasi!", {
        description: `Kode Referensi: ${created.reference}`,
      });

      router.push(
        `/book/${business.slug}/success?ref=${encodeURIComponent(created.reference)}`
      );
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 409) {
        toast.error("Slot Waktu Tidak Tersedia", {
          description: err.message || "Slot yang Anda pilih baru saja terisi. Silakan pilih jam lain.",
        });
        await fetchSlots();
        setStep(3);
        return;
      }
      const message =
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses booking.";
      toast.error("Gagal melakukan reservasi", { description: message });
    }
  };

  return (
    <div className="space-y-6">
      {/* Stepper Indicator */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((s) => {
          const isCurrent = step === s.id;
          const isCompleted = step > s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                if (s.id < step) setStep(s.id);
              }}
              disabled={s.id > step}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border p-3 text-left transition-all",
                isCurrent
                  ? "border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-1 ring-indigo-600"
                  : isCompleted
                    ? "border-emerald-200 bg-white text-slate-800 hover:bg-slate-50 cursor-pointer"
                    : "border-slate-200 bg-white/60 text-slate-400 cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  isCurrent
                    ? "bg-indigo-600 text-white"
                    : isCompleted
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-500"
                )}
              >
                {isCompleted ? <Check className="size-3.5" /> : s.id}
              </span>
              <span className="truncate text-xs sm:text-sm font-semibold">
                {s.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Wizard Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Active Step */}
        <div className="lg:col-span-8">
          {step === 1 && (
            <SectionCard
              title="1. Pilih Layanan"
              description="Pilih layanan yang ingin Anda pesan."
              footer={
                <div className="flex w-full justify-end">
                  <Button
                    type="button"
                    disabled={!selectedService}
                    onClick={() => setStep(2)}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <span>Lanjut Pilih Staf</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              }
            >
              <div className="space-y-3">
                {services.map((srv) => {
                  const isSelected = srv.id === selectedServiceId;
                  return (
                    <button
                      key={srv.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => {
                        setSelectedServiceId(srv.id);
                        setSelectedStaffId("any");
                      }}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left transition-all",
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600"
                          : "border-slate-200 bg-white hover:border-indigo-300"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-base font-semibold text-slate-900">
                            {srv.name}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600">
                            {srv.description}
                          </p>
                        </div>
                        <span className="shrink-0 text-base font-bold text-indigo-600">
                          {formatRupiah(srv.price)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <Clock className="size-3.5 text-indigo-600" />
                        <span>Durasi: {formatDuration(srv.durationMinutes)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {step === 2 && (
            <SectionCard
              title="2. Pilih Staf Penyedia Layanan"
              description="Pilih staf spesifik atau biarkan sistem memilihkan staf yang tersedia."
              footer={
                <div className="flex w-full items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="gap-1.5"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Kembali</span>
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <span>Lanjut Pilih Jadwal</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              }
            >
              <div className="space-y-3">
                <button
                  type="button"
                  aria-pressed={selectedStaffId === "any"}
                  onClick={() => setSelectedStaffId("any")}
                  className={cn(
                    "w-full rounded-xl border p-4 text-left transition-all",
                    selectedStaffId === "any"
                      ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600"
                      : "border-slate-200 bg-white hover:border-indigo-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                      <Users className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-semibold text-slate-900">
                        Siapa Saja yang Tersedia (Any Available)
                      </p>
                      <p className="text-xs text-slate-500">
                        Direkomendasikan — menampilkan pilihan jam paling banyak
                      </p>
                    </div>
                  </div>
                </button>

                {eligibleStaff.map((st) => {
                  const isSelected = selectedStaffId === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedStaffId(st.id)}
                      className={cn(
                        "w-full rounded-xl border p-4 text-left transition-all",
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/40 ring-2 ring-indigo-600"
                          : "border-slate-200 bg-white hover:border-indigo-300"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-semibold text-xs">
                          {st.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-slate-900">
                            {st.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {st.roleOrTitle}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {step === 3 && (
            <SectionCard
              title="3. Pilih Tanggal & Slot Waktu"
              description={`Semua waktu ditampilkan dalam zona waktu bisnis (${business.timezone}).`}
              footer={
                <div className="flex w-full items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="gap-1.5"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Kembali</span>
                  </Button>
                  <Button
                    type="button"
                    disabled={!selectedTime || isDayClosed}
                    onClick={() => setStep(4)}
                    className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <span>Lanjut Isi Data Diri</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </div>
              }
            >
              <div className="space-y-6">
                {/* Date Picker */}
                <div className="space-y-2">
                  <Label htmlFor="booking-date">Pilih Tanggal Kunjungan</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {upcomingDates.map((dateStr) => {
                      const active = selectedDate === dateStr;
                      return (
                        <button
                          key={dateStr}
                          type="button"
                          onClick={() => setSelectedDate(dateStr)}
                          className={cn(
                            "flex flex-col items-center justify-center rounded-lg border px-3 py-2.5 text-xs transition-all min-h-11",
                            active
                              ? "border-indigo-600 bg-indigo-600 text-white font-semibold shadow-xs"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                          )}
                        >
                          <span>{formatDateId(dateStr)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Available Time Slots */}
                <div className="space-y-2.5">
                  <Label>Pilih Slot Waktu Tersedia</Label>
                  {isLoadingSlots ? (
                    <LoadingState variant="slots" />
                  ) : slotError ? (
                    <p className="text-xs text-red-600">{slotError}</p>
                  ) : isDayClosed ? (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-center text-xs sm:text-sm text-amber-800">
                      Bisnis tutup (libur operasional) pada tanggal{" "}
                      <span className="font-semibold">
                        {formatDateId(selectedDate)}
                      </span>
                      . Silakan pilih tanggal lain.
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-xs sm:text-sm text-slate-600">
                      Seluruh slot waktu pada tanggal ini sudah penuh. Silakan
                      pilih tanggal atau staf lain.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                      {slots.map((slot) => {
                        const isPicked = selectedTime === slot.time;
                        return (
                          <button
                            key={slot.time}
                            type="button"
                            aria-pressed={isPicked}
                            onClick={() => setSelectedTime(slot.time)}
                            className={cn(
                              "flex min-h-11 items-center justify-center rounded-lg border font-mono text-xs sm:text-sm font-semibold transition-all",
                              isPicked
                                ? "border-indigo-600 bg-indigo-600 text-white shadow-xs"
                                : "border-slate-200 bg-white text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/40"
                            )}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {step === 4 && (
            <SectionCard
              title="4. Informasi Kontak & Konfirmasi"
              description="Masukkan data kontak aktif Anda untuk menerima bukti reservasi."
            >
              <form
                onSubmit={handleSubmit(handleConfirmBooking)}
                noValidate
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <Label htmlFor="customerName">Nama Lengkap</Label>
                  <Input
                    id="customerName"
                    placeholder="Contoh: Andi Pratama"
                    aria-invalid={!!errors.customerName}
                    {...register("customerName")}
                  />
                  {errors.customerName && (
                    <p className="text-xs text-red-600">
                      {errors.customerName.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="customerEmail">Alamat Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="andi@example.com"
                      aria-invalid={!!errors.customerEmail}
                      {...register("customerEmail")}
                    />
                    {errors.customerEmail && (
                      <p className="text-xs text-red-600">
                        {errors.customerEmail.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="customerPhone">
                      Nomor Telepon / WhatsApp
                    </Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      placeholder="+6281234567890"
                      aria-invalid={!!errors.customerPhone}
                      {...register("customerPhone")}
                    />
                    {errors.customerPhone && (
                      <p className="text-xs text-red-600">
                        {errors.customerPhone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="customerNotes">
                    Catatan Tambahan (Opsional)
                  </Label>
                  <textarea
                    id="customerNotes"
                    rows={2}
                    placeholder="Preferensi khusus atau informasi tambahan untuk staf..."
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                    {...register("customerNotes")}
                  />
                  {errors.customerNotes && (
                    <p className="text-xs text-red-600">
                      {errors.customerNotes.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="gap-1.5"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Ubah Jadwal</span>
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-11 gap-2 bg-indigo-600 hover:bg-indigo-700 px-6 text-white font-semibold"
                  >
                    {isSubmitting && (
                      <Loader2 className="size-4 animate-spin" />
                    )}
                    <span>
                      {isSubmitting
                        ? "Memproses Reservasi..."
                        : "Konfirmasi Booking Sekarang"}
                    </span>
                  </Button>
                </div>
              </form>
            </SectionCard>
          )}
        </div>

        {/* Right Sticky Column: Live Booking Summary */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-20">
            <SectionCard
              title="Ringkasan Reservasi"
              description={business.name}
            >
              <div className="space-y-3.5 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="size-4 text-indigo-600 shrink-0" />
                    Layanan
                  </span>
                  <span className="font-semibold text-slate-900 text-right">
                    {selectedService?.name ?? "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Clock className="size-4 text-indigo-600 shrink-0" />
                    Durasi
                  </span>
                  <span className="font-medium text-slate-800">
                    {selectedService
                      ? formatDuration(selectedService.durationMinutes)
                      : "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="size-4 text-indigo-600 shrink-0" />
                    Staf
                  </span>
                  <span className="font-medium text-slate-800 text-right">
                    {selectedStaffId === "any"
                      ? "Siapa Saja yang Tersedia"
                      : selectedStaffObj?.name ?? "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="size-4 text-indigo-600 shrink-0" />
                    Jadwal
                  </span>
                  <span className="font-mono text-xs font-semibold text-slate-900 text-right">
                    {selectedDate ? formatDateId(selectedDate) : "-"}
                    {selectedTime ? ` • ${selectedTime} WIB` : ""}
                  </span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
                  <span className="font-semibold text-slate-900">
                    Estimasi Biaya
                  </span>
                  <span className="text-lg font-bold text-indigo-600">
                    {selectedService ? formatRupiah(selectedService.price) : "-"}
                  </span>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

