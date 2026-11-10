import { cacheDel, cacheGet, cacheInvalidatePrefix, cacheSet } from "@/lib/cache";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { BusinessProfileFormValues } from "@/lib/validations/business.schema";

export interface PublicBusinessDto {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  phone: string | null;
  address: string | null;
  timezone: string;
  bufferTimeMinutes: number;
  services: Array<{
    id: string;
    businessId: string;
    name: string;
    description: string | null;
    price: number;
    durationMinutes: number;
    isActive: boolean;
    staffIds: string[];
  }>;
  staff: Array<{
    id: string;
    businessId: string;
    name: string;
    roleOrTitle: string | null;
    bio: string | null;
    isActive: boolean;
    serviceIds: string[];
  }>;
}

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

  async getPublicBySlug(slug: string): Promise<PublicBusinessDto> {
    const cacheKey = `biz:slug:${slug.toLowerCase()}`;
    const cached = await cacheGet<PublicBusinessDto>(cacheKey);
    if (cached) {
      return cached;
    }

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

    // Omit sensitive internal ownerId from public response
    const { ownerId: _omittedOwnerId, ...safeBusiness } = business;
    void _omittedOwnerId;

    const result = {
      ...safeBusiness,
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

    // Cache public profile for 120 seconds
    await cacheSet(cacheKey, result, 120);

    return result;
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

    const updated = await prisma.business.update({
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

    // Invalidate cached public pages
    await cacheDel(`biz:slug:${updated.slug}`);
    await cacheInvalidatePrefix("biz:slug:");

    return updated;
  },
};
