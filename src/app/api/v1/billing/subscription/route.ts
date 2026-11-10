import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { subscriptionService } from "@/server/services/subscription.service";

export async function GET() {
  try {
    const user = await requireBusinessOwner();
    const details = await subscriptionService.getSubscriptionDetails(user.businessId);
    return apiSuccess(details);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE() {
  try {
    const user = await requireBusinessOwner();
    await subscriptionService.cancelSubscription(user.businessId);
    return apiSuccess(null, "Langganan berhasil dibatalkan.");
  } catch (err) {
    return handleApiError(err);
  }
}
