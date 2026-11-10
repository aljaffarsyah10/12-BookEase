import { z } from "zod";

export const createCheckoutSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
  paymentMethod: z
    .enum(["QRIS", "BCA_VA", "MANDIRI_VA", "BNI_VA", "BRI_VA", "CREDIT_CARD"])
    .default("QRIS"),
});

export const simulatePaymentSchema = z.object({
  invoiceId: z.string().min(1, "ID invoice wajib diisi."),
  paymentMethod: z
    .enum(["QRIS", "BCA_VA", "MANDIRI_VA", "BNI_VA", "BRI_VA", "CREDIT_CARD"])
    .default("QRIS"),
});

export const billingWebhookSchema = z.object({
  invoiceNumber: z.string().min(1),
  transactionStatus: z.enum([
    "settlement",
    "capture",
    "pending",
    "expire",
    "cancel",
    "deny",
  ]),
  paymentType: z.string().optional(),
});
