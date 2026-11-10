import type { Booking } from "@/types";

/**
 * Clean and format Indonesian phone number to international WhatsApp format (e.g. 0812 -> 62812).
 */
export function formatWhatsAppNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "62" + cleaned.slice(1);
  } else if (!cleaned.startsWith("62")) {
    cleaned = "62" + cleaned;
  }
  return cleaned;
}

/**
 * Generate a prefilled WhatsApp message link for customer appointment reminder.
 */
export function generateWhatsAppReminderUrl(
  booking: Booking,
  businessName: string,
  businessAddress?: string | null
): string {
  const phone = formatWhatsAppNumber(booking.customerPhone);
  const locationText = businessAddress ? `\n📍 Lokasi: ${businessAddress}` : "";
  const message = `Halo Kak ${booking.customerName}, kami dari ${businessName}.\n\n` +
    `Ini adalah pengingat untuk jadwal reservasi Anda:\n` +
    `🔖 Ref: ${booking.reference}\n` +
    `✨ Layanan: ${booking.serviceNameSnapshot}\n` +
    `👤 Staf: ${booking.staffName}\n` +
    `📅 Waktu: ${booking.date} pukul ${booking.time} WIB${locationText}\n\n` +
    `Mohon hadir 5-10 menit sebelum jadwal. Jika ada perubahan jadwal, mohon informasikan kepada kami. Terima kasih! 🙏`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Format a Date to UTC string for Google Calendar & iCalendar (YYYYMMDDTHHmmssZ).
 */
function toUtcCompactString(isoDateString: string): string {
  const d = new Date(isoDateString);
  return d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

/**
 * Generate Google Calendar Add Event URL.
 */
export function generateGoogleCalendarUrl(
  booking: Booking,
  businessName: string,
  businessAddress?: string | null
): string {
  const start = toUtcCompactString(booking.startAt);
  const end = toUtcCompactString(booking.endAt);
  const title = `${booking.serviceNameSnapshot} — ${businessName}`;
  const details = `Reservasi di ${businessName}\nKode Referensi: ${booking.reference}\nStaf: ${booking.staffName}\nPelanggan: ${booking.customerName}`;
  const location = businessAddress || businessName;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${start}/${end}`,
    details,
    location,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate iCalendar (.ics) content for Apple Calendar, Outlook, and mobile calendar apps.
 */
export function generateIcsContent(
  booking: Booking,
  businessName: string,
  businessAddress?: string | null
): string {
  const start = toUtcCompactString(booking.startAt);
  const end = toUtcCompactString(booking.endAt);
  const title = `${booking.serviceNameSnapshot} - ${businessName}`;
  const location = businessAddress || businessName;
  const description = `Reservasi di ${businessName}\\nRef: ${booking.reference}\\nStaf: ${booking.staffName}\\nPelanggan: ${booking.customerName}`;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BookEase//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.reference}@bookease.id`,
    `DTSTAMP:${toUtcCompactString(new Date().toISOString())}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/**
 * Trigger download of iCalendar (.ics) file in the browser.
 */
export function downloadIcsFile(
  booking: Booking,
  businessName: string,
  businessAddress?: string | null
): void {
  const content = generateIcsContent(booking, businessName, businessAddress);
  const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `reservasi-${booking.reference}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export a list of bookings to a formatted CSV file and trigger download.
 */
export function exportBookingsToCsv(
  bookings: Booking[],
  businessSlug = "bookease"
): void {
  if (bookings.length === 0) return;

  const headers = [
    "Kode Referensi",
    "Nama Pelanggan",
    "Email",
    "Telepon",
    "Layanan",
    "Biaya (IDR)",
    "Durasi (menit)",
    "Staf",
    "Tanggal",
    "Jam (WIB)",
    "Status",
    "Catatan",
  ];

  const escapeCsv = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = bookings.map((b) => [
    escapeCsv(b.reference),
    escapeCsv(b.customerName),
    escapeCsv(b.customerEmail),
    escapeCsv(b.customerPhone),
    escapeCsv(b.serviceNameSnapshot),
    escapeCsv(b.servicePriceSnapshot),
    escapeCsv(b.durationMinutesSnapshot),
    escapeCsv(b.staffName),
    escapeCsv(b.date),
    escapeCsv(b.time),
    escapeCsv(b.status),
    escapeCsv(b.customerNotes || ""),
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `reservasi-${businessSlug}-${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
