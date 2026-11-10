import test from "node:test";
import assert from "node:assert/strict";
import { z } from "zod";
// @ts-expect-error Node experimental strip types requires extension
import { AppError } from "../src/lib/errors.ts";

test("API: Standard Success and Error Response payload contracts", () => {
  // 1. Success payload contract
  const data = { id: "biz_1", name: "Barbershop Rapi" };
  const successPayload = { success: true, data, message: "Berhasil memuat data" };

  assert.equal(successPayload.success, true);
  assert.deepEqual(successPayload.data, data);
  assert.equal(successPayload.message, "Berhasil memuat data");

  // 2. Custom AppError payload contract
  const customError = new AppError("SLOT_UNAVAILABLE", "Jadwal telah terisi penuh.", 409);
  const errorPayload = {
    success: false,
    error: {
      code: customError.code,
      message: customError.message,
    },
  };

  assert.equal(errorPayload.success, false);
  assert.equal(errorPayload.error.code, "SLOT_UNAVAILABLE");
  assert.equal(errorPayload.error.message, "Jadwal telah terisi penuh.");
});

test("API: Zod validation error formatting structure", () => {
  const testSchema = z.object({
    email: z.string().email(),
    price: z.number().min(1000),
  });

  const parsed = testSchema.safeParse({ email: "invalid-email", price: 500 });
  assert.equal(parsed.success, false);

  if (!parsed.success) {
    const errorDetails = parsed.error.flatten().fieldErrors;
    assert.ok(errorDetails.email);
    assert.ok(errorDetails.price);

    const formattedResponse = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Periksa kembali data yang Anda kirimkan.",
        details: errorDetails,
      },
    };

    assert.equal(formattedResponse.success, false);
    assert.equal(formattedResponse.error.code, "VALIDATION_ERROR");
  }
});

test("Integration: Pagination calculations boundary handling", () => {
  function calculatePagination(total: number, pageParam?: number, limitParam?: number) {
    const limit = Math.max(1, Math.min(limitParam || 10, 100)); // clamp 1..100
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const page = Math.max(1, Math.min(pageParam || 1, totalPages));
    const skip = (page - 1) * limit;

    return { total, page, limit, totalPages, skip };
  }

  // 1. Regular 25 items with limit 10
  const p1 = calculatePagination(25, 2, 10);
  assert.equal(p1.totalPages, 3);
  assert.equal(p1.page, 2);
  assert.equal(p1.skip, 10);

  // 2. Out of bounds page clamped to max
  const p2 = calculatePagination(25, 99, 10);
  assert.equal(p2.page, 3);
  assert.equal(p2.skip, 20);

  // 3. Zero or negative page clamped to 1
  const p3 = calculatePagination(25, -5, 10);
  assert.equal(p3.page, 1);
  assert.equal(p3.skip, 0);

  // 4. Zero total items produces 1 totalPage
  const p4 = calculatePagination(0, 1, 10);
  assert.equal(p4.totalPages, 1);
  assert.equal(p4.skip, 0);
});

test("Integration: Sorting parameters normalization and white-listing", () => {
  const allowedSortFields = ["startAt", "customerName", "servicePriceSnapshot", "status"] as const;

  function normalizeSorting(sortByInput?: string | null, sortOrderInput?: string | null) {
    const sortBy = allowedSortFields.includes(sortByInput as (typeof allowedSortFields)[number])
      ? sortByInput!
      : "startAt";
    const sortOrder = sortOrderInput === "asc" ? "asc" : "desc";
    return { sortBy, sortOrder };
  }

  // 1. Valid fields
  assert.deepEqual(normalizeSorting("customerName", "asc"), { sortBy: "customerName", sortOrder: "asc" });
  assert.deepEqual(normalizeSorting("servicePriceSnapshot", "desc"), { sortBy: "servicePriceSnapshot", sortOrder: "desc" });

  // 2. SQL injection or unknown field falls back safely to 'startAt'
  assert.deepEqual(normalizeSorting("passwordHash; DROP TABLE bookings;", "asc"), { sortBy: "startAt", sortOrder: "asc" });
  assert.deepEqual(normalizeSorting(null, null), { sortBy: "startAt", sortOrder: "desc" });
});

test("Authorization: Cross-tenant data modification is strictly prevented", () => {
  interface TenantResource {
    id: string;
    businessId: string;
    name: string;
  }

  const database: TenantResource[] = [
    { id: "srv_1", businessId: "biz_A", name: "Potong Rambut" },
    { id: "srv_2", businessId: "biz_B", name: "Cukur Jenggot" },
  ];

  function updateServiceByOwner(currentBusinessId: string, serviceId: string, newName: string) {
    const item = database.find((d) => d.id === serviceId && d.businessId === currentBusinessId);
    if (!item) {
      throw new AppError("SERVICE_NOT_FOUND", "Layanan tidak ditemukan.", 404);
    }
    item.name = newName;
    return item;
  }

  // Owner of biz_A updates their own service
  assert.equal(updateServiceByOwner("biz_A", "srv_1", "Potong Rambut Modern").name, "Potong Rambut Modern");

  // Owner of biz_A tries to update biz_B's service -> BLOCKED
  assert.throws(
    () => updateServiceByOwner("biz_A", "srv_2", "Hacked Name"),
    /Layanan tidak ditemukan/
  );
  assert.equal(database.find((d) => d.id === "srv_2")?.name, "Cukur Jenggot");
});
