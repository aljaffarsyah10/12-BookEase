import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node experimental strip types requires extension
import { generateCancellationSignature, verifyCancellationSignature } from "../src/lib/cancellation-token.ts";
// @ts-expect-error Node experimental strip types requires extension
import { parseZonedTimeToUTC } from "../src/lib/timezone.ts";
// @ts-expect-error Node experimental strip types requires extension
import { createBookingSchema } from "../src/lib/validations/booking.schema.ts";

/**
 * End-to-End User Journey Simulation:
 * 1. Customer visits public business profile
 * 2. Selects a service & staff
 * 3. Checks available time slots
 * 4. Books an appointment
 * 5. Receives reference code & cancellation token
 * 6. Verifies customer cancellation flow
 * 7. Verifies slot release upon cancellation
 */
test("E2E Workflow: Complete Customer Booking and Self-Cancellation Lifecycle", () => {
  const business = {
    id: "biz_barbershop_001",
    name: "Barbershop Rapi",
    slug: "barbershop-rapi",
    timezone: "Asia/Jakarta",
    bufferTimeMinutes: 10,
    operatingHours: [
      { dayOfWeek: 1, openTime: "09:00", closeTime: "18:00", isClosed: false },
    ],
  };

  const service = {
    id: "srv_haircut_001",
    name: "Gentleman Haircut & Wash",
    price: 75000,
    durationMinutes: 45,
    staffIds: ["stf_andi_001"],
  };

  const staff = {
    id: "stf_andi_001",
    name: "Andi Pratama",
    isActive: true,
  };

  // State store for active bookings
  interface ActiveBooking {
    id: string;
    reference: string;
    staffId: string;
    startAt: Date;
    endAt: Date;
    occupiedEndAt: Date;
    status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    customerName: string;
    customerEmail: string;
  }
  const bookingsStore: ActiveBooking[] = [];

  // Step 1: Validate Booking Request Input against Zod Schema
  const bookingPayload = {
    businessSlug: "barbershop-rapi",
    serviceId: service.id,
    staffId: staff.id,
    date: "2026-11-16",
    time: "10:00",
    customerName: "Budi Santoso",
    customerEmail: "budi.santoso@gmail.com",
    customerPhone: "081234567890",
    customerNotes: "Model undercut rapi",
  };
  const parsed = createBookingSchema.safeParse(bookingPayload);
  assert.equal(parsed.success, true);

  // Step 2: Time calculations (Asia/Jakarta UTC+7)
  const startAtUTC = parseZonedTimeToUTC(bookingPayload.date, bookingPayload.time, business.timezone);
  const endAtUTC = new Date(startAtUTC.getTime() + service.durationMinutes * 60000);
  const occupiedEndAtUTC = new Date(endAtUTC.getTime() + business.bufferTimeMinutes * 60000);

  // Step 3: Check Slot Availability (No conflicts should exist initially)
  const conflicts = bookingsStore.filter(
    (b) =>
      b.staffId === staff.id &&
      b.status !== "CANCELLED" &&
      startAtUTC < b.occupiedEndAt &&
      occupiedEndAtUTC > b.startAt
  );
  assert.equal(conflicts.length, 0);

  // Step 4: Create Booking Record
  const bookingId = "bk_test_123456";
  const reference = "BK-20261116-A1B2C3";
  const newBooking: ActiveBooking = {
    id: bookingId,
    reference,
    staffId: staff.id,
    startAt: startAtUTC,
    endAt: endAtUTC,
    occupiedEndAt: occupiedEndAtUTC,
    status: "CONFIRMED",
    customerName: bookingPayload.customerName,
    customerEmail: bookingPayload.customerEmail,
  };
  bookingsStore.push(newBooking);
  assert.equal(bookingsStore.length, 1);

  // Step 5: Duplicate Booking on the same slot must CONFLICT
  const secondAttemptConflicts = bookingsStore.filter(
    (b) =>
      b.staffId === staff.id &&
      b.status !== "CANCELLED" &&
      startAtUTC < b.occupiedEndAt &&
      occupiedEndAtUTC > b.startAt
  );
  assert.equal(secondAttemptConflicts.length, 1);

  // Step 6: Customer initiates cancellation using HMAC token
  const token = generateCancellationSignature(reference, bookingId);
  assert.equal(verifyCancellationSignature(reference, bookingId, token), true);

  // Tampered token fails
  assert.equal(verifyCancellationSignature(reference, bookingId, "tampered-token-12345678"), false);

  // Step 7: Cancel the booking
  const foundBooking = bookingsStore.find((b) => b.reference === reference);
  assert.ok(foundBooking);
  foundBooking.status = "CANCELLED";

  // Step 8: Verify slot is released and now available again
  const postCancelConflicts = bookingsStore.filter(
    (b) =>
      b.staffId === staff.id &&
      b.status !== "CANCELLED" &&
      startAtUTC < b.occupiedEndAt &&
      occupiedEndAtUTC > b.startAt
  );
  assert.equal(postCancelConflicts.length, 0);
});
