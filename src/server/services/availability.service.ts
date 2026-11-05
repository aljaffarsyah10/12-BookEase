import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { parseZonedTimeToUTC } from "@/lib/timezone";

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function minutesToTime(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export const availabilityService = {
  async getSlots(params: {
    slug: string;
    serviceId: string;
    date: string; // "YYYY-MM-DD"
    staffId?: string;
  }) {
    const business = await prisma.business.findUnique({
      where: { slug: params.slug.toLowerCase() },
      include: {
        operatingHours: true,
      },
    });

    if (!business) {
      throw new AppError("BUSINESS_NOT_FOUND", "Bisnis tidak ditemukan.", 404);
    }

    const service = await prisma.service.findFirst({
      where: { id: params.serviceId, businessId: business.id, isActive: true },
      include: {
        staffServices: {
          include: {
            staff: true,
          },
        },
      },
    });

    if (!service) {
      throw new AppError("SERVICE_UNAVAILABLE", "Layanan tidak tersedia.", 400);
    }

    // Tentukan hari dalam minggu (0 = Minggu)
    const [year, month, day] = params.date.split("-").map(Number);
    const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
    const operatingHour = business.operatingHours.find(
      (oh) => oh.dayOfWeek === dayOfWeek
    );

    if (!operatingHour || operatingHour.isClosed) {
      return { isClosed: true, timezone: business.timezone, slots: [] };
    }

    // Filter staf yang aktif dan berwenang
    let eligibleStaff = service.staffServices
      .map((ss) => ss.staff)
      .filter((st) => st.isActive);

    if (params.staffId && params.staffId !== "any") {
      eligibleStaff = eligibleStaff.filter((st) => st.id === params.staffId);
    }

    if (eligibleStaff.length === 0) {
      return { isClosed: false, timezone: business.timezone, slots: [] };
    }

    // Hitung jendela waktu lokal ke UTC
    const windowStartUTC = parseZonedTimeToUTC(
      params.date,
      operatingHour.openTime,
      business.timezone
    );
    const windowEndUTC = parseZonedTimeToUTC(
      params.date,
      operatingHour.closeTime,
      business.timezone
    );

    // Ambil semua booking aktif yang overlap dengan jendela waktu hari ini
    const activeBookings = await prisma.booking.findMany({
      where: {
        businessId: business.id,
        staffId: { in: eligibleStaff.map((s) => s.id) },
        status: { in: ["PENDING", "CONFIRMED"] },
        startAt: { lt: windowEndUTC },
        occupiedEndAt: { gt: windowStartUTC },
      },
      select: {
        staffId: true,
        startAt: true,
        occupiedEndAt: true,
      },
    });

    const openMins = timeToMinutes(operatingHour.openTime);
    const closeMins = timeToMinutes(operatingHour.closeTime);
    const duration = service.durationMinutes;
    const buffer = business.bufferTimeMinutes;
    const step = 30; // 30 menit step antar slot

    const nowUTC = new Date();
    const slots = [];

    for (let cursor = openMins; cursor + duration <= closeMins; cursor += step) {
      const timeStr = minutesToTime(cursor);
      const slotStartUTC = parseZonedTimeToUTC(
        params.date,
        timeStr,
        business.timezone
      );
      const slotEndUTC = new Date(slotStartUTC.getTime() + duration * 60000);
      const slotOccupiedEndUTC = new Date(
        slotEndUTC.getTime() + buffer * 60000
      );

      // Abaikan slot waktu di masa lalu
      if (slotStartUTC <= nowUTC) {
        continue;
      }

      // Cari staf yang bebas dari konflik
      const availableStaffIds = eligibleStaff
        .filter((st) => {
          const conflicts = activeBookings.filter(
            (b) =>
              b.staffId === st.id &&
              slotStartUTC < b.occupiedEndAt &&
              slotOccupiedEndUTC > b.startAt
          );
          return conflicts.length === 0;
        })
        .map((st) => st.id);

      if (availableStaffIds.length > 0) {
        slots.push({
          time: timeStr,
          startAt: slotStartUTC.toISOString(),
          endAt: slotEndUTC.toISOString(),
          availableStaffIds,
        });
      }
    }

    return {
      isClosed: false,
      timezone: business.timezone,
      serviceDurationMinutes: duration,
      bufferTimeMinutes: buffer,
      slots,
    };
  },
};

