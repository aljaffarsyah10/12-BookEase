import { prisma } from "@/lib/prisma";
import type { OperatingHourItemValues } from "@/lib/validations/schedule.schema";

export const scheduleService = {
  async getByBusiness(businessId: string) {
    return prisma.operatingHour.findMany({
      where: { businessId },
      orderBy: { dayOfWeek: "asc" },
    });
  },

  async update(businessId: string, items: OperatingHourItemValues[]) {
    return prisma.$transaction(async (tx) => {
      for (const item of items) {
        await tx.operatingHour.upsert({
          where: {
            businessId_dayOfWeek: {
              businessId,
              dayOfWeek: item.dayOfWeek,
            },
          },
          update: {
            openTime: item.openTime,
            closeTime: item.closeTime,
            isClosed: item.isClosed,
          },
          create: {
            businessId,
            dayOfWeek: item.dayOfWeek,
            openTime: item.openTime,
            closeTime: item.closeTime,
            isClosed: item.isClosed,
          },
        });
      }

      return tx.operatingHour.findMany({
        where: { businessId },
        orderBy: { dayOfWeek: "asc" },
      });
    });
  },
};

