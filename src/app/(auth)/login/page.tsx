import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/shared/section-card";

export default function LoginPage() {
  return (
    <SectionCard
      title="Masuk ke Akun Bisnis"
      description="Kelola jadwal, layanan, dan reservasi pelanggan Anda."
    >
      <form className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Alamat Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="owner@bisnisanda.id"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>

        <Link
          href="/dashboard"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Masuk ke Dashboard
        </Link>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Belum memiliki akun bisnis?{" "}
        <Link
          href="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Daftar sekarang
        </Link>
      </p>
    </SectionCard>
  );
}

