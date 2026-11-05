import { apiSuccess, handleApiError } from "@/lib/api-response";
import { businessService } from "@/server/services/business.service";

export async function GET(
  _request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await props.params;
    const business = await businessService.getPublicBySlug(slug);
    return apiSuccess(business);
  } catch (err) {
    return handleApiError(err);
  }
}

