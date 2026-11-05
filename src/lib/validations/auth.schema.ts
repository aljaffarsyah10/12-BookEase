import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(8, "Password minimal 8 karakter"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Nama lengkap minimal 2 karakter")
      .max(100, "Nama lengkap maksimal 100 karakter"),
    businessName: z
      .string()
      .trim()
      .min(2, "Nama bisnis minimal 2 karakter")
      .max(100, "Nama bisnis maksimal 100 karakter"),
    businessSlug: z
      .string()
      .trim()
      .min(3, "Slug URL minimal 3 karakter")
      .max(60, "Slug URL maksimal 60 karakter")
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Slug hanya boleh huruf kecil, angka, dan tanda hubung (-)"
      ),
    email: z
      .string()
      .trim()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Password harus mengandung kombinasi huruf dan angka"
      ),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

