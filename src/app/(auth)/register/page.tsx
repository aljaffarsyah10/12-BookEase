import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/shared/section-card";

export default function RegisterPage() {
  return (
    <SectionCard
      title="Daftarkan Bisnis Anda"
      description="Buat halaman booking online bisnis Anda dalam hitungan menit."
    >
      <form className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Pemilik</Label>
          <Input id="name" type="text" placeholder="Budi Santoso" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="businessName">Nama Bisnis</Label>
          <Input
            id="businessName"
            type="text"
            placeholder="Glow Beauty Studio"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Alamat Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="budi@glowstudio.id"
            autoComplete="email"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
          />
        </div>

        <Link
          href="/dashboard"
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Buat Akun & Workspace Bisnis
        </Link>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Sudah memiliki akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700"
        >
          Masuk di sini
        </Link>
      </p>
    </SectionCard>
  );
}

