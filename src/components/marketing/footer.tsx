import Link from "next/link";
import { CalendarCheck } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-2 space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-slate-900 font-bold group"
            >
              <span className="flex size-8.5 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 text-white shadow-xs shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <CalendarCheck className="size-4" />
              </span>
              <span className="text-lg font-extrabold tracking-tight">BookEase</span>
            </Link>
            <p className="max-w-sm text-sm text-slate-500 leading-relaxed">
              Platform booking online & manajemen jadwal profesional untuk
              salon, klinik, konsultan, studio, dan berbagai bisnis jasa.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Produk
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/features" className="hover:text-indigo-600">
                  Fitur Utama
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-indigo-600">
                  Harga & Paket
                </Link>
              </li>
              <li>
                <Link
                  href="/book/glow-beauty-studio"
                  className="hover:text-indigo-600"
                >
                  Halaman Demo Publik
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600">
                  Dashboard Bisnis
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">
              Legal & Akun
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li>
                <Link href="/login" className="hover:text-indigo-600">
                  Masuk Pemilik Bisnis
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-indigo-600">
                  Daftar Akun Baru
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-indigo-600">
                  Kebijakan Privasi
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-indigo-600">
                  Syarat & Ketentuan
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 BookEase. Seluruh hak cipta dilindungi.</p>
          <p>Didesain untuk kemudahan reservasi pelanggan tanpa antre.</p>
        </div>
      </div>
    </footer>
  );
}

