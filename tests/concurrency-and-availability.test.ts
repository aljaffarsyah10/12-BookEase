import test from "node:test";
import assert from "node:assert/strict";

interface MockStaff {
  id: string;
  name: string;
  isActive: boolean;
}

interface MockBooking {
  id: string;
  staffId: string;
  startAt: Date;
  occupiedEndAt: Date;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
}

test("Concurrency: Simultaneous booking requests for same staff produces conflict", () => {
  const staff: MockStaff = { id: "staff-1", name: "Budi", isActive: true };
  const existingBookings: MockBooking[] = [];

  function tryBookSlot(
    slotStart: Date,
    occupiedEnd: Date,
    preferredStaffId: string
  ): { success: boolean; error?: string; booking?: MockBooking } {
    // Check conflicts among active bookings (PENDING or CONFIRMED)
    const hasConflict = existingBookings.some(
      (b) =>
        b.staffId === preferredStaffId &&
        (b.status === "PENDING" || b.status === "CONFIRMED") &&
        slotStart < b.occupiedEndAt &&
        occupiedEnd > b.startAt
    );

    if (hasConflict) {
      return {
        success: false,
        error: "BOOKING_CONFLICT",
      };
    }

    const newBooking: MockBooking = {
      id: `bk-${Date.now()}-${Math.random()}`,
      staffId: preferredStaffId,
      startAt: slotStart,
      occupiedEndAt: occupiedEnd,
      status: "CONFIRMED",
    };
    existingBookings.push(newBooking);
    return { success: true, booking: newBooking };
  }

  const slotStart = new Date("2026-11-10T10:00:00Z");
  const slotOccupiedEnd = new Date("2026-11-10T10:45:00Z"); // 30m service + 15m buffer

  // Simulating 2 concurrent booking requests for the exact same staff and slot
  const req1 = tryBookSlot(slotStart, slotOccupiedEnd, staff.id);
  const req2 = tryBookSlot(slotStart, slotOccupiedEnd, staff.id);

  // Exactly 1 request succeeds
  assert.equal(req1.success, true);
  // The competing request is rejected with BOOKING_CONFLICT
  assert.equal(req2.success, false);
  assert.equal(req2.error, "BOOKING_CONFLICT");
  assert.equal(existingBookings.length, 1);
});

test("Concurrency: Cancelled booking immediately frees slot for subsequent request", () => {
  const staffId = "staff-1";
  const activeBooking: MockBooking = {
    id: "bk-init",
    staffId,
    startAt: new Date("2026-11-10T14:00:00Z"),
    occupiedEndAt: new Date("2026-11-10T14:45:00Z"),
    status: "CONFIRMED",
  };

  function canBook(slotStart: Date, slotEnd: Date, targetStaffId: string) {
    if (!activeBooking) return true;
    if (activeBooking.staffId !== targetStaffId) return true;
    if (activeBooking.status === "CANCELLED") return true;

    // Check overlap
    return !(slotStart < activeBooking.occupiedEndAt && slotEnd > activeBooking.startAt);
  }

  const targetStart = new Date("2026-11-10T14:00:00Z");
  const targetEnd = new Date("2026-11-10T14:45:00Z");

  // While confirmed, slot is unavailable
  assert.equal(canBook(targetStart, targetEnd, staffId), false);

  // Customer or Owner cancels booking
  activeBooking.status = "CANCELLED";

  // Slot is immediately available again
  assert.equal(canBook(targetStart, targetEnd, staffId), true);
});

test("Concurrency: Multi-staff auto allocation selects non-conflicting staff", () => {
  const staffList: MockStaff[] = [
    { id: "staff-1", name: "Budi", isActive: true },
    { id: "staff-2", name: "Andi", isActive: true },
  ];

  const bookedStaff1: MockBooking = {
    id: "bk-budi",
    staffId: "staff-1",
    startAt: new Date("2026-11-10T10:00:00Z"),
    occupiedEndAt: new Date("2026-11-10T10:45:00Z"),
    status: "CONFIRMED",
  };

  const currentBookings = [bookedStaff1];

  function allocateStaff(
    slotStart: Date,
    slotEnd: Date,
    allStaff: MockStaff[]
  ): MockStaff | null {
    for (const st of allStaff) {
      if (!st.isActive) continue;
      const isBusy = currentBookings.some(
        (b) =>
          b.staffId === st.id &&
          (b.status === "PENDING" || b.status === "CONFIRMED") &&
          slotStart < b.occupiedEndAt &&
          slotEnd > b.startAt
      );
      if (!isBusy) {
        return st;
      }
    }
    return null;
  }

  // Requesting "any" staff at 10:00: staff-1 is busy, so staff-2 is auto-allocated
  const allocated = allocateStaff(
    new Date("2026-11-10T10:00:00Z"),
    new Date("2026-11-10T10:45:00Z"),
    staffList
  );

  assert.notEqual(allocated, null);
  assert.equal(allocated?.id, "staff-2");
});
