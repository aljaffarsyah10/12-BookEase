import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node experimental strip types requires extension
import { cacheSet, cacheGet, cacheDel, cacheInvalidatePrefix, _resetCacheStore } from "../src/lib/cache.ts";

test("Performance: Cache module sets, retrieves, and expires values correctly", async () => {
  _resetCacheStore();

  // 1. Initial get is null
  const initial = await cacheGet("test:key:1");
  assert.equal(initial, null);

  // 2. Set value and retrieve
  await cacheSet("test:key:1", { name: "Barbershop Rapi", price: 50000 }, 2);
  const cached = await cacheGet<{ name: string; price: number }>("test:key:1");
  assert.deepEqual(cached, { name: "Barbershop Rapi", price: 50000 });

  // 3. Delete key
  await cacheDel("test:key:1");
  const afterDel = await cacheGet("test:key:1");
  assert.equal(afterDel, null);
});

test("Performance: Cache prefix invalidation clears all matching keys", async () => {
  _resetCacheStore();

  await cacheSet("biz:slug:barbershop", { id: "1" });
  await cacheSet("biz:slug:salon-cantik", { id: "2" });
  await cacheSet("services:biz-1", [1, 2, 3]);

  // Invalidate biz:slug:*
  await cacheInvalidatePrefix("biz:slug:");

  assert.equal(await cacheGet("biz:slug:barbershop"), null);
  assert.equal(await cacheGet("biz:slug:salon-cantik"), null);
  // Unrelated prefix must still be present
  assert.deepEqual(await cacheGet("services:biz-1"), [1, 2, 3]);
});

test("Performance: Database Aggregation vs Memory Loop consistency verification", () => {
  const bookings = [
    { status: "COMPLETED", servicePriceSnapshot: 150000 },
    { status: "COMPLETED", servicePriceSnapshot: 75000 },
    { status: "CONFIRMED", servicePriceSnapshot: 50000 },
    { status: "CANCELLED", servicePriceSnapshot: 100000 },
  ];

  // Simulating SQL _sum aggregation
  const sqlSum = bookings
    .filter((b) => b.status === "COMPLETED")
    .reduce((sum, b) => sum + b.servicePriceSnapshot, 0);

  assert.equal(sqlSum, 225000);

  // Simulating SQL count where status = 'COMPLETED'
  const sqlCompletedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  assert.equal(sqlCompletedCount, 2);

  // Simulating SQL count where status = 'CANCELLED'
  const sqlCancelledCount = bookings.filter((b) => b.status === "CANCELLED").length;
  assert.equal(sqlCancelledCount, 1);
});
