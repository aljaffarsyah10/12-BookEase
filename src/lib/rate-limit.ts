import { AppError } from "@/lib/errors";

const requestLog = new Map<string, number[]>();

export function checkRateLimit(
  identifier: string,
  limit = 30,
  windowMs = 60000
): void {
  const now = Date.now();
  const timestamps = requestLog.get(identifier) ?? [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    throw new AppError(
      "RATE_LIMIT_EXCEEDED",
      "Terlalu banyak permintaan. Silakan coba beberapa saat lagi.",
      429
    );
  }

  validTimestamps.push(now);
  requestLog.set(identifier, validTimestamps);
}
