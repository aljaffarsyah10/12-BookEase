import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security";
import { createBookingSchema } from "@/lib/validations/booking.schema";
import { requireBusinessOwner } from "@/server/policies/auth-policy";
import { bookingService } from "@/server/services/booking.service";
import type { BookingStatus } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const user = await requireBusinessOwner();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || undefined;
    const statusParam = searchParams.get("status") || "ALL";
    const status = statusParam as BookingStatus | "ALL";
    const date = searchParams.get("date") || undefined;
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page = pageParam ? parseInt(pageParam, 10) : undefined;
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const sortBy = (searchParams.get("sortBy") as
      | "startAt"
      | "customerName"
      | "servicePriceSnapshot"
      | "status"
      | null) || undefined;
    const sortOrder = (searchParams.get("sortOrder") as "asc" | "desc" | null) || undefined;

    const bookings = await bookingService.listByOwner(user.businessId, {
      search,
      status,
      date,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return apiSuccess(bookings);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    checkRateLimit(`booking-create:${ip}`, 20, 60000);

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    const booking = await bookingService.create(validatedData);

    return apiSuccess(booking, "Reservasi berhasil dibuat.", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
