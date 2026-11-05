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
        services: { where: { isActive: true } },
        staff: { where: { isActive: true } },
        operatingHours: true,
      },
    });

    if (!business) {
      throw new AppError("BUSINESS_NOT_FOUND", "Halaman bisnis tidak ditemukan.", 404);
    }

    return business;
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

