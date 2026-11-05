import crypto from "crypto";

const CANCELLATION_SECRET =
  process.env.CANCELLATION_SECRET ||
  "bookease-secure-cancellation-key-at-least-32-characters";

export function generateCancellationSignature(
  reference: string,
  bookingId: string
): string {
  return crypto
    .createHmac("sha256", CANCELLATION_SECRET)
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

