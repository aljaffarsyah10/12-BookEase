"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SectionCard } from "@/components/shared/section-card";
import { authApi } from "@/features/auth/services/auth.api";
import { ApiClientError } from "@/lib/api-client";
import { slugify } from "@/lib/format";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth.schema";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      businessName: "",
      businessSlug: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchedSlug = watch("businessSlug");

  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("businessName", val, { shouldValidate: true });
    setValue("businessSlug", slugify(val), { shouldValidate: true });
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await authApi.register(values);
      toast.success("Akun & Workspace Bisnis Berhasil Dibuat!", {
        description: `Halaman publik: /book/${result.business.slug}`,
      });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal mendaftarkan bisnis. Silakan periksa kembali data Anda.");
      }
    }
  };

  return (
    <SectionCard
      title="Daftarkan Bisnis Anda"
      description="Buat halaman booking online bisnis Anda dalam hitungan menit."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Lengkap Pemilik</Label>
          <Input
            id="name"
            type="text"
            placeholder="Budi Santoso"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-rose-600 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="businessName">Nama Bisnis</Label>
          <Input
            id="businessName"
            type="text"
            placeholder="Glow Beauty Studio"
            aria-invalid={!!errors.businessName}
            {...register("businessName", {
              onChange: handleBusinessNameChange,
            })}
          />
          {errors.businessName && (
            <p className="text-xs text-rose-600 font-medium">
              {errors.businessName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="businessSlug">Slug URL Booking Publik</Label>
          <Input
            id="businessSlug"
            type="text"
            placeholder="glow-beauty-studio"
            aria-invalid={!!errors.businessSlug}
            {...register("businessSlug")}
          />
          <div className="rounded-md bg-slate-50 border border-slate-200/60 px-2.5 py-1 text-[11px] text-slate-600 font-mono flex items-center gap-1">
            <span className="text-slate-400">Pratinjau:</span>
            <span className="text-indigo-600 font-semibold">bookease.com/book/{watchedSlug || "nama-bisnis"}</span>
          </div>
          {errors.businessSlug && (
            <p className="text-xs text-rose-600 font-medium">
              {errors.businessSlug.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Alamat Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="budi@glowstudio.id"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-rose-600 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 karakter"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                className="pr-9"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password"
                className="absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 font-medium">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <Input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="Ulangi password"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-rose-600 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10.5 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2 shadow-2xs mt-2"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          <span>
            {isSubmitting
              ? "Membuat Workspace..."
              : "Buat Akun & Workspace Bisnis"}
          </span>
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500 font-medium">
        Sudah memiliki akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          Masuk di sini
        </Link>
      </p>
    </SectionCard>
  );
}
