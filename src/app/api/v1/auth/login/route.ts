import { cookies } from "next/headers";
import { type NextRequest } from "next/server";
import { apiSuccess, handleApiError } from "@/lib/api-response";
import { signSessionToken } from "@/lib/auth-session";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIpFromHeaders } from "@/lib/security";
import { loginSchema } from "@/lib/validations/auth.schema";
import { authService } from "@/server/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIpFromHeaders(request.headers);
    checkRateLimit(`login:${ip}`, 15, 60000);

    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const result = await authService.login(
      validatedData.email,
      validatedData.password
    );

    // Set secure signed auth cookie
    const cookieStore = await cookies();
    cookieStore.set("bookease_session", signSessionToken(result.user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return apiSuccess(result, "Login berhasil.");
  } catch (err) {
    return handleApiError(err);
  }
}
