import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { staffFormSchema } from "@/lib/validations/staff.schema";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { staffService } from "@/server/services/staff.service";

export async function GET(request: NextRequest) {
  try {
    const user = await requireBusinessOwner();
    const searchParams = request.nextUrl.searchParams;
    const onlyActive = searchParams.get("active") === "true";

    const staffList = await staffService.list(user.businessId, onlyActive);
    return apiSuccess(staffList);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireBusinessOwner();
    const body = await request.json();
    const validatedData = staffFormSchema.parse(body);

    const staff = await staffService.create(user.businessId, validatedData);
    return apiSuccess(staff, "Staf berhasil ditambahkan.", 201);
  } catch (err) {
    return handleApiError(err);
  }
}

