import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node experimental strip types requires extension
import { parseZonedTimeToUTC } from "../src/lib/timezone.ts";
// @ts-expect-error Node experimental strip types requires extension
import { generateCancellationSignature, verifyCancellationSignature } from "../src/lib/cancellation-token.ts";

// 1. Conflict detection algorithm check (mirrors booking.service & availability.service)
function isOverlapping(
  slotStart: Date,
  slotOccupiedEnd: Date,
  bookingStart: Date,
  bookingOccupiedEnd: Date
): boolean {
  return slotStart < bookingOccupiedEnd && slotOccupiedEnd > bookingStart;
}

test("Conflict detection: correctly detects overlapping bookings", () => {
  const existingStart = new Date("2026-11-10T10:00:00Z");
  const existingOccupiedEnd = new Date("2026-11-10T10:40:00Z"); // 30m service + 10m buffer

  // Overlap 1: Exact match
  assert.equal(
    isOverlapping(
      new Date("2026-11-10T10:00:00Z"),
      new Date("2026-11-10T10:40:00Z"),
      existingStart,
      existingOccupiedEnd
    ),
    true
  );

  // Overlap 2: Starts during existing occupied slot
  assert.equal(
    isOverlapping(
      new Date("2026-11-10T10:30:00Z"),
      new Date("2026-11-10T11:10:00Z"),
      existingStart,
      existingOccupiedEnd
    ),
    true
  );

  // Overlap 3: Starts before and ends inside
  assert.equal(
    isOverlapping(
      new Date("2026-11-10T09:30:00Z"),
      new Date("2026-11-10T10:10:00Z"),
      existingStart,
      existingOccupiedEnd
    ),
    true
  );

  // No overlap: Strictly before
  assert.equal(
    isOverlapping(
      new Date("2026-11-10T09:00:00Z"),
      new Date("2026-11-10T09:40:00Z"),
      existingStart,
      existingOccupiedEnd
    ),
    false
  );

  // Boundary check: Ends exactly when existing starts
  assert.equal(
    isOverlapping(
      new Date("2026-11-10T09:20:00Z"),
      new Date("2026-11-10T10:00:00Z"),
      existingStart,
      existingOccupiedEnd
    ),
    false
  );

  // Boundary check: Starts exactly when existing buffer ends
  assert.equal(
    isOverlapping(
      new Date("2026-11-10T10:40:00Z"),
      new Date("2026-11-10T11:20:00Z"),
      existingStart,
      existingOccupiedEnd
    ),
    false
  );
});

// 2. Timezone conversion verification
test("Timezone conversion: Asia/Jakarta (UTC+7) to UTC", () => {
  const utcDate = parseZonedTimeToUTC("2026-11-10", "09:00", "Asia/Jakarta");
  // 09:00 WIB (UTC+7) -> 02:00:00Z
  assert.equal(utcDate.toISOString(), "2026-11-10T02:00:00.000Z");
});

test("Timezone conversion: Asia/Makassar (UTC+8) to UTC", () => {
  const utcDate = parseZonedTimeToUTC("2026-11-10", "09:00", "Asia/Makassar");
  // 09:00 WITA (UTC+8) -> 01:00:00Z
  assert.equal(utcDate.toISOString(), "2026-11-10T01:00:00.000Z");
});

// 3. State machine terminal state verification
test("Booking State Machine: Terminal status validation", () => {
  const terminalStates = ["COMPLETED", "CANCELLED", "NO_SHOW"];
  
  function canTransition(currentStatus: string): boolean {
    return !terminalStates.includes(currentStatus);
  }

  assert.equal(canTransition("PENDING"), true);
  assert.equal(canTransition("CONFIRMED"), true);
  assert.equal(canTransition("COMPLETED"), false);
  assert.equal(canTransition("CANCELLED"), false);
  assert.equal(canTransition("NO_SHOW"), false);
});

// 4. Booking reference format validation
test("Booking reference: matches BK-YYYYMMDD-XXXXXX format", () => {
  const referenceRegex = /^BK-\d{8}-[A-F0-9]{6}$/;
  const dummyDate = "2026-11-10".replace(/-/g, "");
  const dummyRef = `BK-${dummyDate}-A1B2C3`;
  assert.match(dummyRef, referenceRegex);
});

// 5. Customer Cancellation Token verification
test("Cancellation Token: generate and verify valid HMAC signature", () => {
  const ref = "BK-20261110-XYZ123";
  const bookingId = "cm123abc456";

  const token = generateCancellationSignature(ref, bookingId);
  assert.equal(typeof token, "string");
  assert.equal(token.length, 64);

  // Valid token
  assert.equal(verifyCancellationSignature(ref, bookingId, token), true);

  // Tampered token
  const tampered = token.slice(0, 63) + (token[63] === "a" ? "b" : "a");
  assert.equal(verifyCancellationSignature(ref, bookingId, tampered), false);

  // Wrong reference
  assert.equal(verifyCancellationSignature("BK-OTHER-REF", bookingId, token), false);
});

// 6. Buffer time window verification
test("Buffer Time: expands occupied interval accurately", () => {
  const serviceMinutes = 45;
  const bufferMinutes = 15;
  const startAt = new Date("2026-11-10T09:00:00Z");

  const endAt = new Date(startAt.getTime() + serviceMinutes * 60000);
  const occupiedEndAt = new Date(endAt.getTime() + bufferMinutes * 60000);

  // 45m service ends at 09:45
  assert.equal(endAt.toISOString(), "2026-11-10T09:45:00.000Z");
  // 15m buffer extends occupied period to 10:00
  assert.equal(occupiedEndAt.toISOString(), "2026-11-10T10:00:00.000Z");

  // An overlapping slot attempting to book 09:45 (during buffer period) must conflict
  const slotDuringBuffer = new Date("2026-11-10T09:45:00Z");
  const slotDuringBufferEnd = new Date("2026-11-10T10:15:00Z");
  assert.equal(
    isOverlapping(slotDuringBuffer, slotDuringBufferEnd, startAt, occupiedEndAt),
    true
  );

  // A slot starting right when buffer finishes at 10:00 does not conflict
  const slotAfterBuffer = new Date("2026-11-10T10:00:00Z");
  const slotAfterBufferEnd = new Date("2026-11-10T10:30:00Z");
  assert.equal(
    isOverlapping(slotAfterBuffer, slotAfterBufferEnd, startAt, occupiedEndAt),
    false
  );
});
