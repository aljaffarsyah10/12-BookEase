import crypto from "crypto";

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.CANCELLATION_SECRET ||
  "bookease-session-hmac-secret-min-32-chars-long";

/**
 * Sign a user ID into a tamper-proof session token: `${userId}.${signature}`
 */
export function signSessionToken(userId: string): string {
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(userId)
    .digest("hex");
  return `${userId}.${signature}`;
}

/**
 * Verify session token integrity and extract the authenticated user ID.
 * Returns null if invalid or tampered with.
 */
export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null;

  const parts = token.split(".");
  // Standard signed format: userId.signature
  if (parts.length === 2) {
    const [userId, signature] = parts;
    if (!userId || !signature || signature.length !== 64) {
      return null;
    }

    const expected = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(userId)
      .digest("hex");

    try {
      const match = crypto.timingSafeEqual(
        Buffer.from(signature, "hex"),
        Buffer.from(expected, "hex")
      );
      return match ? userId : null;
    } catch {
      return null;
    }
  }

  // Backward compatibility in non-production for legacy raw ID cookies / dev seed testing
  if (process.env.NODE_ENV !== "production" && /^[a-z0-9_-]{10,40}$/i.test(token)) {
    return token;
  }

  return null;
}
