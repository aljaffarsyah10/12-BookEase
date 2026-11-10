import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { createCheckoutSchema } from "@/lib/validations/billing.schema";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { billingService } from "@/server/services/billing.service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireBusinessOwner();
    const body = await request.json();
    const validatedData = createCheckoutSchema.parse(body);

    const result = await billingService.createCheckout(user.businessId, validatedData);
    return apiSuccess(result, "Invoice checkout berhasil dibuat.", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
