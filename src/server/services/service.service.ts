import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { ServiceFormValues } from "@/lib/validations/service.schema";

export const serviceService = {
  async list(businessId: string, onlyActive = false) {
    return prisma.service.findMany({
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
  },

  async create(businessId: string, input: ServiceFormValues) {
    return prisma.$transaction(async (tx) => {
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

      return service;
    });
  },

  async update(businessId: string, id: string, input: ServiceFormValues) {
    const existing = await prisma.service.findFirst({
      where: { id, businessId },
    });
    if (!existing) {
      throw new AppError("SERVICE_NOT_FOUND", "Layanan tidak ditemukan.", 404);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.service.update({
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

      return updated;
    });
  },

  async deleteOrDeactivate(businessId: string, id: string) {
    const existing = await prisma.service.findFirst({
      where: { id, businessId },
      include: { _count: { select: { bookings: true } } },
    });
    if (!existing) {
      throw new AppError("SERVICE_NOT_FOUND", "Layanan tidak ditemukan.", 404);
    }

    if (existing._count.bookings > 0) {
      return prisma.service.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return prisma.service.delete({ where: { id } });
  },
};

