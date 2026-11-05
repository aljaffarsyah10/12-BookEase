import { fromZonedTime, toZonedTime, format } from "date-fns-tz";

export function getZonedDateString(date: Date, timezone: string): string {
  const zoned = toZonedTime(date, timezone);
  return format(zoned, "yyyy-MM-dd", { timeZone: timezone });
}

export function getZonedTimeString(date: Date, timezone: string): string {
  const zoned = toZonedTime(date, timezone);
  return format(zoned, "HH:mm", { timeZone: timezone });
}

export function parseZonedTimeToUTC(
  dateStr: string,
  timeStr: string,
  timezone: string
): Date {
  const localIso = `${dateStr}T${timeStr}:00`;
  return fromZonedTime(localIso, timezone);
}

export function formatInBusinessTz(
  utcDate: Date,
  timezone: string,
  pattern = "yyyy-MM-dd HH:mm"
): string {
  return format(toZonedTime(utcDate, timezone), pattern, {
    timeZone: timezone,
  });
}

