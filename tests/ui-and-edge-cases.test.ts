import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node experimental strip types requires extension
import { formatRupiah, formatDuration, formatDateId, slugify } from "../src/lib/format.ts";
// @ts-expect-error Node experimental strip types requires extension
import { formatWhatsAppNumber, generateWhatsAppReminderUrl, generateGoogleCalendarUrl, generateIcsContent } from "../src/lib/calendar-export.ts";
// @ts-expect-error Node experimental strip types requires extension
import { parseZonedTimeToUTC, getZonedDateString, getZonedTimeString } from "../src/lib/timezone.ts";
import type { Booking } from "../src/types/index.ts";

test("Edge Cases: Indonesian Phone Number Normalization", () => {
  // 1. Standard 08xx prefix
  assert.equal(formatWhatsAppNumber("081234567890"), "6281234567890");

  // 2. +62 international prefix with symbols
  assert.equal(formatWhatsAppNumber("+62 812-3456-7890"), "6281234567890");

  // 3. 62 without plus
  assert.equal(formatWhatsAppNumber("6281234567890"), "6281234567890");

  // 4. Number without leading zero e.g. 81234567890
  assert.equal(formatWhatsAppNumber("81234567890"), "6281234567890");

  // 5. Parentheses and spaces: (021) 1234567
  assert.equal(formatWhatsAppNumber("(021) 1234567"), "62211234567");
});

test("UI & Formatting: Indonesian Rupiah Currency Formatting", () => {
  // Standard price
  const formatted = formatRupiah(150000);
  assert.ok(formatted.includes("150.000"));

  // Free service (Rp 0)
  const free = formatRupiah(0);
  assert.ok(free.includes("0"));

  // Large business revenue
  const millions = formatRupiah(25500000);
  assert.ok(millions.includes("25.500.000"));
});

test("UI & Formatting: Duration Formatting in Indonesian", () => {
  // Under 60 minutes
  assert.equal(formatDuration(15), "15 menit");
  assert.equal(formatDuration(45), "45 menit");

  // Exact hours
  assert.equal(formatDuration(60), "1 jam");
  assert.equal(formatDuration(120), "2 jam");

  // Compound hours & minutes
  assert.equal(formatDuration(75), "1 jam 15 menit");
  assert.equal(formatDuration(150), "2 jam 30 menit");
});

test("UI & Formatting: Date Formatting in Indonesian", () => {
  const d = formatDateId("2026-11-16");
  assert.ok(d.toLowerCase().includes("nov") || d.toLowerCase().includes("16"));

  // Invalid date fallback
  assert.equal(formatDateId("invalid-date"), "invalid-date");
});

test("UI & Formatting: URL Slugify edge cases", () => {
  assert.equal(slugify("Barbershop Rapi & Nyaman!"), "barbershop-rapi-nyaman");
  assert.equal(slugify("  Salon   Kecantikan   Modern  "), "salon-kecantikan-modern");
  assert.equal(slugify("Spa---Refleksi---2026"), "spa-refleksi-2026");
});

test("Integrations: Calendar URL and ICS Event Generation", () => {
  const mockBooking: Booking = {
    id: "bk_cal_01",
    reference: "BK-20261116-CAL001",
    businessId: "biz_1",
    serviceId: "srv_1",
    staffId: "stf_1",
    serviceNameSnapshot: "Potong Rambut",
    servicePriceSnapshot: 50000,
    durationMinutesSnapshot: 30,
    staffName: "Budi",
    customerName: "Rian",
    customerEmail: "rian@example.com",
    customerPhone: "081234567890",
    date: "2026-11-16",
    time: "10:00",
    startAt: "2026-11-16T03:00:00.000Z",
    endAt: "2026-11-16T03:30:00.000Z",
    status: "CONFIRMED",
    createdAt: "2026-11-10T12:00:00.000Z",
  };

  // WhatsApp Reminder URL
  const waUrl = generateWhatsAppReminderUrl(mockBooking, "Barbershop Rapi", "Jl. Sudirman No. 10");
  assert.ok(waUrl.startsWith("https://wa.me/6281234567890?text="));
  assert.ok(waUrl.includes(encodeURIComponent(mockBooking.reference)));

  // Google Calendar URL
  const gcalUrl = generateGoogleCalendarUrl(mockBooking, "Barbershop Rapi", "Jl. Sudirman No. 10");
  assert.ok(gcalUrl.startsWith("https://calendar.google.com/calendar/render?"));
  assert.ok(gcalUrl.includes("20261116T030000Z"));

  // iCalendar (.ics) content
  const ics = generateIcsContent(mockBooking, "Barbershop Rapi", "Jl. Sudirman No. 10");
  assert.ok(ics.includes("BEGIN:VCALENDAR"));
  assert.ok(ics.includes("UID:BK-20261116-CAL001@bookease.id"));
  assert.ok(ics.includes("SUMMARY:Potong Rambut - Barbershop Rapi"));
  assert.ok(ics.includes("END:VCALENDAR"));
});

test("Timezone Edge Cases: Conversion across Indonesian Timezones (WIB, WITA, WIT)", () => {
  const dateStr = "2026-11-16";
  const timeStr = "10:00";

  // 1. Asia/Jakarta (WIB, UTC+7) -> 10:00 WIB is 03:00 UTC
  const wibUTC = parseZonedTimeToUTC(dateStr, timeStr, "Asia/Jakarta");
  assert.equal(wibUTC.toISOString(), "2026-11-16T03:00:00.000Z");
  assert.equal(getZonedDateString(wibUTC, "Asia/Jakarta"), "2026-11-16");
  assert.equal(getZonedTimeString(wibUTC, "Asia/Jakarta"), "10:00");

  // 2. Asia/Makassar (WITA, UTC+8) -> 10:00 WITA is 02:00 UTC
  const witaUTC = parseZonedTimeToUTC(dateStr, timeStr, "Asia/Makassar");
  assert.equal(witaUTC.toISOString(), "2026-11-16T02:00:00.000Z");
  assert.equal(getZonedTimeString(witaUTC, "Asia/Makassar"), "10:00");

  // 3. Asia/Jayapura (WIT, UTC+9) -> 10:00 WIT is 01:00 UTC
  const witUTC = parseZonedTimeToUTC(dateStr, timeStr, "Asia/Jayapura");
  assert.equal(witUTC.toISOString(), "2026-11-16T01:00:00.000Z");
  assert.equal(getZonedTimeString(witUTC, "Asia/Jayapura"), "10:00");
});

test("Timezone Edge Cases: Year boundary and Leap Year calculations", () => {
  // New Year eve crossover: 2026-12-31 23:30 in WIB (+7) is 2026-12-31 16:30 UTC
  const nyUtc = parseZonedTimeToUTC("2026-12-31", "23:30", "Asia/Jakarta");
  assert.equal(nyUtc.getUTCFullYear(), 2026);
  assert.equal(getZonedDateString(nyUtc, "Asia/Jakarta"), "2026-12-31");

  // Leap Year: 2028-02-29 10:00 WIB
  const leapUtc = parseZonedTimeToUTC("2028-02-29", "10:00", "Asia/Jakarta");
  assert.equal(leapUtc.toISOString(), "2028-02-29T03:00:00.000Z");
  assert.equal(getZonedDateString(leapUtc, "Asia/Jakarta"), "2028-02-29");
});
