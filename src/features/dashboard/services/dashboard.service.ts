import type { Booking } from "@/types";

export interface DashboardSummaryStats {
  totalBookings: number;
  todayBookingsCount: number;
  upcomingBookingsCount: number;
  completedBookingsCount: number;
  pendingBookingsCount: number;
  estimatedRevenue: number;
}

export function computeDashboardStats(
  bookings: Booking[],
  todayDateStr: string
): DashboardSummaryStats {
  const totalBookings = bookings.length;
  const todayBookingsCount = bookings.filter(
    (b) =>
      b.date === todayDateStr &&
      (b.status === "CONFIRMED" || b.status === "PENDING")
  ).length;

  const upcomingBookingsCount = bookings.filter(
    (b) =>
      b.date >= todayDateStr &&
      (b.status === "CONFIRMED" || b.status === "PENDING")
  ).length;

  const completedBookings = bookings.filter((b) => b.status === "COMPLETED");
  const completedBookingsCount = completedBookings.length;
  const pendingBookingsCount = bookings.filter(
    (b) => b.status === "PENDING"
  ).length;

  const estimatedRevenue = completedBookings.reduce(
    (sum, b) => sum + (b.servicePriceSnapshot || 0),
    0
  );

  return {
    totalBookings,
    todayBookingsCount,
    upcomingBookingsCount,
    completedBookingsCount,
    pendingBookingsCount,
    estimatedRevenue,
  };
}

