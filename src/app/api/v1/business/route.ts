import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { businessProfileSchema } from "@/lib/validations/business.schema";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { businessService } from "@/server/services/business.service";

export async function GET() {
  try {
    const user = await requireBusinessOwner();
    const business = await businessService.getByOwner(user.businessId);
    return apiSuccess(business);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireBusinessOwner();
    const body = await request.json();
    const validatedData = businessProfileSchema.parse(body);

    const updated = await businessService.update(user.businessId, validatedData);
    return apiSuccess(updated, "Profil bisnis berhasil diperbarui.");
  } catch (err) {
    return handleApiError(err);
  }
}

