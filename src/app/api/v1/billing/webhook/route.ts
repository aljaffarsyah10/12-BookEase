import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { billingWebhookSchema } from "@/lib/validations/billing.schema";
import { billingService } from "@/server/services/billing.service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = billingWebhookSchema.parse(body);

    const result = await billingService.processWebhook(validated);
    return apiSuccess(result, "Webhook processed successfully.");
  } catch (err) {
    return handleApiError(err);
  }
}
