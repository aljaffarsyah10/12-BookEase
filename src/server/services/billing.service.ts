import crypto from "crypto";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "@/lib/subscription-plans";

export interface CreateCheckoutInput {
  plan: SubscriptionPlanId;
  paymentMethod?: string; // "QRIS" | "BCA_VA" | "MANDIRI_VA" | "CREDIT_CARD"
}

function generateInvoiceNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `INV-${dateStr}-${randomSuffix}`;
}

export const billingService = {
  /**
   * Create an invoice for subscription upgrade / renewal in Sandbox mode.
   */
  async createCheckout(businessId: string, input: CreateCheckoutInput) {
    if (input.plan === "FREE_TRIAL") {
      throw new AppError(
        "INVALID_PLAN",
        "Paket Free Trial tidak memerlukan pembayaran checkout.",
        400
      );
    }

    const planDef = SUBSCRIPTION_PLANS[input.plan];
    if (!planDef) {
      throw new AppError("INVALID_PLAN", "Paket langganan tidak valid.", 400);
    }

    const business = await prisma.business.findUnique({
      where: { id: businessId },
    });

    if (!business) {
      throw new AppError("BUSINESS_NOT_FOUND", "Bisnis tidak ditemukan.", 404);
    }

    const invoiceNumber = generateInvoiceNumber();
    const paymentMethod = input.paymentMethod || "QRIS";

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        businessId,
        plan: input.plan,
        amount: planDef.price,
        status: "PENDING",
        paymentProvider: "SANDBOX_GATEWAY",
        paymentMethod,
        paymentUrl: `/dashboard/billing?invoiceId=${invoiceNumber}`,
      },
    });

    return {
      invoice,
      plan: planDef,
      checkoutUrl: invoice.paymentUrl,
      isSandbox: true,
      message: "Invoice berhasil diterbitkan. Silakan selesaikan simulasi pembayaran di Sandbox.",
    };
  },

  /**
   * List invoices belonging to the business with strict tenant isolation.
   */
  async listInvoices(businessId: string) {
    return prisma.invoice.findMany({
      where: { businessId },
      orderBy: { createdAt: "desc" },
    });
  },

  /**
   * Get single invoice by ID or InvoiceNumber with tenant isolation.
   */
  async getInvoice(businessId: string, invoiceIdentifier: string) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        businessId,
        OR: [{ id: invoiceIdentifier }, { invoiceNumber: invoiceIdentifier }],
      },
    });

    if (!invoice) {
      throw new AppError("INVOICE_NOT_FOUND", "Faktur tagihan tidak ditemukan.", 404);
    }

    return invoice;
  },

  /**
   * Simulate a Sandbox Payment completion.
   * Updates invoice status to PAID and activates the subscription for 30 days.
   */
  async simulateSandboxPayment(
    businessId: string,
    invoiceId: string,
    paymentMethod: string = "QRIS"
  ) {
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        businessId, // Strict tenant check
      },
    });

    if (!invoice) {
      throw new AppError("INVOICE_NOT_FOUND", "Faktur pembayaran tidak ditemukan.", 404);
    }

    if (invoice.status === "PAID") {
      return { invoice, alreadyPaid: true };
    }

    const now = new Date();
    // 30 days subscription duration
    const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          status: "PAID",
          paidAt: now,
          paymentMethod,
        },
      });

      await tx.business.update({
        where: { id: businessId },
        data: {
          subscriptionPlan: invoice.plan,
          subscriptionStatus: "ACTIVE",
          currentPeriodEnd: newPeriodEnd,
        },
      });

      return {
        invoice: updatedInvoice,
        alreadyPaid: false,
        newPlan: invoice.plan,
        periodEnd: newPeriodEnd,
      };
    });
  },

  /**
   * Process webhook notifications from payment provider (Midtrans / Xendit Sandbox format).
   */
  async processWebhook(payload: {
    invoiceNumber: string;
    transactionStatus: "settlement" | "capture" | "pending" | "expire" | "cancel" | "deny";
    paymentType?: string;
  }) {
    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber: payload.invoiceNumber },
    });

    if (!invoice) {
      throw new AppError("INVOICE_NOT_FOUND", "Faktur tagihan tidak ditemukan di sistem.", 404);
    }

    if (payload.transactionStatus === "settlement" || payload.transactionStatus === "capture") {
      const now = new Date();
      const newPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      await prisma.$transaction(async (tx) => {
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            status: "PAID",
            paidAt: now,
            paymentMethod: payload.paymentType || invoice.paymentMethod,
          },
        });

        await tx.business.update({
          where: { id: invoice.businessId },
          data: {
            subscriptionPlan: invoice.plan,
            subscriptionStatus: "ACTIVE",
            currentPeriodEnd: newPeriodEnd,
          },
        });
      });

      return { success: true, status: "PAID" };
    }

    if (
      payload.transactionStatus === "expire" ||
      payload.transactionStatus === "cancel" ||
      payload.transactionStatus === "deny"
    ) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: payload.transactionStatus === "expire" ? "EXPIRED" : "FAILED",
        },
      });

      return { success: true, status: "FAILED" };
    }

    return { success: true, status: "PENDING" };
  },
};
