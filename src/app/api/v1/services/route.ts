import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { serviceFormSchema } from "@/lib/validations/service.schema";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { serviceService } from "@/server/services/service.service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireBusinessOwner();
    const searchParams = request.nextUrl.searchParams;
    const onlyActive = searchParams.get("active") === "true";

    const services = await serviceService.list(user.businessId, onlyActive);
    return apiSuccess(services);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireBusinessOwner();
    const body = await request.json();
    const validatedData = serviceFormSchema.parse(body);

    const service = await serviceService.create(user.businessId, validatedData);
    return apiSuccess(service, "Layanan berhasil ditambahkan.", 201);
  } catch (err) {
    return handleApiError(err);
  }
}

