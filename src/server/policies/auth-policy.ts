import { cookies, headers } from "next/headers";
import { verifySessionToken } from "@/lib/auth-session";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { validateCsrfOrigin } from "@/lib/security";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  businessId: string;
}

export async function requireBusinessOwner(): Promise<AuthenticatedUser> {
  const reqHeaders = await headers();
  // Enforce CSRF Origin validation on requests that pass cookies
  validateCsrfOrigin(reqHeaders);

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("bookease_session")?.value;
  const userId = verifySessionToken(sessionToken);

  if (!userId) {
    throw new AppError(
      "UNAUTHORIZED",
      "Sesi autentikasi tidak valid atau telah berakhir. Silakan login kembali.",
      401
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { business: true },
  });

  if (!user || !user.business) {
    throw new AppError(
      "UNAUTHORIZED",
      "Akun pengguna tidak ditemukan atau belum memiliki workspace bisnis yang terhubung.",
      401
    );
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    businessId: user.business.id,
  };
}
