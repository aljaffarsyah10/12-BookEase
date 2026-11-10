import bcrypt from "bcryptjs";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import type { RegisterFormValues } from "@/lib/validations/auth.schema";

export const authService = {
  async register(input: RegisterFormValues) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError(
        "EMAIL_ALREADY_EXISTS",
        "Email sudah terdaftar. Silakan gunakan email lain atau masuk.",
        409
      );
    }

    const existingSlug = await prisma.business.findUnique({
      where: { slug: input.businessSlug.toLowerCase() },
    });

    if (existingSlug) {
      throw new AppError(
        "SLUG_ALREADY_EXISTS",
        "Slug URL bisnis sudah digunakan oleh bisnis lain. Pilih slug lain.",
        409
      );
    }

    const passwordHash = await bcrypt.hash(input.password, 12);

    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email.toLowerCase(),
          passwordHash,
        },
      });

      const business = await tx.business.create({
        data: {
          ownerId: user.id,
          name: input.businessName,
          slug: input.businessSlug.toLowerCase(),
          timezone: "Asia/Jakarta",
          bufferTimeMinutes: 10,
          subscriptionPlan: "FREE_TRIAL",
          subscriptionStatus: "TRIALING",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          currentPeriodEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });

      // Buat default 7 hari jam operasional
      const defaultHours = [
        { dayOfWeek: 0, openTime: "09:00", closeTime: "17:00", isClosed: true }, // Minggu
        { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
        { dayOfWeek: 2, openTime: "09:00", closeTime: "18:00", isClosed: false },
        { dayOfWeek: 3, openTime: "09:00", closeTime: "18:00", isClosed: false },
        { dayOfWeek: 4, openTime: "09:00", closeTime: "18:00", isClosed: false },
        { dayOfWeek: 5, openTime: "09:00", closeTime: "18:00", isClosed: false },
        { dayOfWeek: 6, openTime: "10:00", closeTime: "16:00", isClosed: false },
      ];

      await tx.operatingHour.createMany({
        data: defaultHours.map((h) => ({
          ...h,
          businessId: business.id,
        })),
      });

      return {
        user: { id: user.id, name: user.name, email: user.email },
        business: {
          id: business.id,
          name: business.name,
          slug: business.slug,
          timezone: business.timezone,
        },
      };
    });
  },

  async login(email: string, passwordPlain: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { business: true },
    });

    if (!user) {
      throw new AppError(
        "INVALID_CREDENTIALS",
        "Email atau password tidak sesuai.",
        401
      );
    }

    const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isValid) {
      throw new AppError(
        "INVALID_CREDENTIALS",
        "Email atau password tidak sesuai.",
        401
      );
    }

    return {
      user: { id: user.id, name: user.name, email: user.email },
      business: user.business,
    };
  },
};

