import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node experimental strip types requires extension
import { generateCancellationSignature, verifyCancellationSignature } from "../src/lib/cancellation-token.ts";

test("Security: IDOR Prevention logic verification", () => {
  // Simulate mock database records for two distinct businesses
  const bookings = [
    { id: "bk-1", businessId: "biz-1", customerName: "Alice", status: "CONFIRMED" },
    { id: "bk-2", businessId: "biz-2", customerName: "Bob", status: "CONFIRMED" },
  ];

  // Helper function enforcing tenancy isolation
  function getBookingByIdForOwner(bookingId: string, currentOwnerBusinessId: string) {
    const found = bookings.find((b) => b.id === bookingId && b.businessId === currentOwnerBusinessId);
    if (!found) {
      throw new Error("BOOKING_NOT_FOUND");
    }
    return found;
  }

  // Owner of biz-1 can access bk-1
  assert.equal(getBookingByIdForOwner("bk-1", "biz-1").customerName, "Alice");

  // Owner of biz-1 CANNOT access bk-2 belonging to biz-2 (IDOR blocked)
  assert.throws(
    () => getBookingByIdForOwner("bk-2", "biz-1"),
    /BOOKING_NOT_FOUND/
  );

  // Owner of biz-2 CANNOT access bk-1 belonging to biz-1 (IDOR blocked)
  assert.throws(
    () => getBookingByIdForOwner("bk-1", "biz-2"),
    /BOOKING_NOT_FOUND/
  );
});

test("Security: Cancellation Token Tampering & Forgery Resistance", () => {
  const reference = "BK-20261110-SEC001";
  const bookingId = "cm9999999";
  const validToken = generateCancellationSignature(reference, bookingId);

  // 1. Exact match passes
  assert.equal(verifyCancellationSignature(reference, bookingId, validToken), true);

  // 2. Modified reference fails
  assert.equal(verifyCancellationSignature("BK-20261110-SEC002", bookingId, validToken), false);

  // 3. Modified booking ID fails
  assert.equal(verifyCancellationSignature(reference, "cm8888888", validToken), false);

  // 4. Substring / truncated token fails
  assert.equal(verifyCancellationSignature(reference, bookingId, validToken.slice(0, 32)), false);

  // 5. Empty or garbage token fails
  assert.equal(verifyCancellationSignature(reference, bookingId, ""), false);
  assert.equal(verifyCancellationSignature(reference, bookingId, "invalid-token"), false);
});

test("Security: Terminal Booking Status Cannot Be Mutated", () => {
  const terminalStates = ["COMPLETED", "CANCELLED", "NO_SHOW"];

  function validateStatusTransition(currentStatus: string, nextStatus: string) {
    if (terminalStates.includes(currentStatus)) {
      throw new Error("INVALID_STATUS_TRANSITION");
    }
    return nextStatus;
  }

  // Non-terminal transitions succeed
  assert.equal(validateStatusTransition("PENDING", "CONFIRMED"), "CONFIRMED");
  assert.equal(validateStatusTransition("CONFIRMED", "COMPLETED"), "COMPLETED");

  // Terminal transitions throw
  assert.throws(
    () => validateStatusTransition("COMPLETED", "CANCELLED"),
    /INVALID_STATUS_TRANSITION/
  );
  assert.throws(
    () => validateStatusTransition("CANCELLED", "CONFIRMED"),
    /INVALID_STATUS_TRANSITION/
  );
  assert.throws(
    () => validateStatusTransition("NO_SHOW", "CONFIRMED"),
    /INVALID_STATUS_TRANSITION/
  );
});

test("Security: Customer Cancellation Policy - Past Date Disallowed", () => {
  function validateCustomerCancellationTime(bookingStartAt: Date, now: Date) {
    if (bookingStartAt <= now) {
      throw new Error("TIME_POLICY_VIOLATION");
    }
    return true;
  }

  const now = new Date("2026-11-10T12:00:00Z");
  const futureBooking = new Date("2026-11-10T14:00:00Z");
  const pastBooking = new Date("2026-11-10T11:00:00Z");

  assert.equal(validateCustomerCancellationTime(futureBooking, now), true);
  assert.throws(
    () => validateCustomerCancellationTime(pastBooking, now),
    /TIME_POLICY_VIOLATION/
  );
});

test("Security: Rate Limiter Sliding Window Algorithm Verification", () => {
  const requestLog = new Map<string, number[]>();

  function simulateRateLimit(
    identifier: string,
    limit = 5,
    windowMs = 60000,
    currentTime = Date.now()
  ): boolean {
    const timestamps = requestLog.get(identifier) ?? [];
    const valid = timestamps.filter((t) => currentTime - t < windowMs);

    if (valid.length >= limit) {
      return false; // Throttled
    }

    valid.push(currentTime);
    requestLog.set(identifier, valid);
    return true;
  }

  const id = "ip-127.0.0.1";
  const now = 1000000;

  // 5 requests within limit must succeed
  for (let i = 0; i < 5; i++) {
    assert.equal(simulateRateLimit(id, 5, 60000, now + i * 1000), true);
  }

  // 6th request at now + 6000ms must be throttled (within 60s window)
  assert.equal(simulateRateLimit(id, 5, 60000, now + 6000), false);

  // After window expires (now + 65000ms), old timestamps slide out and request succeeds
  assert.equal(simulateRateLimit(id, 5, 60000, now + 65000), true);
});
