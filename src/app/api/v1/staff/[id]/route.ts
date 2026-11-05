import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { staffFormSchema } from "@/lib/validations/staff.schema";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { staffService } from "@/server/services/staff.service";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireBusinessOwner();
    const { id } = await props.params;
    const body = await request.json();
    const validatedData = staffFormSchema.parse(body);

    const updated = await staffService.update(
      user.businessId,
      id,
      validatedData
    );
    return apiSuccess(updated, "Staf berhasil diperbarui.");
  } catch (err) {
    return handleApiError(err);
  }
}

