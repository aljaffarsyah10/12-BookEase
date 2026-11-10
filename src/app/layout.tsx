import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://bookease.id";

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "BookEase — Platform Reservasi & Janji Temu Online",
    template: "%s | BookEase",
  },
  description:
    "Platform reservasi digital dan manajemen janji temu online tanpa bentrok untuk salon, klinik, konsultan, dan bisnis jasa profesional di Indonesia.",
  keywords: [
    "booking online",
    "reservasi online indonesia",
    "software janji temu",
    "jadwal klinik otomatis",
    "booking salon qris",
    "sistem antrian online",
    "bookease saas",
  ],
  authors: [{ name: "BookEase Team", url: appUrl }],
  creator: "BookEase",
  publisher: "BookEase",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BookEase — Platform Reservasi & Janji Temu Online",
    description:
      "Sistem pemesanan jadwal otomatis tanpa bentrok untuk bisnis jasa profesional di Indonesia.",
    url: appUrl,
    siteName: "BookEase Indonesia",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookEase — Platform Reservasi & Janji Temu Online",
    description:
      "Solusi otomatisasi booking dan jadwal janji temu pelanggan untuk bisnis Anda.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "BookEase",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web Browser",
      "url": appUrl,
      "description":
        "Platform SaaS reservasi dan manajemen janji temu online untuk bisnis jasa di Indonesia.",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "IDR",
        "lowPrice": "0",
        "highPrice": "499000",
        "offerCount": "4",
      },
      "featureList": [
        "Pencegahan Double Booking Otomatis",
        "Halaman Booking Publik /book/slug",
        "Integrasi Sandbox Payment QRIS & VA",
        "Notifikasi Pengingat Email Otomatis",
        "Manajemen Multi-Staf & Layanan",
      ],
    },
    {
      "@type": "Organization",
      "name": "BookEase Indonesia",
      "url": appUrl,
      "logo": `${appUrl}/favicon.ico`,
      "sameAs": ["https://twitter.com/bookease_id"],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {/* Screen Reader & Keyboard Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white text-xs font-bold"
        >
          Lewati ke konten utama
        </a>
        <main id="main-content" className="flex-1 flex flex-col">
          {children}
        </main>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
