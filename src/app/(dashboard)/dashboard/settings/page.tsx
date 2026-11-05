"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default function SettingsPage() {
  const router = useRouter();
  const [ownerName, setOwnerName] = React.useState("Budi Santoso");
  const [ownerEmail] = React.useState("budi@glowstudio.id");

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Informasi akun berhasil diperbarui!");
  };

  const handleLogout = () => {
    toast.info("Anda telah keluar dari sesi dashboard.");
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Akun (Settings)"
        description="Kelola profil akun pemilik bisnis dan sesi autentikasi Anda."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="size-4" />
            <span>Keluar (Logout)</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Profil Pemilik Bisnis"
          description="Identitas akun yang memiliki akses penuh ke workspace bisnis."
        >
          <form onSubmit={handleSaveAccount} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="owner-name">Nama Lengkap</Label>
              <Input
                id="owner-name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="owner-email">Email Terdaftar</Label>
              <Input id="owner-email" value={ownerEmail} disabled />
              <p className="text-xs text-slate-500">
                Email digunakan sebagai kredensial utama login BookEase.
              </p>
            </div>

            <Button
              type="submit"
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <User className="size-4" />
              <span>Simpan Profil Akun</span>
            </Button>
          </form>
        </SectionCard>

        <SectionCard
          title="Keamanan & Isolasi Data"
          description="Status perlindungan workspace bisnis Anda."
        >
          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-start gap-3 rounded-lg bg-emerald-50/70 border border-emerald-200 p-3.5 text-emerald-800">
              <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-xs sm:text-sm">
                  Multi-Tenant Workspace Isolation
                </p>
                <p className="mt-0.5 text-xs">
                  Seluruh layanan, staf, jadwal, dan data pelanggan terisolasi
                  khusus untuk workspace bisnis Anda.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
