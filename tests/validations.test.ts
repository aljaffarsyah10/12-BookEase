import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node experimental strip types requires extension
import { loginSchema, registerSchema } from "../src/lib/validations/auth.schema.ts";
// @ts-expect-error Node experimental strip types requires extension
import { customerDetailsSchema, bookingStatusUpdateSchema, bulkBookingStatusUpdateSchema } from "../src/lib/validations/booking.schema.ts";
// @ts-expect-error Node experimental strip types requires extension
import { serviceFormSchema } from "../src/lib/validations/service.schema.ts";

test("Validation: loginSchema validates correctly", () => {
  // Valid login
  const valid = loginSchema.safeParse({
    email: "owner@example.com",
    password: "Password123!",
  });
  assert.equal(valid.success, true);

  // Invalid email
  const invalidEmail = loginSchema.safeParse({
    email: "not-an-email",
    password: "Password123!",
  });
  assert.equal(invalidEmail.success, false);

  // Short password (< 8 chars)
  const shortPass = loginSchema.safeParse({
    email: "owner@example.com",
    password: "short",
  });
  assert.equal(shortPass.success, false);
});

test("Validation: registerSchema validates slug and password complexity", () => {
  // Valid register
  const valid = registerSchema.safeParse({
    name: "John Doe",
    businessName: "Barbershop Rapi",
    businessSlug: "barbershop-rapi",
    email: "john@barber.com",
    password: "Password123",
    confirmPassword: "Password123",
  });
  assert.equal(valid.success, true);

  // Invalid slug: contains uppercase or spaces
  const badSlug = registerSchema.safeParse({
    name: "John Doe",
    businessName: "Barbershop Rapi",
    businessSlug: "Barbershop Rapi!",
    email: "john@barber.com",
    password: "Password123",
    confirmPassword: "Password123",
  });
  assert.equal(badSlug.success, false);

  // Password without numbers
  const noNumberPass = registerSchema.safeParse({
    name: "John Doe",
    businessName: "Barbershop Rapi",
    businessSlug: "barbershop-rapi",
    email: "john@barber.com",
    password: "PasswordOnlyLetters",
    confirmPassword: "PasswordOnlyLetters",
  });
  assert.equal(noNumberPass.success, false);

  // Mismatched confirmPassword
  const mismatched = registerSchema.safeParse({
    name: "John Doe",
    businessName: "Barbershop Rapi",
    businessSlug: "barbershop-rapi",
    email: "john@barber.com",
    password: "Password123",
    confirmPassword: "Password456",
  });
  assert.equal(mismatched.success, false);
});

test("Validation: customerDetailsSchema validates contact input", () => {
  // Valid customer
  const valid = customerDetailsSchema.safeParse({
    customerName: "Budi Santoso",
    customerEmail: "budi@gmail.com",
    customerPhone: "081234567890",
    customerNotes: "Mohon sediakan parkir",
  });
  assert.equal(valid.success, true);

  // Invalid short phone
  const shortPhone = customerDetailsSchema.safeParse({
    customerName: "Budi Santoso",
    customerEmail: "budi@gmail.com",
    customerPhone: "12345",
  });
  assert.equal(shortPhone.success, false);

  // Short name (< 2 chars)
  const shortName = customerDetailsSchema.safeParse({
    customerName: "B",
    customerEmail: "budi@gmail.com",
    customerPhone: "081234567890",
  });
  assert.equal(shortName.success, false);
});

test("Validation: serviceFormSchema enforces duration and pricing limits", () => {
  // Valid service
  const valid = serviceFormSchema.safeParse({
    name: "Potong Rambut Klasik",
    description: "Layanan potong rambut standar",
    price: 50000,
    durationMinutes: 45,
    isActive: true,
    staffIds: ["staff-1"],
  });
  assert.equal(valid.success, true);

  // Negative price
  const negativePrice = serviceFormSchema.safeParse({
    name: "Potong Rambut Klasik",
    price: -1000,
    durationMinutes: 45,
    isActive: true,
    staffIds: ["staff-1"],
  });
  assert.equal(negativePrice.success, false);

  // Duration too short (< 5m)
  const shortDuration = serviceFormSchema.safeParse({
    name: "Potong Rambut Klasik",
    price: 50000,
    durationMinutes: 2,
    isActive: true,
    staffIds: ["staff-1"],
  });
  assert.equal(shortDuration.success, false);

  // Missing staff
  const noStaff = serviceFormSchema.safeParse({
    name: "Potong Rambut Klasik",
    price: 50000,
    durationMinutes: 45,
    isActive: true,
    staffIds: [],
  });
  assert.equal(noStaff.success, false);
});

test("Validation: bookingStatusUpdateSchema allows legitimate status transitions", () => {
  const allowed = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "NO_SHOW"];
  for (const s of allowed) {
    const res = bookingStatusUpdateSchema.safeParse({ status: s });
    assert.equal(res.success, true);
  }

  // Unknown status
  const bad = bookingStatusUpdateSchema.safeParse({ status: "REFUNDED" });
  assert.equal(bad.success, false);
});

test("Validation: bulkBookingStatusUpdateSchema validates ids array and status correctly", () => {
  // Valid bulk payload
  const valid = bulkBookingStatusUpdateSchema.safeParse({
    ids: ["clerk_bk_1", "clerk_bk_2"],
    status: "CONFIRMED",
  });
  assert.equal(valid.success, true);

  // Empty ids array should fail
  const emptyIds = bulkBookingStatusUpdateSchema.safeParse({
    ids: [],
    status: "CONFIRMED",
  });
  assert.equal(emptyIds.success, false);

  // Missing status should fail
  const missingStatus = bulkBookingStatusUpdateSchema.safeParse({
    ids: ["clerk_bk_1"],
  });
  assert.equal(missingStatus.success, false);

  // Cancel with reason is allowed
  const cancelWithReason = bulkBookingStatusUpdateSchema.safeParse({
    ids: ["clerk_bk_1"],
    status: "CANCELLED",
    cancelReason: "Toko tutup sementara",
  });
  assert.equal(cancelWithReason.success, true);
});


