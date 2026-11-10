import crypto from "crypto";

function getCancellationSecret(): string {
  const secret =
    process.env.CANCELLATION_SECRET ||
    process.env.CANCELLATION_TOKEN_SECRET ||
    process.env.AUTH_SECRET ||
    process.env.SESSION_SECRET;

  if (secret && secret.length >= 32) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[FATAL_SECURITY_ERROR] CANCELLATION_SECRET must be configured with at least 32 characters in production."
    );
  }

  return "bookease-secure-cancellation-key-at-least-32-characters";
}

export function generateCancellationSignature(
  reference: string,
  bookingId: string
): string {
  const secret = getCancellationSecret();
  return crypto
    .createHmac("sha256", secret)
    .update(`${reference}:${bookingId}`)
    .digest("hex");
}

export function verifyCancellationSignature(
  reference: string,
  bookingId: string,
  signature: string
): boolean {
  if (!signature || signature.length !== 64) {
    return false;
  }
  const expected = generateCancellationSignature(reference, bookingId);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expected, "hex")
    );
  } catch {
    return false;
  }
}
