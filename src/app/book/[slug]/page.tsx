import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/shared/loading-state";
import { businessService } from "@/server/services/business.service";
import { PublicBookingClientView } from "./public-booking-client";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bookease.id";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const business = await businessService.getPublicBySlug(slug).catch(() => null);

  if (!business) {
    return {
      title: "Halaman Bisnis Tidak Ditemukan | BookEase",
      robots: { index: false },
    };
  }

  const pageTitle = `${business.name} — Reservasi & Janji Temu Online`;
  const pageDescription =
    business.description ||
    `Pesan jadwal janji temu online di ${business.name} (${business.category}). Layanan terpercaya dengan reservasi instan tanpa antre.`;
  const pageUrl = `${appUrl}/book/${slug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: pageUrl,
      siteName: `${business.name} | BookEase`,
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
  };
}

async function PublicBookingSlugResolver({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const business = await businessService.getPublicBySlug(slug).catch(() => null);

  const localBusinessJsonLd = business
    ? {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": business.name,
        "description": business.description || `Bisnis jasa ${business.category}`,
        "url": `${appUrl}/book/${slug}`,
        "telephone": business.phone || undefined,
        "address": business.address
          ? {
              "@type": "PostalAddress",
              "streetAddress": business.address,
              "addressCountry": "ID",
            }
          : undefined,
      }
    : null;

  return (
    <>
      {localBusinessJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      )}
      <PublicBookingClientView slug={slug} />
    </>
  );
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
