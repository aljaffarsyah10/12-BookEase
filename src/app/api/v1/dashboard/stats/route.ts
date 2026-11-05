import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { bookingService } from "@/server/services/booking.service";

export async function GET() {
  try {
    const user = await requireBusinessOwner();
    const stats = await bookingService.getDashboardStats(user.businessId);
    return apiSuccess(stats);
  } catch (err) {
    return handleApiError(err);
  }
}

