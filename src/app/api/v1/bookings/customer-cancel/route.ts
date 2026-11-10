import { type NextRequest } from "next/server";
import { z } from "zod";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security";
import { bookingService } from "@/server/services/booking.service";

const customerCancelSchema = z.object({
  reference: z.string().trim().min(1, "Kode referensi wajib diisi"),
  token: z.string().trim().length(64, "Token pembatalan tidak valid"),
  reason: z.string().trim().max(300, "Alasan pembatalan maksimal 300 karakter").optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    checkRateLimit(`customer-cancel:${ip}`, 10, 60000);

    const body = await request.json();
    const validatedData = customerCancelSchema.parse(body);

    const cancelled = await bookingService.cancelByCustomer(validatedData);

    return apiSuccess(
      cancelled,
      `Reservasi ${cancelled.reference} berhasil dibatalkan.`
    );
  } catch (err) {
    return handleApiError(err);
  }
}
