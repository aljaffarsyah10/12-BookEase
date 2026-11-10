import crypto from "crypto";
import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { verifyCancellationSignature } from "@/lib/cancellation-token";
import { sendBookingConfirmationEmail } from "@/lib/email";
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

export interface BookingListFilters {
  search?: string;
  status?: BookingStatus | "ALL";
  date?: string;
  sortBy?: "startAt" | "customerName" | "servicePriceSnapshot" | "status";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface PaginatedBookings {
  items: Booking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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
    filters?: BookingListFilters
  ): Promise<Booking[] | PaginatedBookings> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { timezone: true },
    });
    const timezone = business?.timezone || "Asia/Jakarta";

    let startAtFilter: { gte: Date; lt: Date } | undefined;
    if (filters?.date) {
      const dayStartUTC = parseZonedTimeToUTC(filters.date, "00:00", timezone);
      const [y, m, d] = filters.date.split("-").map(Number);
      const nextDate = new Date(Date.UTC(y, m - 1, d + 1));
      const nextDateStr = nextDate.toISOString().slice(0, 10);
      const nextDayStartUTC = parseZonedTimeToUTC(nextDateStr, "00:00", timezone);
      startAtFilter = {
        gte: dayStartUTC,
        lt: nextDayStartUTC,
      };
    }

    const whereClause: {
      businessId: string;
      status?: BookingStatus;
      startAt?: { gte: Date; lt: Date };
      OR?: Array<{
        customerName?: { contains: string; mode: "insensitive" };
        customerEmail?: { contains: string; mode: "insensitive" };
        customerPhone?: { contains: string; mode: "insensitive" };
        reference?: { contains: string; mode: "insensitive" };
      }>;
    } = {
      businessId,
      ...(startAtFilter ? { startAt: startAtFilter } : {}),
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
    };

    const validSortFields = [
      "startAt",
      "customerName",
      "servicePriceSnapshot",
      "status",
    ] as const;
    const sortBy =
      filters?.sortBy && validSortFields.includes(filters.sortBy)
        ? filters.sortBy
        : "startAt";
    const sortOrder = filters?.sortOrder === "asc" ? "asc" : "desc";
    const orderBy = { [sortBy]: sortOrder };

    if (filters?.page) {
      const page = Math.max(1, filters.page);
      const limit = Math.max(1, filters.limit || 10);

      const [total, bookings] = await Promise.all([
        prisma.booking.count({ where: whereClause }),
        prisma.booking.findMany({
          where: whereClause,
          include: {
            service: true,
            staff: true,
          },
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      const items = bookings.map((b) => mapBookingToDto(b, timezone));
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      };
    }

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        service: true,
        staff: true,
      },
      orderBy,
    });

    return bookings.map((b) => mapBookingToDto(b, timezone));
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

  async updateBulkStatus(
    businessId: string,
    ids: string[],
    nextStatus: BookingStatus,
    reason?: string
  ): Promise<{ updatedCount: number; updatedIds: string[] }> {
    if (!ids || ids.length === 0) {
      return { updatedCount: 0, updatedIds: [] };
    }

    const terminalStates: BookingStatus[] = ["COMPLETED", "CANCELLED", "NO_SHOW"];
    const eligibleBookings = await prisma.booking.findMany({
      where: {
        id: { in: ids },
        businessId,
        status: { notIn: terminalStates },
      },
      select: { id: true },
    });

    const eligibleIds = eligibleBookings.map((b) => b.id);
    if (eligibleIds.length === 0) {
      return { updatedCount: 0, updatedIds: [] };
    }

    await prisma.booking.updateMany({
      where: { id: { in: eligibleIds } },
      data: {
        status: nextStatus,
        cancelReason:
          nextStatus === "CANCELLED"
            ? reason || "Dibatalkan secara massal oleh pemilik bisnis."
            : null,
        cancelledAt: nextStatus === "CANCELLED" ? new Date() : null,
      },
    });

    return { updatedCount: eligibleIds.length, updatedIds: eligibleIds };
  },

  async cancelByCustomer(params: {
    reference: string;
    token: string;
    reason?: string;
  }) {
    const booking = await prisma.booking.findUnique({
      where: { reference: params.reference },
      include: { business: true, service: true, staff: true },
    });

    if (!booking) {
      throw new AppError("BOOKING_NOT_FOUND", "Data reservasi tidak ditemukan.", 404);
    }

    const isValid = verifyCancellationSignature(
      booking.reference,
      booking.id,
      params.token
    );

    if (!isValid) {
      throw new AppError(
        "INVALID_TOKEN",
        "Tautan pembatalan tidak sah atau telah kedaluwarsa.",
        403
      );
    }

    if (booking.status === "CANCELLED") {
      throw new AppError(
        "ALREADY_CANCELLED",
        "Reservasi ini sudah dibatalkan sebelumnya.",
        400
      );
    }

    if (booking.status === "COMPLETED" || booking.status === "NO_SHOW") {
      throw new AppError(
        "CANNOT_CANCEL_FINAL",
        "Reservasi yang telah selesai tidak dapat dibatalkan.",
        400
      );
    }

    // Cancellation policy: harus dilakukan sebelum waktu janji dimulai
    if (booking.startAt <= new Date()) {
      throw new AppError(
        "TIME_POLICY_VIOLATION",
        "Jadwal reservasi sudah berlangsung atau terlewat dan tidak dapat dibatalkan.",
        400
      );
    }

    const cancelled = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: params.reason || "Dibatalkan oleh pelanggan melalui tautan pembatalan.",
      },
      include: { business: true, service: true, staff: true },
    });

    return mapBookingToDto(cancelled, cancelled.business.timezone);
  },

  async getDashboardStats(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: { timezone: true },
    });
    const timezone = business?.timezone || "Asia/Jakarta";

    const allBookings = await prisma.booking.findMany({
      where: { businessId },
      select: {
        startAt: true,
        status: true,
        servicePriceSnapshot: true,
      },
    });

    const now = new Date();
    const todayStr = format(toZonedTime(now, timezone), "yyyy-MM-dd");

    let totalBookings = 0;
    let todayBookingsCount = 0;
    let upcomingBookingsCount = 0;
    let completedBookingsCount = 0;
    let cancelledBookingsCount = 0;
    let estimatedRevenue = 0;

    for (const b of allBookings) {
      totalBookings++;
      const zonedDate = toZonedTime(b.startAt, timezone);
      const bDateStr = format(zonedDate, "yyyy-MM-dd");

      if (b.status === "COMPLETED") {
        completedBookingsCount++;
        estimatedRevenue += b.servicePriceSnapshot;
      } else if (b.status === "CANCELLED") {
        cancelledBookingsCount++;
      }

      if (bDateStr === todayStr && (b.status === "CONFIRMED" || b.status === "PENDING")) {
        todayBookingsCount++;
      }

      if (b.startAt >= now && (b.status === "CONFIRMED" || b.status === "PENDING")) {
        upcomingBookingsCount++;
      }
    }

    return {
      totalBookings,
      todayBookingsCount,
      upcomingBookingsCount,
      completedBookingsCount,
      cancelledBookingsCount,
      estimatedRevenue,
    };
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
    const mapped = await prisma.$transaction(async (tx) => {
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

    // Send confirmation email asynchronously (does not block or fail booking)
    sendBookingConfirmationEmail({
      booking: mapped,
      businessName: business.name,
      businessPhone: business.phone,
      businessAddress: business.address,
    }).catch((err) => console.error("[ASYNC_CONFIRMATION_EMAIL_ERROR]", err));

    return mapped;
  },
};
