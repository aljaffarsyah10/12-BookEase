import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { scheduleFormSchema } from "@/lib/validations/schedule.schema";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { scheduleService } from "@/server/services/schedule.service";

export async function GET() {
  try {
    const user = await requireBusinessOwner();
    const operatingHours = await scheduleService.getByBusiness(user.businessId);
    return apiSuccess(operatingHours);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireBusinessOwner();
    const body = await request.json();
    const validatedData = scheduleFormSchema.parse(body);

    // Update business bufferTimeMinutes
    await prisma.business.update({
      where: { id: user.businessId },
      data: { bufferTimeMinutes: validatedData.bufferTimeMinutes },
    });

    const updatedHours = await scheduleService.update(
      user.businessId,
      validatedData.schedule
    );

    return apiSuccess(
      {
        bufferTimeMinutes: validatedData.bufferTimeMinutes,
        schedule: updatedHours,
      },
      "Jadwal operasional berhasil diperbarui."
    );
  } catch (err) {
    return handleApiError(err);
  }
}

