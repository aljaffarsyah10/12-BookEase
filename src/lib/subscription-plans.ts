export type SubscriptionPlanId = "FREE_TRIAL" | "STARTER" | "PRO" | "ENTERPRISE";
export type SubscriptionStatusId = "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";

export interface PlanDefinition {
  id: SubscriptionPlanId;
  name: string;
  badge?: string;
  price: number; // In Rupiah (IDR)
  priceFormatted: string;
  interval: "month";
  description: string;
  limits: {
    maxStaff: number; // Number or -1 for unlimited
    maxServices: number; // Number or -1 for unlimited
    maxBookingsPerMonth: number; // Number or -1 for unlimited
    hasAnalytics: boolean;
    hasEmailReminders: boolean;
  };
  features: string[];
  popular?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, PlanDefinition> = {
  FREE_TRIAL: {
    id: "FREE_TRIAL",
    name: "Free Trial (14 Hari)",
    badge: "Uji Coba Gratis",
    price: 0,
    priceFormatted: "Gratis (14 Hari)",
    interval: "month",
    description: "Nikmati akses fitur Pro selama 14 hari tanpa biaya komitmen.",
    limits: {
      maxStaff: 5,
      maxServices: 10,
      maxBookingsPerMonth: 100,
      hasAnalytics: true,
      hasEmailReminders: true,
    },
    features: [
      "Akses penuh fitur Pro selama 14 hari",
      "Hingga 5 Anggota Staf",
      "Hingga 10 Layanan Aktif",
      "Hingga 100 Reservasi per bulan",
      "Notifikasi Email & Kalender Pintar",
    ],
  },
  STARTER: {
    id: "STARTER",
    name: "Starter",
    badge: "Solo & Studio",
    price: 99000,
    priceFormatted: "Rp 99.000 / bln",
    interval: "month",
    description: "Solusi tepat bagi praktisi mandiri, barbershop kecil, atau studio privat.",
    limits: {
      maxStaff: 2,
      maxServices: 5,
      maxBookingsPerMonth: 100,
      hasAnalytics: false,
      hasEmailReminders: true,
    },
    features: [
      "1 Workspace Bisnis Resmi",
      "Hingga 2 Anggota Staf Aktif",
      "Hingga 5 Layanan Aktif",
      "100 Reservasi per bulan",
      "Pencegahan Double Booking Pintar",
      "Dukungan Email Standar",
    ],
  },
  PRO: {
    id: "PRO",
    name: "Pro Business",
    badge: "Paling Populer",
    popular: true,
    price: 199000,
    priceFormatted: "Rp 199.000 / bln",
    interval: "month",
    description: "Dirancang untuk klinik, salon, bengkel, dan tim berkembang dengan banyak staf.",
    limits: {
      maxStaff: 10,
      maxServices: 30,
      maxBookingsPerMonth: 500,
      hasAnalytics: true,
      hasEmailReminders: true,
    },
    features: [
      "Hingga 10 Anggota Staf Aktif",
      "Hingga 30 Layanan Aktif",
      "500 Reservasi per bulan",
      "Notifikasi Pengingat Pelanggan Otomatis",
      "Statistik & Analisis Performa Lengkap",
      "Prioritas Bantuan WhatsApp & Email",
    ],
  },
  ENTERPRISE: {
    id: "ENTERPRISE",
    name: "Enterprise",
    badge: "Skala Besar",
    price: 499000,
    priceFormatted: "Rp 499.000 / bln",
    interval: "month",
    description: "Kapasitas tanpa batas untuk jaringan waralaba dan multi-lokasi skala besar.",
    limits: {
      maxStaff: -1, // Unlimited
      maxServices: -1, // Unlimited
      maxBookingsPerMonth: -1, // Unlimited
      hasAnalytics: true,
      hasEmailReminders: true,
    },
    features: [
      "Anggota Staf Tanpa Batas",
      "Layanan Tanpa Batas",
      "Reservasi Tanpa Batas",
      "Dedicated Account Support",
      "Akses Early Feature & Custom Domain",
      "SLA Uptime 99.9%",
    ],
  },
};
