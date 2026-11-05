import { Suspense } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { LoadingState } from "@/components/shared/loading-state";
import { SectionCard } from "@/components/shared/section-card";

async function BookingSuccessContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-lg">
        <SectionCard>
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Reservasi Berhasil Dibuat!
            </h1>
            <p className="text-sm text-slate-600">
              Simpan kode referensi berikut sebagai bukti reservasi Anda di{" "}
              <span className="font-semibold text-slate-900 capitalize">
                {slug.replace(/-/g, " ")}
              </span>
              .
            </p>
            <div className="w-full rounded-lg border border-indigo-200 bg-indigo-50/60 px-4 py-3">
              <p className="text-xs text-slate-500">Kode Referensi Booking</p>
              <p className="mt-0.5 font-mono text-lg font-bold tracking-wider text-indigo-700">
                BK-20261105-DEMO01
              </p>
            </div>
            <Link
              href={`/book/${slug}`}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Kembali ke Halaman Bisnis
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default function BookingSuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg p-6">
          <LoadingState variant="detail" />
        </div>
      }
    >
      <BookingSuccessContent params={params} />
    </Suspense>
  );
}

