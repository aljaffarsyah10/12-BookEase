"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { BUSINESS_CATEGORIES } from "@/features/business/mocks/business.mock";
import { businessMockService } from "@/features/business/services/business.mock-service";
import {
  businessProfileSchema,
  type BusinessProfileFormValues,
} from "@/lib/validations/business.schema";

export default function BusinessProfilePage() {
  const [isLoading, setIsLoading] = React.useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BusinessProfileFormValues>({
    resolver: zodResolver(businessProfileSchema),
    defaultValues: {
      name: "",
      slug: "",
      category: "Beauty & Salon",
      description: "",
      phone: "",
      address: "",
      timezone: "Asia/Jakarta",
      bufferTimeMinutes: 10,
    },
  });

  React.useEffect(() => {
    let active = true;
    businessMockService.getBusiness().then((biz) => {
      if (!active) return;
      reset({
        name: biz.name,
        slug: biz.slug,
        category: biz.category,
        description: biz.description ?? "",
        phone: biz.phone ?? "",
        address: biz.address ?? "",
        timezone: biz.timezone,
        bufferTimeMinutes: biz.bufferTimeMinutes,
      });
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [reset]);

  const currentSlug = watch("slug");

  const onSubmit = async (values: BusinessProfileFormValues) => {
    const updated = await businessMockService.updateBusiness(values);
    toast.success("Profil bisnis berhasil diperbarui!", {
      description: `Slug publik: /book/${updated.slug}`,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Profil Bisnis (Business Profile)"
          description="Atur identitas bisnis, kategori, slug URL halaman booking publik, dan zona waktu."
        />
        <LoadingState variant="detail" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profil Bisnis (Business Profile)"
        description="Atur identitas bisnis, kategori, slug URL halaman booking publik, dan zona waktu."
        actions={
          <Link
            href={`/book/${currentSlug || "glow-beauty-studio"}`}
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span>Lihat Halaman Publik</span>
            <ExternalLink className="size-3.5" />
          </Link>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <SectionCard
          title="Identitas & URL Publik Bisnis"
          description="Informasi ini ditampilkan secara publik kepada pelanggan di halaman reservasi."
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Bisnis</Label>
              <Input
                id="name"
                placeholder="Glow Beauty Studio"
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug URL Halaman Booking</Label>
              <Input
                id="slug"
                placeholder="glow-beauty-studio"
                aria-invalid={!!errors.slug}
                {...register("slug")}
              />
              <p className="text-[11px] font-mono text-slate-500">
                URL Publik: bookease.com/book/{currentSlug || "nama-bisnis"}
              </p>
              {errors.slug && (
                <p className="text-xs text-red-600">{errors.slug.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="category">Kategori Bisnis</Label>
              <select
                id="category"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                {...register("category")}
              >
                {BUSINESS_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-red-600">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Nomor Telepon / WhatsApp Bisnis</Label>
              <Input
                id="phone"
                placeholder="+6281234567890"
                aria-invalid={!!errors.phone}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">Alamat Lengkap Lokasi Layanan</Label>
              <Input
                id="address"
                placeholder="Jl. Jenderal Sudirman No. 45, Jakarta"
                aria-invalid={!!errors.address}
                {...register("address")}
              />
              {errors.address && (
                <p className="text-xs text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="description">Deskripsi Singkat Bisnis</Label>
              <textarea
                id="description"
                rows={3}
                placeholder="Jelaskan keunggulan layanan dan suasana tempat bisnis Anda..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Pengaturan Zona Waktu & Jeda Reservasi"
          description="Menentukan bagaimana slot waktu dihitung untuk seluruh layanan bisnis Anda."
          footer={
            <div className="flex w-full items-center justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {isSubmitting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                <span>
                  {isSubmitting ? "Menyimpan..." : "Simpan Profil Bisnis"}
                </span>
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="timezone">Zona Waktu Operasional Bisnis</Label>
              <select
                id="timezone"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                {...register("timezone")}
              >
                <option value="Asia/Jakarta">Asia/Jakarta (WIB - UTC+7)</option>
                <option value="Asia/Makassar">
                  Asia/Makassar (WITA - UTC+8)
                </option>
                <option value="Asia/Jayapura">
                  Asia/Jayapura (WIT - UTC+9)
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bufferTimeMinutes">
                Buffer Time / Jeda Antar-Reservasi (Menit)
              </Label>
              <Input
                id="bufferTimeMinutes"
                type="number"
                min={0}
                max={120}
                step={5}
                aria-invalid={!!errors.bufferTimeMinutes}
                {...register("bufferTimeMinutes", { valueAsNumber: true })}
              />
              <p className="text-[11px] text-slate-500">
                Waktu persiapan staf setelah satu sesi layanan selesai.
              </p>
              {errors.bufferTimeMinutes && (
                <p className="text-xs text-red-600">
                  {errors.bufferTimeMinutes.message}
                </p>
              )}
            </div>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}
