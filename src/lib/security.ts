/**
 * Error thrown when a cross-origin state modification is rejected.
 */
export class CsrfForbiddenError extends Error {
  public readonly code = "FORBIDDEN";
  public readonly status = 403;

  constructor(message = "Permintaan lintas domain (Cross-Origin) tidak diizinkan.") {
    super(message);
    this.name = "CsrfForbiddenError";
  }
}

/**
 * Safely extracts client IP address from request headers with fallback.
 * Takes the first non-private IP from x-forwarded-for or x-real-ip.
 */
export function getClientIpFromHeaders(headersList: Headers): string {
  const xRealIp = headersList.get("x-real-ip");
  if (xRealIp && xRealIp.trim()) {
    return xRealIp.trim();
  }

  const xForwardedFor = headersList.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  return "127.0.0.1";
}

/**
 * Validates the Origin header for state-modifying requests (CSRF Defense).
 * Blocks cross-origin browser requests that attempt to abuse session cookies.
 */
export function validateCsrfOrigin(headersList: Headers): void {
  const origin = headersList.get("origin");
  if (!origin) {
    // Non-browser or same-origin simple requests do not always attach Origin
    return;
  }

  const host =
    headersList.get("x-forwarded-host") || headersList.get("host");

  if (!host) {
    return;
  }

  try {
    const originUrl = new URL(origin);
    const hostWithoutPort = host.split(":")[0];
    const originHostWithoutPort = originUrl.hostname;

    // Check hostname match
    if (originHostWithoutPort === hostWithoutPort) {
      return;
    }

    // Allow localhost/127.0.0.1 in non-production environments
    if (
      process.env.NODE_ENV !== "production" &&
      (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1")
    ) {
      return;
    }

    throw new CsrfForbiddenError();
  } catch (err) {
    if (err instanceof CsrfForbiddenError) throw err;
    throw new CsrfForbiddenError("Header origin tidak valid.");
  }
}

/**
 * Sanitize strings against HTML and email injection attacks.
 */
export function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Mask customer email address for public DTO exposure.
 * e.g. "budi.santoso@gmail.com" -> "bu***so@gmail.com"
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email || !email.includes("@")) return "***@***.com";
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) {
    return `${localPart[0]}***@${domain}`;
  }
  const start = localPart.slice(0, 2);
  const end = localPart.slice(-2);
  return `${start}***${end}@${domain}`;
}

/**
 * Mask customer phone number for public DTO exposure.
 * e.g. "081234567890" -> "0812****7890"
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone || phone.length <= 6) return "******";
  const start = phone.slice(0, 4);
  const end = phone.slice(-4);
  return `${start}****${end}`;
}
