import { apiClient } from "@/lib/api-client";
import type { SubscriptionPlanId } from "@/lib/subscription-plans";
import type { BusinessUsageSummary } from "@/server/services/subscription.service";

export interface InvoiceDto {
  id: string;
  invoiceNumber: string;
  businessId: string;
  plan: SubscriptionPlanId;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED";
  paymentProvider: string;
  paymentMethod: string | null;
  paymentUrl: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutResponse {
  invoice: InvoiceDto;
  checkoutUrl: string;
  isSandbox: boolean;
  message: string;
}

export const billingApi = {
  async getSubscription(): Promise<BusinessUsageSummary> {
    return apiClient.get<BusinessUsageSummary>("/api/v1/billing/subscription");
  },

  async createCheckout(
    plan: SubscriptionPlanId,
    paymentMethod: string = "QRIS"
  ): Promise<CheckoutResponse> {
    return apiClient.post<CheckoutResponse>("/api/v1/billing/checkout", {
      plan,
      paymentMethod,
    });
  },

  async listInvoices(): Promise<InvoiceDto[]> {
    return apiClient.get<InvoiceDto[]>("/api/v1/billing/invoices");
  },

  async simulatePayment(
    invoiceId: string,
    paymentMethod: string = "QRIS"
  ): Promise<{ invoice: InvoiceDto; alreadyPaid: boolean; newPlan?: string; periodEnd?: string }> {
    return apiClient.post("/api/v1/billing/simulate", {
      invoiceId,
      paymentMethod,
    });
  },

  async cancelSubscription(): Promise<void> {
    return apiClient.delete<void>("/api/v1/billing/subscription");
  },
};
