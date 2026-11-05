import crypto from "crypto";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { parseZonedTimeToUTC } from "@/lib/timezone";
import type { BookingStatus } from "@/types";

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

export const bookingService = {
  async listByOwner(
    businessId: string,
    filters?: {
      search?: string;
      status?: BookingStatus | "ALL";
      date?: string;
    }
  ) {
    return prisma.booking.findMany({
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
  },

  async getById(businessId: string, id: string) {
    const booking = await prisma.booking.findFirst({
      where: { id, businessId },
      include: { service: true, staff: true },
    });
    if (!booking) {
      throw new AppError("BOOKING_NOT_FOUND", "Reservasi tidak ditemukan.", 404);
    }
    return booking;
  },

  async updateStatus(
    businessId: string,
    id: string,
    nextStatus: BookingStatus,
    cancelReason?: string
  ) {
    const booking = await prisma.booking.findFirst({
      where: { id, businessId },
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

    return prisma.booking.update({
      where: { id },
      data: {
        status: nextStatus,
        cancelReason:
          nextStatus === "CANCELLED"
            ? cancelReason || "Dibatalkan oleh pemilik bisnis."
            : null,
        cancelledAt: nextStatus === "CANCELLED" ? new Date() : null,
      },
    });
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

      return tx.booking.create({
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
    });
  },
};

