import crypto from "crypto";

function getSessionSecret(): string {
  const secret =
    process.env.SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.CANCELLATION_TOKEN_SECRET ||
    process.env.CANCELLATION_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[FATAL_SECURITY_ERROR] AUTH_SECRET or SESSION_SECRET must be configured with at least 32 characters in production."
    );
  }

  return "bookease-session-hmac-secret-min-32-chars-long";
}

/**
 * Sign a user ID into a tamper-proof session token: `${userId}.${signature}`
 */
export function signSessionToken(userId: string): string {
  const secret = getSessionSecret();
  const signature = crypto
    .createHmac("sha256", secret)
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

    const secret = getSessionSecret();
    const expected = crypto
      .createHmac("sha256", secret)
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

  return null;
}
