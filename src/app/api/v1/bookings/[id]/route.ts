import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { bookingStatusUpdateSchema } from "@/lib/validations/booking.schema";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { bookingService } from "@/server/services/booking.service";

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireBusinessOwner();
    const { id } = await props.params;

    const booking = await bookingService.getById(user.businessId, id);
    return apiSuccess(booking);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireBusinessOwner();
    const { id } = await props.params;
    const body = await request.json();
    const validatedData = bookingStatusUpdateSchema.parse(body);

    const updated = await bookingService.updateStatus(
      user.businessId,
      id,
      validatedData.status,
      validatedData.cancelReason
    );

    return apiSuccess(updated, "Status reservasi berhasil diperbarui.");
  } catch (err) {
    return handleApiError(err);
  }
}

