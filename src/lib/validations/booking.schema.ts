import { z } from "zod";

export const customerDetailsSchema = z.object({
  customerName: z
    .string()
    .trim()
    .min(2, "Nama lengkap minimal 2 karakter")
    .max(100, "Nama lengkap maksimal 100 karakter"),
  customerEmail: z
    .string()
    .trim()
    .min(1, "Alamat email wajib diisi")
    .email("Format alamat email tidak valid"),
  customerPhone: z
    .string()
    .trim()
    .min(8, "Nomor telepon / WhatsApp minimal 8 digit")
    .max(20, "Nomor telepon maksimal 20 karakter")
    .regex(
      /^[0-9+\-\s()]+$/,
      "Nomor telepon hanya boleh berisi angka dan tanda +"
    ),
  customerNotes: z
    .string()
    .trim()
    .max(300, "Catatan tambahan maksimal 300 karakter")
    .optional()
    .or(z.literal("")),
});

export type CustomerDetailsFormValues = z.infer<typeof customerDetailsSchema>;

export const bookingStatusUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
    "NO_SHOW",
  ]),
  cancelReason: z
    .string()
    .trim()
    .max(250, "Alasan pembatalan maksimal 250 karakter")
    .optional()
    .or(z.literal("")),
});

export type BookingStatusUpdateValues = z.infer<
  typeof bookingStatusUpdateSchema
>;

export const bulkBookingStatusUpdateSchema = z.object({
  ids: z.array(z.string().min(1)).min(1, "Minimal pilih 1 reservasi"),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "COMPLETED",
    "NO_SHOW",
  ]),
  cancelReason: z
    .string()
    .trim()
    .max(250, "Alasan pembatalan maksimal 250 karakter")
    .optional()
    .or(z.literal("")),
});

export type BulkBookingStatusUpdateValues = z.infer<
  typeof bulkBookingStatusUpdateSchema
>;

export const createBookingSchema = z.object({
  businessSlug: z.string().trim().min(1, "Slug bisnis wajib diisi"),
  serviceId: z.string().trim().min(1, "Layanan wajib dipilih"),
  staffId: z.string().trim().optional(),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD"),
  time: z
    .string()
    .trim()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam harus HH:mm"),
  customerName: customerDetailsSchema.shape.customerName,
  customerEmail: customerDetailsSchema.shape.customerEmail,
  customerPhone: customerDetailsSchema.shape.customerPhone,
  customerNotes: customerDetailsSchema.shape.customerNotes,
});

export type CreateBookingFormValues = z.infer<typeof createBookingSchema>;
