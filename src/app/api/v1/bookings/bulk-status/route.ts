import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { bulkBookingStatusUpdateSchema } from "@/lib/validations/booking.schema";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { bookingService } from "@/server/services/booking.service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireBusinessOwner();
    const body = await request.json();
    const validatedData = bulkBookingStatusUpdateSchema.parse(body);

    const result = await bookingService.updateBulkStatus(
      user.businessId,
      validatedData.ids,
      validatedData.status,
      validatedData.cancelReason
    );

    return apiSuccess(
      result,
      `${result.updatedCount} reservasi berhasil diperbarui menjadi ${validatedData.status}.`
    );
  } catch (err) {
    return handleApiError(err);
  }
}
