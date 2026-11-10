import { type NextRequest } from "next/server";
import { apiError, apiSuccess, handleApiError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security";
import { availabilityService } from "@/server/services/availability.service";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    checkRateLimit(`availability:${ip}`, 60, 60000);

    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get("slug");
    const serviceId = searchParams.get("serviceId");
    const date = searchParams.get("date");
    const staffId = searchParams.get("staffId") || undefined;

    if (!slug || !serviceId || !date) {
      return apiError(
        "INVALID_QUERY_PARAMS",
        "Parameter slug, serviceId, dan date (YYYY-MM-DD) wajib disertakan.",
        400
      );
    }

    // Validate format date YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return apiError(
        "INVALID_DATE_FORMAT",
        "Format tanggal harus YYYY-MM-DD.",
        400
      );
    }

    const data = await availabilityService.getSlots({
      slug,
      serviceId,
      date,
      staffId,
    });

    return apiSuccess(data);
  } catch (err) {
    return handleApiError(err);
  }
}
