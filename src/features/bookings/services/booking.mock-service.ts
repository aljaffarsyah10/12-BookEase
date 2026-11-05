/**
 * TEMPORARY PHASE 5 MOCK SERVICE — DO NOT USE IN PRODUCTION
 * Replace with `/api/v1/bookings`, `/api/v1/bookings/[id]`, and `/api/v1/availability` in Phase 7.
 */
import { INITIAL_BOOKINGS_MOCK } from "@/features/bookings/mocks/booking.mock";
import { businessMockService } from "@/features/business/services/business.mock-service";
import { scheduleMockService } from "@/features/schedule/services/schedule.mock-service";
import { serviceMockService } from "@/features/services/services/service.mock-service";
import { staffMockService } from "@/features/staff/services/staff.mock-service";
import type { Booking, BookingStatus, TimeSlot } from "@/types";

const STORAGE_KEY = "bookease_mock_bookings_v1";

function loadBookingsState(): Booking[] {
  if (typeof window === "undefined") {
    return [...INITIAL_BOOKINGS_MOCK];
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Booking[];
  } catch {
    // ignore storage errors
  }
  return [...INITIAL_BOOKINGS_MOCK];
}

function saveBookingsState(bookings: Booking[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch {
    // ignore storage errors
  }
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export interface CreateMockBookingInput {
  businessSlug: string;
  serviceId: string;
  staffId: string; // "any" or concrete staffId
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes?: string;
}

export const bookingMockService = {
  async listBookings(filters?: {
    search?: string;
    status?: BookingStatus | "ALL";
    date?: string;
  }): Promise<Booking[]> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    let items = loadBookingsState();

    if (filters?.status && filters.status !== "ALL") {
      items = items.filter((b) => b.status === filters.status);
    }

    if (filters?.date) {
      items = items.filter((b) => b.date === filters.date);
    }

    if (filters?.search?.trim()) {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (b) =>
          b.customerName.toLowerCase().includes(q) ||
          b.customerEmail.toLowerCase().includes(q) ||
          b.customerPhone.toLowerCase().includes(q) ||
          b.reference.toLowerCase().includes(q) ||
          b.serviceNameSnapshot.toLowerCase().includes(q)
      );
    }

    return items.sort((a, b) =>
      `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)
    );
  },

  async getBookingById(id: string): Promise<Booking | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const all = loadBookingsState();
    return all.find((b) => b.id === id) ?? null;
  },

  async getBookingByReference(reference: string): Promise<Booking | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const all = loadBookingsState();
    return all.find((b) => b.reference === reference) ?? all[0] ?? null;
  },

  async updateBookingStatus(
    id: string,
    status: BookingStatus,
    cancelReason?: string
  ): Promise<Booking> {
    await new Promise((resolve) => setTimeout(resolve, 280));
    const all = loadBookingsState();
    const idx = all.findIndex((b) => b.id === id);
    if (idx === -1) {
      throw new Error("Data reservasi tidak ditemukan");
    }

    const updated: Booking = {
      ...all[idx],
      status,
      cancelReason:
        status === "CANCELLED"
          ? cancelReason || "Dibatalkan oleh pemilik bisnis."
          : all[idx].cancelReason,
    };
    all[idx] = updated;
    saveBookingsState(all);
    return updated;
  },

  async getAvailableSlots(params: {
    date: string;
    serviceId: string;
    staffId?: string;
  }): Promise<{
    isClosed: boolean;
    slots: TimeSlot[];
  }> {
    await new Promise((resolve) => setTimeout(resolve, 220));
    const [business, services, staffList, schedule] = await Promise.all([
      businessMockService.getBusiness(),
      serviceMockService.listServices(true),
      staffMockService.listStaff(true),
      scheduleMockService.getSchedule(),
    ]);

    const service = services.find((s) => s.id === params.serviceId);
    if (!service) {
      return { isClosed: true, slots: [] };
    }

    const [year, month, day] = params.date.split("-").map(Number);
    const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const operatingHour = schedule.find((oh) => oh.dayOfWeek === dayOfWeek);

    if (!operatingHour || operatingHour.isClosed) {
      return { isClosed: true, slots: [] };
    }

    // Eligible staff for this service
    let candidateStaff = staffList.filter(
      (st) =>
        st.isActive &&
        (st.serviceIds.includes(service.id) ||
          service.staffIds.includes(st.id))
    );

    if (params.staffId && params.staffId !== "any") {
      candidateStaff = candidateStaff.filter((st) => st.id === params.staffId);
    }

    if (candidateStaff.length === 0) {
      return { isClosed: false, slots: [] };
    }

    const activeBookings = loadBookingsState().filter(
      (b) =>
        b.date === params.date &&
        (b.status === "PENDING" || b.status === "CONFIRMED")
    );

    const openMins = timeToMinutes(operatingHour.openTime);
    const closeMins = timeToMinutes(operatingHour.closeTime);
    const duration = service.durationMinutes;
    const buffer = business.bufferTimeMinutes;
    const step = 30;

    const slots: TimeSlot[] = [];

    for (
      let cursor = openMins;
      cursor + duration <= closeMins;
      cursor += step
    ) {
      const slotStart = cursor;
      const slotEnd = cursor + duration;
      const slotOccupiedEnd = slotEnd + buffer;

      const availableStaffIds = candidateStaff
        .filter((st) => {
          const staffBookings = activeBookings.filter(
            (b) => b.staffId === st.id
          );
          const hasConflict = staffBookings.some((b) => {
            const bStart = timeToMinutes(b.time);
            const bOccupiedEnd =
              bStart + b.durationMinutesSnapshot + buffer;
            return slotStart < bOccupiedEnd && slotOccupiedEnd > bStart;
          });
          return !hasConflict;
        })
        .map((st) => st.id);

      if (availableStaffIds.length > 0) {
        const timeStr = minutesToTime(slotStart);
        const endTimeStr = minutesToTime(slotEnd);
        slots.push({
          time: timeStr,
          startAt: `${params.date}T${timeStr}:00.000Z`,
          endAt: `${params.date}T${endTimeStr}:00.000Z`,
          availableStaffIds,
        });
      }
    }

    return { isClosed: false, slots };
  },

  async createBooking(input: CreateMockBookingInput): Promise<Booking> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const [services, staffList] = await Promise.all([
      serviceMockService.listServices(true),
      staffMockService.listStaff(true),
    ]);

    const service = services.find((s) => s.id === input.serviceId);
    if (!service) {
      throw new Error("Layanan yang dipilih tidak tersedia.");
    }

    const availability = await this.getAvailableSlots({
      date: input.date,
      serviceId: input.serviceId,
      staffId: input.staffId,
    });

    const matchedSlot = availability.slots.find((s) => s.time === input.time);
    if (!matchedSlot || matchedSlot.availableStaffIds.length === 0) {
      throw new Error(
        "Maaf, slot waktu yang dipilih baru saja terisi. Silakan pilih jam lain."
      );
    }

    const allocatedStaffId =
      input.staffId &&
      input.staffId !== "any" &&
      matchedSlot.availableStaffIds.includes(input.staffId)
        ? input.staffId
        : matchedSlot.availableStaffIds[0];

    const allocatedStaff = staffList.find((st) => st.id === allocatedStaffId);
    const compactDate = input.date.replace(/-/g, "");
    const randomCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    const created: Booking = {
      id: `bkg_${Date.now().toString(36)}`,
      reference: `BK-${compactDate}-${randomCode}`,
      businessId: "biz_glow_01",
      serviceId: service.id,
      staffId: allocatedStaffId,
      serviceNameSnapshot: service.name,
      servicePriceSnapshot: service.price,
      durationMinutesSnapshot: service.durationMinutes,
      staffName: allocatedStaff?.name ?? "Staf Tersedia",
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      customerNotes: input.customerNotes || null,
      date: input.date,
      time: input.time,
      startAt: matchedSlot.startAt,
      endAt: matchedSlot.endAt,
      status: "CONFIRMED",
      cancelReason: null,
      createdAt: new Date().toISOString(),
    };

    const all = loadBookingsState();
    saveBookingsState([created, ...all]);
    return created;
  },
};

