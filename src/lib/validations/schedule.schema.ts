import { z } from "zod";

export const operatingHourItemSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    openTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam harus HH:mm"),
    closeTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Format jam harus HH:mm"),
    isClosed: z.boolean(),
  })
  .refine(
    (item) => {
      if (item.isClosed) return true;
      return item.closeTime > item.openTime;
    },
    {
      message: "Jam tutup harus lebih besar daripada jam buka",
      path: ["closeTime"],
    }
  );

export const scheduleFormSchema = z.object({
  bufferTimeMinutes: z.number().int().min(0).max(120),
  schedule: z.array(operatingHourItemSchema).length(7),
});

export type OperatingHourItemValues = z.infer<typeof operatingHourItemSchema>;
export type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

