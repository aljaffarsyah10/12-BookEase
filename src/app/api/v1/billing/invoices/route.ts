import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { billingService } from "@/server/services/billing.service";

export async function GET() {
  try {
    const user = await requireBusinessOwner();
    const invoices = await billingService.listInvoices(user.businessId);
    return apiSuccess(invoices);
  } catch (err) {
    return handleApiError(err);
  }
}
