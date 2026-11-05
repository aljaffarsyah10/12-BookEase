import { apiSuccess, handleApiError } from "@/lib/api-response";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { businessService } from "@/server/services/business.service";

export async function GET() {
  try {
    const user = await requireBusinessOwner();
    const business = await businessService.getByOwner(user.businessId);

    return apiSuccess({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      business: {
        id: business.id,
        name: business.name,
        slug: business.slug,
        category: business.category,
        timezone: business.timezone,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

