import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/shared/loading-state";
import { prisma } from "@/lib/prisma";
import { PublicBookingClientView } from "./public-booking-client";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const business = await prisma.business.findUnique({
    where: { slug: slug.toLowerCase() },
    select: { name: true, category: true, description: true },
  });

  if (!business) {
    return {
      title: "Halaman Bisnis Tidak Ditemukan",
    };
  }

  return {
    title: `${business.name} — Reservasi Online`,
    description:
      business.description ||
      `Pesan jadwal janji temu online di ${business.name} (${business.category}).`,
    openGraph: {
      title: `${business.name} — Reservasi Online`,
      description:
        business.description ||
        `Pesan jadwal janji temu online di ${business.name}.`,
    },
  };
}

async function PublicBookingSlugResolver({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <PublicBookingClientView slug={slug} />;
}

export default function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-5xl p-6">
          <LoadingState variant="detail" />
        </div>
      }
    >
      <PublicBookingSlugResolver params={params} />
    </Suspense>
  );
}
