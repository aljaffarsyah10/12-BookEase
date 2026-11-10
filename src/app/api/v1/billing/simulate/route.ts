import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { simulatePaymentSchema } from "@/lib/validations/billing.schema";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { billingService } from "@/server/services/billing.service";

export async function POST(request: NextRequest) {
  try {
    const user = await requireBusinessOwner();
    const body = await request.json();
    const validatedData = simulatePaymentSchema.parse(body);

    const result = await billingService.simulateSandboxPayment(
      user.businessId,
      validatedData.invoiceId,
      validatedData.paymentMethod
    );

    return apiSuccess(
      result,
      result.alreadyPaid
        ? "Invoice ini sudah lunas sebelumnya."
        : "Simulasi pembayaran sandbox berhasil! Paket langganan Anda kini aktif selama 30 hari."
    );
  } catch (err) {
    return handleApiError(err);
  }
}
