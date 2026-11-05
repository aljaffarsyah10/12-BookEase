import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { BusinessProfileFormValues } from "@/lib/validations/business.schema";

export const businessService = {
  async getByOwner(businessId: string) {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });
    if (!business) {
      throw new AppError("BUSINESS_NOT_FOUND", "Bisnis tidak ditemukan.", 404);
    }
    return business;
  },

  async getPublicBySlug(slug: string) {
    const business = await prisma.business.findUnique({
      where: { slug: slug.toLowerCase() },
      include: {
        services: {
          where: { isActive: true },
          include: { staffServices: { select: { staffId: true } } },
        },
        staff: {
          where: { isActive: true },
          include: { staffServices: { select: { serviceId: true } } },
        },
        operatingHours: {
          orderBy: { dayOfWeek: "asc" },
        },
      },
    });

    if (!business) {
      throw new AppError("BUSINESS_NOT_FOUND", "Halaman bisnis tidak ditemukan.", 404);
    }

    return {
      ...business,
      services: business.services.map((s) => ({
        id: s.id,
        businessId: s.businessId,
        name: s.name,
        description: s.description,
        price: s.price,
        durationMinutes: s.durationMinutes,
        isActive: s.isActive,
        staffIds: s.staffServices.map((ss) => ss.staffId),
      })),
      staff: business.staff.map((st) => ({
        id: st.id,
        businessId: st.businessId,
        name: st.name,
        roleOrTitle: st.roleOrTitle,
        bio: st.bio,
        isActive: st.isActive,
        serviceIds: st.staffServices.map((ss) => ss.serviceId),
      })),
    };
  },

  async update(businessId: string, input: BusinessProfileFormValues) {
    if (input.slug) {
      const existing = await prisma.business.findFirst({
        where: {
          slug: input.slug.toLowerCase(),
          NOT: { id: businessId },
        },
      });
      if (existing) {
        throw new AppError("SLUG_ALREADY_EXISTS", "Slug bisnis sudah digunakan.", 409);
      }
    }

    return prisma.business.update({
      where: { id: businessId },
      data: {
        name: input.name,
        slug: input.slug.toLowerCase(),
        category: input.category,
        description: input.description || null,
        phone: input.phone || null,
        address: input.address || null,
        timezone: input.timezone,
        bufferTimeMinutes: input.bufferTimeMinutes,
      },
    });
  },
};
