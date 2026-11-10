"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function RootGlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("[RootGlobalError]", error);
  }, [error]);

  return (
    <html lang="id">
      <body className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans text-slate-900">
        <div className="mx-auto max-w-md text-center space-y-6 rounded-3xl bg-white p-8 shadow-xl border border-slate-200">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="size-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Sistem Mengalami Kendala
            </h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mohon maaf atas ketidaknyamanan ini. Terjadi kesalahan mendasar pada aplikasi.
            </p>
          </div>

          {error.digest && (
            <p className="rounded-xl bg-slate-100 p-2 font-mono text-xs text-slate-600">
              Ref: {error.digest}
            </p>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="size-4" />
              <span>Muat Ulang Aplikasi</span>
            </button>
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
