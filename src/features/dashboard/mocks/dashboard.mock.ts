/**
 * TEMPORARY PHASE 5 MOCK DATA — DO NOT USE IN PRODUCTION
 * Will be replaced by server-side dashboard summary queries in Phase 7.
 */
import { INITIAL_BOOKINGS_MOCK } from "@/features/bookings/mocks/booking.mock";

export interface DashboardSummaryStats {
  totalBookings: number;
  todayBookingsCount: number;
  upcomingBookingsCount: number;
  completedBookingsCount: number;
  pendingBookingsCount: number;
}

export function computeDashboardMockStats(
  bookings = INITIAL_BOOKINGS_MOCK,
  referenceDate = "2026-11-06"
): DashboardSummaryStats {
  const totalBookings = bookings.length;
  const todayBookingsCount = bookings.filter(
    (b) =>
      b.date === referenceDate &&
      (b.status === "CONFIRMED" || b.status === "PENDING")
  ).length;
  const upcomingBookingsCount = bookings.filter(
    (b) =>
      b.date >= referenceDate &&
      (b.status === "CONFIRMED" || b.status === "PENDING")
  ).length;
  const completedBookingsCount = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;
  const pendingBookingsCount = bookings.filter(
    (b) => b.status === "PENDING"
  ).length;

  return {
    totalBookings,
    todayBookingsCount,
    upcomingBookingsCount,
    completedBookingsCount,
    pendingBookingsCount,
  };
}

