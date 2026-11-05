import crypto from "crypto";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { parseZonedTimeToUTC } from "@/lib/timezone";
import type { Booking, BookingStatus } from "@/types";

export interface CreateBookingInput {
  businessSlug: string;
  serviceId: string;
  staffId?: string; // "any" or concrete staffId
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes?: string;
}

interface RawBookingRecord {
  id: string;
  reference: string;
  businessId: string;
  serviceId: string;
  staffId: string;
  serviceNameSnapshot: string;
  servicePriceSnapshot: number;
  durationMinutesSnapshot: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes?: string | null;
  startAt: Date | string;
  endAt: Date | string;
  status: string;
  cancelReason?: string | null;
  createdAt: Date | string;
  staff?: { name: string } | null;
  business?: { timezone: string } | null;
}

function mapBookingToDto(
  b: RawBookingRecord,
  fallbackTimezone = "Asia/Jakarta"
): Booking {
  const timezone = b.business?.timezone || fallbackTimezone;
  const startAtDate = b.startAt instanceof Date ? b.startAt : new Date(b.startAt);
  const endAtDate = b.endAt instanceof Date ? b.endAt : new Date(b.endAt);
  const createdAtDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);

  const zonedStart = toZonedTime(startAtDate, timezone);
  const dateStr = format(zonedStart, "yyyy-MM-dd");
  const timeStr = format(zonedStart, "HH:mm");

  return {
    id: b.id,
    reference: b.reference,
    businessId: b.businessId,
    serviceId: b.serviceId,
    staffId: b.staffId,
    serviceNameSnapshot: b.serviceNameSnapshot,
    servicePriceSnapshot: b.servicePriceSnapshot,
    durationMinutesSnapshot: b.durationMinutesSnapshot,
    staffName: b.staff?.name ?? "Staf",
    customerName: b.customerName,
    customerEmail: b.customerEmail,
    customerPhone: b.customerPhone,
    customerNotes: b.customerNotes,
    date: dateStr,
    time: timeStr,
    startAt: startAtDate.toISOString(),
    endAt: endAtDate.toISOString(),
    status: b.status as BookingStatus,
    cancelReason: b.cancelReason,
    createdAt: createdAtDate.toISOString(),
  };
}

export const bookingService = {
  async listByOwner(
    businessId: string,
    filters?: {
      search?: string;
      status?: BookingStatus | "ALL";
      date?: string;
    }
  ) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { timezone: true },
    });
    const timezone = business?.timezone || "Asia/Jakarta";

    const bookings = await prisma.booking.findMany({
      where: {
        businessId,
        ...(filters?.status && filters.status !== "ALL"
          ? { status: filters.status }
          : {}),
        ...(filters?.search
          ? {
              OR: [
                { customerName: { contains: filters.search, mode: "insensitive" } },
                { customerEmail: { contains: filters.search, mode: "insensitive" } },
                { customerPhone: { contains: filters.search, mode: "insensitive" } },
                { reference: { contains: filters.search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        service: true,
        staff: true,
      },
      orderBy: { startAt: "desc" },
    });

    const mapped = bookings.map((b) => mapBookingToDto(b, timezone));

    if (filters?.date) {
      return mapped.filter((b) => b.date === filters.date);
    }

    return mapped;
  },

  async getById(businessId: string, id: string) {
    const booking = await prisma.booking.findFirst({
      where: { id, businessId },
      include: { service: true, staff: true, business: true },
    });
    if (!booking) {
      throw new AppError("BOOKING_NOT_FOUND", "Reservasi tidak ditemukan.", 404);
    }
    return mapBookingToDto(booking, booking.business.timezone);
  },

  async getByReference(reference: string) {
    const booking = await prisma.booking.findUnique({
      where: { reference },
      include: { service: true, staff: true, business: true },
    });
    if (!booking) {
      throw new AppError("BOOKING_NOT_FOUND", "Reservasi tidak ditemukan.", 404);
    }
    return mapBookingToDto(booking, booking.business.timezone);
  },

  async updateStatus(
    businessId: string,
    id: string,
    nextStatus: BookingStatus,
    cancelReason?: string
  ) {
    const booking = await prisma.booking.findFirst({
      where: { id, businessId },
      include: { business: true },
    });
    if (!booking) {
      throw new AppError("BOOKING_NOT_FOUND", "Reservasi tidak ditemukan.", 404);
    }

    // State machine check
    const terminalStates: BookingStatus[] = ["COMPLETED", "CANCELLED", "NO_SHOW"];
    if (terminalStates.includes(booking.status as BookingStatus)) {
      throw new AppError(
        "INVALID_STATUS_TRANSITION",
        `Reservasi dengan status ${booking.status} sudah bersifat final dan tidak dapat diubah lagi.`,
        400
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        status: nextStatus,
        cancelReason:
          nextStatus === "CANCELLED"
            ? cancelReason || "Dibatalkan oleh pemilik bisnis."
            : null,
        cancelledAt: nextStatus === "CANCELLED" ? new Date() : null,
      },
      include: { service: true, staff: true, business: true },
    });

    return mapBookingToDto(updated, updated.business.timezone);
  },

  async create(input: CreateBookingInput) {
    const business = await prisma.business.findUnique({
      where: { slug: input.businessSlug.toLowerCase() },
      include: { operatingHours: true },
    });

    if (!business) {
      throw new AppError("BUSINESS_NOT_FOUND", "Bisnis tidak ditemukan.", 404);
    }

    const service = await prisma.service.findFirst({
      where: { id: input.serviceId, businessId: business.id, isActive: true },
      include: { staffServices: { include: { staff: true } } },
    });

    if (!service) {
      throw new AppError("SERVICE_UNAVAILABLE", "Layanan tidak tersedia.", 400);
    }

    // Validasi jam operasional
    const [year, month, day] = input.date.split("-").map(Number);
    const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const operatingHour = business.operatingHours.find(
      (oh) => oh.dayOfWeek === dayOfWeek
    );

    if (!operatingHour || operatingHour.isClosed) {
      throw new AppError(
        "SLOT_UNAVAILABLE",
        "Bisnis tutup pada tanggal yang dipilih.",
        400
      );
    }

    // Tentukan kandidat staf aktif
    let eligibleStaff = service.staffServices
      .map((ss) => ss.staff)
      .filter((st) => st.isActive);

    if (input.staffId && input.staffId !== "any") {
      eligibleStaff = eligibleStaff.filter((st) => st.id === input.staffId);
    }

    if (eligibleStaff.length === 0) {
      throw new AppError(
        "SERVICE_UNAVAILABLE",
        "Tidak ada staf yang tersedia untuk layanan ini.",
        400
      );
    }

    const startAtUTC = parseZonedTimeToUTC(
      input.date,
      input.time,
      business.timezone
    );
    const endAtUTC = new Date(
      startAtUTC.getTime() + service.durationMinutes * 60000
    );
    const occupiedEndAtUTC = new Date(
      endAtUTC.getTime() + business.bufferTimeMinutes * 60000
    );

    if (startAtUTC <= new Date()) {
      throw new AppError(
        "SLOT_UNAVAILABLE",
        "Tidak dapat memesan waktu di masa lalu.",
        400
      );
    }

    // Lakukan transaksi database dengan concurrency prevention
    return prisma.$transaction(async (tx) => {
      // 1. Ambil seluruh booking aktif yang berkonflik
      const conflicts = await tx.booking.findMany({
        where: {
          staffId: { in: eligibleStaff.map((s) => s.id) },
          status: { in: ["PENDING", "CONFIRMED"] },
          startAt: { lt: occupiedEndAtUTC },
          occupiedEndAt: { gt: startAtUTC },
        },
        select: { staffId: true },
      });

      const conflictingStaffIds = new Set(conflicts.map((c) => c.staffId));
      const availableStaff = eligibleStaff.filter(
        (st) => !conflictingStaffIds.has(st.id)
      );

      if (availableStaff.length === 0) {
        throw new AppError(
          "BOOKING_CONFLICT",
          "Maaf, slot waktu yang dipilih baru saja terisi. Silakan pilih jam lain.",
          409
        );
      }

      // Alokasikan staf pertama yang tersedia
      const allocatedStaff = availableStaff[0];
      const compactDate = input.date.replace(/-/g, "");
      const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
      const reference = `BK-${compactDate}-${randomHex}`;

      const created = await tx.booking.create({
        data: {
          reference,
          businessId: business.id,
          serviceId: service.id,
          staffId: allocatedStaff.id,
          serviceNameSnapshot: service.name,
          servicePriceSnapshot: service.price,
          durationMinutesSnapshot: service.durationMinutes,
          bufferMinutesSnapshot: business.bufferTimeMinutes,
          customerName: input.customerName,
          customerEmail: input.customerEmail.toLowerCase(),
          customerPhone: input.customerPhone,
          customerNotes: input.customerNotes || null,
          startAt: startAtUTC,
          endAt: endAtUTC,
          occupiedEndAt: occupiedEndAtUTC,
          status: "CONFIRMED",
        },
        include: {
          service: true,
          staff: true,
          business: true,
        },
      });

      return mapBookingToDto(created, business.timezone);
    });
  },
};
