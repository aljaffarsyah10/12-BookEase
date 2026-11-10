import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { signSessionToken } from "@/lib/auth-session";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security";
import { registerSchema } from "@/lib/validations/auth.schema";
import { authService } from "@/server/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    checkRateLimit(`register:${ip}`, 10, 60000);

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    const result = await authService.register(validatedData);

    // Set secure signed auth cookie
    const cookieStore = await cookies();
    cookieStore.set("bookease_session", signSessionToken(result.user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return apiSuccess(result, "Pendaftaran akun bisnis berhasil.", 201);
  } catch (err) {
    return handleApiError(err);
  }
}
