import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
  type SubscriptionStatusId,
} from "@/lib/subscription-plans";

export interface BusinessUsageSummary {
  plan: SubscriptionPlanId;
  status: SubscriptionStatusId;
  planName: string;
  priceFormatted: string;
  trialEndsAt: string | null;
  trialDaysLeft: number;
  currentPeriodEnd: string | null;
  isExpired: boolean;
  usage: {
    services: {
      used: number;
      limit: number;
      percentage: number;
    };
    staff: {
      used: number;
      limit: number;
      percentage: number;
    };
    bookingsThisMonth: {
      used: number;
      limit: number;
      percentage: number;
    };
  };
  features: {
    hasAnalytics: boolean;
    hasEmailReminders: boolean;
  };
}

export const subscriptionService = {
  /**
   * Get subscription details, usage counts, and entitlement limits for a business.
   */
  async getSubscriptionDetails(businessId: string): Promise<BusinessUsageSummary> {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        currentPeriodEnd: true,
      },
    });

    if (!business) {
      throw new AppError("BUSINESS_NOT_FOUND", "Bisnis tidak ditemukan.", 404);
    }

    const planKey = (business.subscriptionPlan || "FREE_TRIAL") as SubscriptionPlanId;
    let status = (business.subscriptionStatus || "TRIALING") as SubscriptionStatusId;
    const planDef = SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS.FREE_TRIAL;

    const now = new Date();
    let trialDaysLeft = 0;
    let isExpired = false;

    if (planKey === "FREE_TRIAL" && business.trialEndsAt) {
      const msLeft = new Date(business.trialEndsAt).getTime() - now.getTime();
      trialDaysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      if (msLeft <= 0 && status === "TRIALING") {
        status = "EXPIRED";
        // Auto-update expired status in background
        await prisma.business.update({
          where: { id: businessId },
          data: { subscriptionStatus: "EXPIRED" },
        });
      }
    } else if (business.currentPeriodEnd) {
      const msLeft = new Date(business.currentPeriodEnd).getTime() - now.getTime();
      if (msLeft <= 0 && status === "ACTIVE") {
        status = "PAST_DUE";
        await prisma.business.update({
          where: { id: businessId },
          data: { subscriptionStatus: "PAST_DUE" },
        });
      }
    }

    isExpired = status === "EXPIRED" || status === "CANCELLED";

    // Hitung awal dan akhir bulan berjalan untuk kuota booking bulanan
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [servicesCount, staffCount, bookingsCount] = await Promise.all([
      prisma.service.count({
        where: { businessId, isActive: true },
      }),
      prisma.staff.count({
        where: { businessId, isActive: true },
      }),
      prisma.booking.count({
        where: {
          businessId,
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
      }),
    ]);

    const calculatePercentage = (used: number, limit: number) => {
      if (limit <= 0) return 0; // Unlimited
      return Math.min(100, Math.round((used / limit) * 100));
    };

    return {
      plan: planKey,
      status,
      planName: planDef.name,
      priceFormatted: planDef.priceFormatted,
      trialEndsAt: business.trialEndsAt ? business.trialEndsAt.toISOString() : null,
      trialDaysLeft,
      currentPeriodEnd: business.currentPeriodEnd ? business.currentPeriodEnd.toISOString() : null,
      isExpired,
      usage: {
        services: {
          used: servicesCount,
          limit: planDef.limits.maxServices,
          percentage: calculatePercentage(servicesCount, planDef.limits.maxServices),
        },
        staff: {
          used: staffCount,
          limit: planDef.limits.maxStaff,
          percentage: calculatePercentage(staffCount, planDef.limits.maxStaff),
        },
        bookingsThisMonth: {
          used: bookingsCount,
          limit: planDef.limits.maxBookingsPerMonth,
          percentage: calculatePercentage(bookingsCount, planDef.limits.maxBookingsPerMonth),
        },
      },
      features: {
        hasAnalytics: planDef.limits.hasAnalytics,
        hasEmailReminders: planDef.limits.hasEmailReminders,
      },
    };
  },

  /**
   * Enforce limit before creating a service, staff, or booking.
   * Throws AppError 403 if quota is exceeded or subscription expired.
   */
  async enforceLimit(
    businessId: string,
    resource: "services" | "staff" | "bookings"
  ): Promise<void> {
    const details = await this.getSubscriptionDetails(businessId);

    if (details.isExpired) {
      throw new AppError(
        "SUBSCRIPTION_EXPIRED",
        `Masa aktif paket ${details.planName} Anda telah berakhir. Silakan tingkatkan paket langganan Anda untuk melanjutkan pembuatan ${
          resource === "services" ? "layanan" : resource === "staff" ? "staf" : "reservasi"
        }.`,
        403
      );
    }

    if (resource === "services") {
      const { used, limit } = details.usage.services;
      if (limit > 0 && used >= limit) {
        throw new AppError(
          "SERVICE_LIMIT_REACHED",
          `Batas kuota layanan untuk paket ${details.planName} telah tercapai (${used}/${limit}). Tingkatkan paket Anda ke Pro Business atau Enterprise untuk menambah lebih banyak layanan.`,
          403
        );
      }
    } else if (resource === "staff") {
      const { used, limit } = details.usage.staff;
      if (limit > 0 && used >= limit) {
        throw new AppError(
          "STAFF_LIMIT_REACHED",
          `Batas kuota anggota staf untuk paket ${details.planName} telah tercapai (${used}/${limit}). Tingkatkan paket Anda ke Pro Business atau Enterprise untuk menambah lebih banyak staf.`,
          403
        );
      }
    } else if (resource === "bookings") {
      const { used, limit } = details.usage.bookingsThisMonth;
      if (limit > 0 && used >= limit) {
        throw new AppError(
          "BOOKING_LIMIT_REACHED",
          `Batas kuota reservasi bulanan untuk paket ${details.planName} telah tercapai (${used}/${limit} reservasi bulan ini). Tingkatkan paket Anda agar pelanggan tetap dapat melakukan reservasi.`,
          403
        );
      }
    }
  },

  /**
   * Cancel active subscription.
   */
  async cancelSubscription(businessId: string): Promise<void> {
    await prisma.business.update({
      where: { id: businessId },
      data: { subscriptionStatus: "CANCELLED" },
    });
  },
};
