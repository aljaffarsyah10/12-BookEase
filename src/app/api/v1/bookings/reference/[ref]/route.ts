import { apiSuccess, handleApiError } from "@/lib/api-response";
import { bookingService } from "@/server/services/booking.service";

export async function GET(
  _request: Request,
  props: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await props.params;
    const booking = await bookingService.getByReference(ref);
    return apiSuccess(booking);
  } catch (err) {
    return handleApiError(err);
  }
}

