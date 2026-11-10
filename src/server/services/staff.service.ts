import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { StaffFormValues } from "@/lib/validations/staff.schema";
import { subscriptionService } from "./subscription.service";

export const staffService = {
  async list(businessId: string, onlyActive = false) {
    const staff = await prisma.staff.findMany({
      where: {
        businessId,
        ...(onlyActive ? { isActive: true } : {}),
      },
      include: {
        staffServices: {
          select: { serviceId: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return staff.map((st) => ({
      id: st.id,
      businessId: st.businessId,
      name: st.name,
      roleOrTitle: st.roleOrTitle,
      bio: st.bio,
      isActive: st.isActive,
      serviceIds: st.staffServices.map((ss) => ss.serviceId),
    }));
  },

  async create(businessId: string, input: StaffFormValues) {
    await subscriptionService.enforceLimit(businessId, "staff");

    return prisma.$transaction(async (tx) => {
      const staff = await tx.staff.create({
        data: {
          businessId,
          name: input.name,
          roleOrTitle: input.roleOrTitle,
          bio: input.bio || null,
          isActive: input.isActive,
        },
      });

      if (input.serviceIds.length > 0) {
        await tx.staffService.createMany({
          data: input.serviceIds.map((serviceId) => ({
            staffId: staff.id,
            serviceId,
          })),
        });
      }

      return {
        id: staff.id,
        businessId: staff.businessId,
        name: staff.name,
        roleOrTitle: staff.roleOrTitle,
        bio: staff.bio,
        isActive: staff.isActive,
        serviceIds: input.serviceIds,
      };
    });
  },

  async update(businessId: string, id: string, input: StaffFormValues) {
    const existing = await prisma.staff.findFirst({
      where: { id, businessId },
    });
    if (!existing) {
      throw new AppError("STAFF_NOT_FOUND", "Staf tidak ditemukan.", 404);
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.staff.update({
        where: { id },
        data: {
          name: input.name,
          roleOrTitle: input.roleOrTitle,
          bio: input.bio || null,
          isActive: input.isActive,
        },
      });

      await tx.staffService.deleteMany({ where: { staffId: id } });
      if (input.serviceIds.length > 0) {
        await tx.staffService.createMany({
          data: input.serviceIds.map((serviceId) => ({
            staffId: id,
            serviceId,
          })),
        });
      }

      return {
        id: updated.id,
        businessId: updated.businessId,
        name: updated.name,
        roleOrTitle: updated.roleOrTitle,
        bio: updated.bio,
        isActive: updated.isActive,
        serviceIds: input.serviceIds,
      };
    });
  },
};
