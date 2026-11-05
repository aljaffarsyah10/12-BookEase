import { z } from "zod";

export const businessProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama bisnis minimal 2 karakter")
    .max(100, "Nama bisnis maksimal 100 karakter"),
  slug: z
    .string()
    .trim()
    .min(3, "Slug URL minimal 3 karakter")
    .max(60, "Slug URL maksimal 60 karakter")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)"
    ),
  category: z.string().trim().min(2, "Kategori bisnis wajib dipilih"),
  description: z
    .string()
    .trim()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(8, "Nomor telepon minimal 8 digit")
    .max(20, "Nomor telepon maksimal 20 karakter"),
  address: z
    .string()
    .trim()
    .min(5, "Alamat bisnis minimal 5 karakter")
    .max(250, "Alamat maksimal 250 karakter"),
  timezone: z.enum(["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"]),
  bufferTimeMinutes: z
    .number()
    .int()
    .min(0, "Buffer time tidak boleh negatif")
    .max(120, "Buffer time maksimal 120 menit"),
});

export type BusinessProfileFormValues = z.infer<typeof businessProfileSchema>;

