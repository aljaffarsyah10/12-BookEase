import { z } from "zod";

export const serviceFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama layanan minimal 2 karakter")
    .max(100, "Nama layanan maksimal 100 karakter"),
  description: z
    .string()
    .trim()
    .max(300, "Deskripsi maksimal 300 karakter")
    .optional()
    .or(z.literal("")),
  price: z
    .number()
    .int("Harga harus berupa angka bulat")
    .min(0, "Harga tidak boleh negatif")
    .max(100000000, "Harga melebihi batas maksimum"),
  durationMinutes: z
    .number()
    .int("Durasi harus berupa angka bulat")
    .min(5, "Durasi layanan minimal 5 menit")
    .max(480, "Durasi layanan maksimal 480 menit (8 jam)"),
  isActive: z.boolean(),
  staffIds: z
    .array(z.string())
    .min(1, "Pilih minimal 1 staf untuk menangani layanan ini"),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;

