import { AppError } from "@/lib/errors";

const requestLog = new Map<string, number[]>();
const MAX_TRACKED_CLIENTS = 2000;

/**
 * Periodically purge stale identifiers to prevent memory leaks over long server uptime.
 */
function cleanupExpiredEntries(now: number, windowMs: number): void {
  for (const [key, timestamps] of requestLog.entries()) {
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length === 0) {
      requestLog.delete(key);
    } else {
      requestLog.set(key, valid);
    }
  }
}

export function checkRateLimit(
  identifier: string,
  limit = 30,
  windowMs = 60000
): void {
  const now = Date.now();

  // Run bounded sweep if tracking exceeds max threshold
  if (requestLog.size > MAX_TRACKED_CLIENTS) {
    cleanupExpiredEntries(now, windowMs);
  }

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

/**
 * Utility for testing or resetting rate-limiter state.
 */
export function _resetRateLimitStore(): void {
  requestLog.clear();
}
