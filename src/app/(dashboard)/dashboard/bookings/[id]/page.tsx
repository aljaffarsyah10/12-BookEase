import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";

async function BookingDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Detail Reservasi #${id}`}
        description="Informasi lengkap pelanggan, layanan, staf, dan status jadwal."
        badge={<StatusBadge status="CONFIRMED" />}
        actions={
          <Link
            href="/dashboard/bookings"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft className="size-3.5" />
            <span>Kembali ke Daftar</span>
          </Link>
        }
      />

      <SectionCard
        title="Informasi Reservasi"
        description="Kerangka halaman detail reservasi (Phase 4 Application Shell)."
      >
        <p className="text-sm text-slate-600">
          Menampilkan detail untuk ID reservasi:{" "}
          <span className="font-mono font-semibold text-slate-900">{id}</span>
        </p>
      </SectionCard>
    </div>
  );
}

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<LoadingState variant="detail" />}>
      <BookingDetailContent params={params} />
    </Suspense>
  );
}

