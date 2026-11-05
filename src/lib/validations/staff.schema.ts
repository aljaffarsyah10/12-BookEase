import { z } from "zod";

export const staffFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama staf minimal 2 karakter")
    .max(100, "Nama staf maksimal 100 karakter"),
  roleOrTitle: z
    .string()
    .trim()
    .min(2, "Jabatan/peran minimal 2 karakter")
    .max(80, "Jabatan/peran maksimal 80 karakter"),
  bio: z
    .string()
    .trim()
    .max(250, "Bio singkat maksimal 250 karakter")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean(),
  serviceIds: z
    .array(z.string())
    .min(1, "Pilih minimal 1 layanan yang ditangani oleh staf ini"),
});

export type StaffFormValues = z.infer<typeof staffFormSchema>;

