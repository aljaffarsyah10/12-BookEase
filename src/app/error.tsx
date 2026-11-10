"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const supportCode = error.digest || "ERR-SYSTEM-UNEXPECTED";

  React.useEffect(() => {
    console.error("[AppErrorBoundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto max-w-md space-y-6">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-xs ring-8 ring-rose-50/50 dark:bg-rose-950/60 dark:text-rose-400 dark:ring-rose-950/30">
          <AlertCircle className="size-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Terjadi Kendala Teknis
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Halaman ini mengalami kendala yang tidak terduga. Sistem pemantauan kami telah mencatat peristiwa ini agar segera ditindaklanjuti.
          </p>
        </div>

        {supportCode && (
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 px-3.5 py-2 text-xs font-mono text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
            <span>Kode Referensi Bantuan: </span>
            <span className="font-bold text-slate-900 dark:text-white">{supportCode}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            <RefreshCw className="size-4" />
            <span>Coba Muat Ulang</span>
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="size-4" />
              <span>Kembali ke Dashboard</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
