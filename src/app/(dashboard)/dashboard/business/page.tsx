import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";

export default function BusinessProfilePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Bisnis (Business Profile)"
        description="Atur nama bisnis, kategori, slug URL halaman booking publik, dan zona waktu."
        actions={
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Simpan Perubahan
          </Button>
        }
      />

      <SectionCard
        title="Identitas & URL Publik Bisnis"
        description="Informasi ini akan ditampilkan kepada pelanggan di halaman booking publik Anda."
      >
        <form className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="businessName">Nama Bisnis</Label>
            <Input id="businessName" defaultValue="Glow Beauty Studio" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessSlug">Slug URL Publik</Label>
            <Input id="businessSlug" defaultValue="glow-beauty-studio" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category">Kategori Bisnis</Label>
            <Input id="category" defaultValue="Beauty & Salon" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="timezone">Zona Waktu Bisnis</Label>
            <Input id="timezone" defaultValue="Asia/Jakarta" />
          </div>
        </form>
      </SectionCard>
    </div>
  );
}

