import { type NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIpFromHeaders, maskEmail, maskPhone } from "@/lib/security";
import { bookingService } from "@/server/services/booking.service";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ ref: string }> }
) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    checkRateLimit(`ref-lookup:${ip}`, 30, 60000);

    const { ref } = await props.params;

    // Strict reference syntax validation to block probe/fuzzing payloads
    if (!ref || !/^BK-\d{8}-[A-Za-z0-9_-]{4,24}$/.test(ref)) {
      return apiError(
        "INVALID_REFERENCE_FORMAT",
        "Format kode referensi reservasi tidak valid (Contoh: BK-YYYYMMDD-XXXXXX).",
        400
      );
    }

    const booking = await bookingService.getByReference(ref);

    // Mask PII on unauthenticated public lookup to prevent data harvesting
    const sanitizedBooking = {
      ...booking,
      customerEmail: maskEmail(booking.customerEmail),
      customerPhone: maskPhone(booking.customerPhone),
      customerNotes: undefined, // Hide private customer notes on public lookup
    };

    return apiSuccess(sanitizedBooking);
  } catch (err) {
    return handleApiError(err);
  }
}
