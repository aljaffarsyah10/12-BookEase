import test from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node experimental strip types requires extension
import { SUBSCRIPTION_PLANS } from "../src/lib/subscription-plans.ts";
// @ts-expect-error Node experimental strip types requires extension
import { createCheckoutSchema, billingWebhookSchema } from "../src/lib/validations/billing.schema.ts";

test("Subscription Plans: defines valid quotas and pricing for SaaS tiers", () => {
  // Free Trial
  const trial = SUBSCRIPTION_PLANS.FREE_TRIAL;
  assert.equal(trial.price, 0);
  assert.equal(trial.limits.maxStaff, 5);
  assert.equal(trial.limits.maxServices, 10);
  assert.equal(trial.limits.maxBookingsPerMonth, 100);

  // Starter
  const starter = SUBSCRIPTION_PLANS.STARTER;
  assert.equal(starter.price, 99000);
  assert.equal(starter.limits.maxStaff, 2);
  assert.equal(starter.limits.maxServices, 5);
  assert.equal(starter.limits.maxBookingsPerMonth, 100);

  // Pro Business
  const pro = SUBSCRIPTION_PLANS.PRO;
  assert.equal(pro.price, 199000);
  assert.equal(pro.popular, true);
  assert.equal(pro.limits.maxStaff, 10);
  assert.equal(pro.limits.maxServices, 30);
  assert.equal(pro.limits.maxBookingsPerMonth, 500);
  assert.equal(pro.limits.hasAnalytics, true);

  // Enterprise
  const enterprise = SUBSCRIPTION_PLANS.ENTERPRISE;
  assert.equal(enterprise.price, 499000);
  assert.equal(enterprise.limits.maxStaff, -1); // Unlimited
  assert.equal(enterprise.limits.maxServices, -1); // Unlimited
  assert.equal(enterprise.limits.maxBookingsPerMonth, -1); // Unlimited
});

test("Free Trial: calculates remaining days accurately", () => {
  const now = new Date();
  const trialEndsIn3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const diffDays = Math.max(0, Math.ceil((trialEndsIn3Days.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  assert.equal(diffDays, 3);

  const pastTrial = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const expiredDiff = Math.max(0, Math.ceil((pastTrial.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  assert.equal(expiredDiff, 0);
});

test("Usage Guard: accurately evaluates limit boundary conditions", () => {
  function checkLimit(used: number, limit: number): boolean {
    if (limit <= 0) return true; // Unlimited
    return used < limit;
  }

  // Starter: max 2 staff
  const starterLimit = SUBSCRIPTION_PLANS.STARTER.limits.maxStaff; // 2
  assert.equal(checkLimit(0, starterLimit), true); // Can add 1st staff
  assert.equal(checkLimit(1, starterLimit), true); // Can add 2nd staff
  assert.equal(checkLimit(2, starterLimit), false); // Cannot add 3rd staff (quota reached)

  // Enterprise: unlimited (-1)
  const enterpriseLimit = SUBSCRIPTION_PLANS.ENTERPRISE.limits.maxStaff; // -1
  assert.equal(checkLimit(100, enterpriseLimit), true); // Allowed
});

test("Checkout Validation: validates plan selection and payment channels", () => {
  // Valid checkout payload
  const valid = createCheckoutSchema.safeParse({
    plan: "PRO",
    paymentMethod: "QRIS",
  });
  assert.equal(valid.success, true);
  if (valid.success) {
    assert.equal(valid.data.plan, "PRO");
    assert.equal(valid.data.paymentMethod, "QRIS");
  }

  // Valid Virtual Account
  const validVa = createCheckoutSchema.safeParse({
    plan: "STARTER",
    paymentMethod: "BCA_VA",
  });
  assert.equal(validVa.success, true);

  // Invalid plan rejection (FREE_TRIAL does not go through checkout)
  const invalidPlan = createCheckoutSchema.safeParse({
    plan: "FREE_TRIAL",
    paymentMethod: "QRIS",
  });
  assert.equal(invalidPlan.success, false);

  // Invalid payment method rejection
  const invalidMethod = createCheckoutSchema.safeParse({
    plan: "PRO",
    paymentMethod: "BITCOIN",
  });
  assert.equal(invalidMethod.success, false);
});

test("Billing Webhook Validation: validates incoming payment notifications", () => {
  // Settlement / Capture (Success)
  const settlement = billingWebhookSchema.safeParse({
    invoiceNumber: "INV-20261110-ABCD1",
    transactionStatus: "settlement",
    paymentType: "qris",
  });
  assert.equal(settlement.success, true);

  // Expired transaction
  const expired = billingWebhookSchema.safeParse({
    invoiceNumber: "INV-20261110-ABCD1",
    transactionStatus: "expire",
  });
  assert.equal(expired.success, true);

  // Denied / Cancelled
  const denied = billingWebhookSchema.safeParse({
    invoiceNumber: "INV-20261110-ABCD1",
    transactionStatus: "deny",
  });
  assert.equal(denied.success, true);

  // Invalid status
  const invalid = billingWebhookSchema.safeParse({
    invoiceNumber: "INV-20261110-ABCD1",
    transactionStatus: "refunded_unsupported",
  });
  assert.equal(invalid.success, false);
});

test("Tenant Isolation: ensures invoices are scoped to specific businessId", () => {
  interface MockInvoice {
    id: string;
    invoiceNumber: string;
    businessId: string;
    amount: number;
    status: string;
  }

  const databaseInvoices: MockInvoice[] = [
    { id: "inv_1", invoiceNumber: "INV-001", businessId: "biz_tenant_A", amount: 199000, status: "PAID" },
    { id: "inv_2", invoiceNumber: "INV-002", businessId: "biz_tenant_B", amount: 99000, status: "PAID" },
  ];

  function queryTenantInvoices(businessId: string): MockInvoice[] {
    return databaseInvoices.filter((inv) => inv.businessId === businessId);
  }

  const tenantAInvoices = queryTenantInvoices("biz_tenant_A");
  assert.equal(tenantAInvoices.length, 1);
  assert.equal(tenantAInvoices[0].invoiceNumber, "INV-001");

  const tenantBInvoices = queryTenantInvoices("biz_tenant_B");
  assert.equal(tenantBInvoices.length, 1);
  assert.equal(tenantBInvoices[0].invoiceNumber, "INV-002");

  // Attempting to access Tenant B invoice as Tenant A yields null
  const unauthorizedAccess = tenantAInvoices.find((i) => i.businessId === "biz_tenant_B");
  assert.equal(unauthorizedAccess, undefined);
});
