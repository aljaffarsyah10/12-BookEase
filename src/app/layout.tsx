import type { Metadata } from "next";
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

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "BookEase — Platform Reservasi & Janji Temu Online",
    template: "%s | BookEase",
  },
  description:
    "Platform reservasi dan manajemen janji temu online untuk salon, klinik, konsultan, dan bisnis jasa profesional di Indonesia.",
  keywords: [
    "booking online",
    "reservasi online",
    "appointment software",
    "jadwal klinik",
    "booking salon",
    "bookease",
  ],
  authors: [{ name: "BookEase Team" }],
  openGraph: {
    title: "BookEase — Platform Reservasi & Janji Temu Online",
    description:
      "Sistem pemesanan jadwal otomatis tanpa bentrok untuk bisnis jasa profesional.",
    url: appUrl,
    siteName: "BookEase",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BookEase — Platform Reservasi & Janji Temu Online",
    description:
      "Solusi otomatisasi booking dan jadwal janji temu pelanggan untuk bisnis Anda.",
  },
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
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
