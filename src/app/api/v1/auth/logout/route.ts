import { cookies } from "next/headers";
import { apiSuccess, handleApiError } from "@/lib/api-response";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("bookease_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    cookieStore.delete("bookease_session");
    return apiSuccess(null, "Logout berhasil.");
  } catch (err) {
    return handleApiError(err);
  }
}
