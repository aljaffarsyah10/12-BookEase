import { cookies } from "next/headers";
import { verifySessionToken } from "@/lib/auth-session";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  businessId: string;
}

export async function requireBusinessOwner(): Promise<AuthenticatedUser> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("bookease_session")?.value;
  const userId = verifySessionToken(sessionToken);

  if (!userId) {
    // In development mode only: allow seed fallback for quick local testing
    if (process.env.NODE_ENV !== "production") {
      const firstUser = await prisma.user.findFirst({
        include: { business: true },
      });

      if (firstUser && firstUser.business) {
        return {
          id: firstUser.id,
          email: firstUser.email,
          name: firstUser.name,
          businessId: firstUser.business.id,
        };
      }
    }

    throw new AppError(
      "UNAUTHORIZED",
      "Sesi tidak valid atau telah berakhir. Silakan login.",
      401
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { business: true },
  });

  if (!user || !user.business) {
    // In development mode: allow seed fallback if stale cookie is present
    if (process.env.NODE_ENV !== "production") {
      const firstUser = await prisma.user.findFirst({
        include: { business: true },
      });

      if (firstUser && firstUser.business) {
        return {
          id: firstUser.id,
          email: firstUser.email,
          name: firstUser.name,
          businessId: firstUser.business.id,
        };
      }
    }

    throw new AppError(
      "UNAUTHORIZED",
      "Pengguna tidak ditemukan atau tidak memiliki workspace bisnis.",
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
