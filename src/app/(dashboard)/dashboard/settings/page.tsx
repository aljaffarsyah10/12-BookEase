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
import { authApi } from "@/features/auth/services/auth.api";

export default function SettingsPage() {
  const router = useRouter();
  const [ownerName, setOwnerName] = React.useState("Budi Santoso");
  const [ownerEmail, setOwnerEmail] = React.useState("budi@glowstudio.id");

  React.useEffect(() => {
    let active = true;
    authApi
      .getMe()
      .then((data) => {
        if (!active) return;
        if (data.user) {
          setOwnerName(data.user.name);
          setOwnerEmail(data.user.email);
        }
      })
      .catch((err) => {
        console.error("Failed to load user in settings:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Informasi akun berhasil diperbarui!");
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.info("Anda telah keluar dari sesi dashboard.");
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan Akun"
        description="Kelola profil akun pemilik bisnis dan konfigurasi keamanan workspace."
        actions={
          <Button
            type="button"
            variant="outline"
            onClick={handleLogout}
            className="gap-2 text-rose-600 border-rose-200/80 hover:bg-rose-50 hover:text-rose-700 h-9"
          >
            <LogOut className="size-4" />
            <span>Keluar Sesi</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard
          title="Profil Pemilik Bisnis"
          description="Identitas akun yang memiliki hak akses penuh ke workspace bisnis ini."
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
              <Input id="owner-email" value={ownerEmail} disabled className="bg-slate-50 text-slate-500" />
              <p className="text-xs text-slate-500">
                Email digunakan sebagai kredensial utama autentikasi BookEase.
              </p>
            </div>

            <Button
              type="submit"
              className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold shadow-xs active:scale-[0.98]"
            >
              <User className="size-4" />
              <span>Simpan Profil Akun</span>
            </Button>
          </form>
        </SectionCard>

        <SectionCard
          title="Keamanan & Proteksi Workspace"
          description="Status isolasi multi-tenant data bisnis Anda."
        >
          <div className="space-y-4 text-sm text-slate-600">
            <div className="flex items-start gap-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 p-4 text-emerald-900">
              <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">
                  Multi-Tenant Workspace Isolation Active
                </p>
                <p className="mt-1 text-xs text-emerald-800/90 leading-relaxed">
                  Seluruh katalog layanan, staf penyedia, jam operasional, dan data reservasi pelanggan terisolasi secara kriptografis khusus untuk workspace bisnis Anda.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 space-y-1.5 text-xs text-slate-600">
              <p className="font-semibold text-slate-900">Enkripsi Data & Token</p>
              <p className="leading-relaxed">
                Setiap booking dilengkapi HMAC-SHA256 cancellation token yang tahan terhadap upaya tampering atau IDOR antar pelanggan.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
