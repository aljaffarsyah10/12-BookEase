import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
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

    const bookings = await bookingService.listByOwner(user.businessId, {
      search,
      status,
      date,
    });

    return apiSuccess(bookings);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "local";
    checkRateLimit(`booking-create:${ip}`, 20, 60000);

    const body = await request.json();
    const validatedData = createBookingSchema.parse(body);

    const booking = await bookingService.create(validatedData);

    return apiSuccess(booking, "Reservasi berhasil dibuat.", 201);
  } catch (err) {
    return handleApiError(err);
  }
}

