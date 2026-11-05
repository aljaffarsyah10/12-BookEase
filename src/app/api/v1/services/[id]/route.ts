import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { serviceFormSchema } from "@/lib/validations/service.schema";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { serviceService } from "@/server/services/service.service";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireBusinessOwner();
    const { id } = await props.params;
    const body = await request.json();
    const validatedData = serviceFormSchema.parse(body);

    const updated = await serviceService.update(
      user.businessId,
      id,
      validatedData
    );
    return apiSuccess(updated, "Layanan berhasil diperbarui.");
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireBusinessOwner();
    const { id } = await props.params;

    const result = await serviceService.deleteOrDeactivate(user.businessId, id);
    return apiSuccess(result, "Layanan berhasil diproses.");
  } catch (err) {
    return handleApiError(err);
  }
}

