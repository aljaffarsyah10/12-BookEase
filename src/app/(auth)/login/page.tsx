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
import {
  loginSchema,
  type LoginFormValues,
} from "@/lib/validations/auth.schema";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await authApi.login(values);
      toast.success("Berhasil masuk ke workspace bisnis!", {
        description: `Selamat datang kembali, ${result.user.name}`,
      });
      router.push("/dashboard");
    } catch (err) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error("Gagal masuk. Silakan periksa kembali email dan password.");
      }
    }
  };

  return (
    <SectionCard
      title="Masuk ke Akun Bisnis"
      description="Kelola jadwal, layanan, staf, dan reservasi pelanggan Anda."
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Alamat Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="owner@bisnisanda.id"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
              className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-10 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-2"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          <span>
            {isSubmitting ? "Memverifikasi Akun..." : "Masuk ke Dashboard"}
          </span>
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-slate-500">
        Belum memiliki akun bisnis?{" "}
        <Link
          href="/register"
          className="font-semibold text-indigo-600 hover:bg-indigo-50 hover:underline"
        >
          Daftar sekarang
        </Link>
      </p>
    </SectionCard>
  );
}
