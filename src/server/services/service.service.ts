import { cacheDel, cacheGet, cacheInvalidatePrefix, cacheSet } from "@/lib/cache";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { ServiceFormValues } from "@/lib/validations/service.schema";
import { subscriptionService } from "./subscription.service";

export const serviceService = {
  async list(businessId: string, onlyActive = false) {
    const cacheKey = `services:${businessId}:${onlyActive}`;
    const cached = await cacheGet<Array<{
      id: string;
      businessId: string;
      name: string;
      description: string | null;
      price: number;
      durationMinutes: number;
      isActive: boolean;
      staffIds: string[];
    }>>(cacheKey);
    if (cached) {
      return cached;
    }

    const services = await prisma.service.findMany({
      where: {
        businessId,
        ...(onlyActive ? { isActive: true } : {}),
      },
      include: {
        staffServices: {
          select: { staffId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = services.map((s) => ({
      id: s.id,
      businessId: s.businessId,
      name: s.name,
      description: s.description,
      price: s.price,
      durationMinutes: s.durationMinutes,
      isActive: s.isActive,
      staffIds: s.staffServices.map((ss) => ss.staffId),
    }));

    await cacheSet(cacheKey, result, 60);

    return result;
  },

  async create(businessId: string, input: ServiceFormValues) {
    await subscriptionService.enforceLimit(businessId, "services");

    const created = await prisma.$transaction(async (tx) => {
      const service = await tx.service.create({
        data: {
          businessId,
          name: input.name,
          description: input.description || null,
          price: input.price,
          durationMinutes: input.durationMinutes,
          isActive: input.isActive,
        },
      });

      if (input.staffIds.length > 0) {
        await tx.staffService.createMany({
          data: input.staffIds.map((staffId) => ({
            serviceId: service.id,
            staffId,
          })),
        });
      }

      return {
        id: service.id,
        businessId: service.businessId,
        name: service.name,
        description: service.description,
        price: service.price,
        durationMinutes: service.durationMinutes,
        isActive: service.isActive,
        staffIds: input.staffIds,
      };
    });

    // Invalidate service and business public page caches
    await cacheDel(`services:${businessId}:true`);
    await cacheDel(`services:${businessId}:false`);
    await cacheInvalidatePrefix("biz:slug:");

    return created;
  },

  async update(businessId: string, id: string, input: ServiceFormValues) {
    const existing = await prisma.service.findFirst({
      where: { id, businessId },
    });
    if (!existing) {
      throw new AppError("SERVICE_NOT_FOUND", "Layanan tidak ditemukan.", 404);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.service.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description || null,
          price: input.price,
          durationMinutes: input.durationMinutes,
          isActive: input.isActive,
        },
      });

      await tx.staffService.deleteMany({ where: { serviceId: id } });
      if (input.staffIds.length > 0) {
        await tx.staffService.createMany({
          data: input.staffIds.map((staffId) => ({
            serviceId: id,
            staffId,
          })),
        });
      }

      return {
        id: res.id,
        businessId: res.businessId,
        name: res.name,
        description: res.description,
        price: res.price,
        durationMinutes: res.durationMinutes,
        isActive: res.isActive,
        staffIds: input.staffIds,
      };
    });

    await cacheDel(`services:${businessId}:true`);
    await cacheDel(`services:${businessId}:false`);
    await cacheInvalidatePrefix("biz:slug:");

    return updated;
  },

  async deleteOrDeactivate(businessId: string, id: string) {
    const existing = await prisma.service.findFirst({
      where: { id, businessId },
      include: { _count: { select: { bookings: true } } },
    });
    if (!existing) {
      throw new AppError("SERVICE_NOT_FOUND", "Layanan tidak ditemukan.", 404);
    }

    let result;
    if (existing._count.bookings > 0) {
      result = await prisma.service.update({
        where: { id },
        data: { isActive: false },
      });
    } else {
      result = await prisma.service.delete({ where: { id } });
    }

    await cacheDel(`services:${businessId}:true`);
    await cacheDel(`services:${businessId}:false`);
    await cacheInvalidatePrefix("biz:slug:");

    return result;
  },
};
