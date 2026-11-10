"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  Lock,
  QrCode,
  Receipt,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  billingApi,
  type InvoiceDto,
} from "@/features/billing/services/billing.api";
import { formatDateId, formatRupiah } from "@/lib/format";
import {
  SUBSCRIPTION_PLANS,
  type SubscriptionPlanId,
} from "@/lib/subscription-plans";
import type { BusinessUsageSummary } from "@/server/services/subscription.service";

const PAYMENT_METHODS = [
  { id: "QRIS", name: "QRIS (GoPay, OVO, ShopeePay, Dana, BCA)", icon: QrCode },
  { id: "BCA_VA", name: "BCA Virtual Account", icon: CreditCard },
  { id: "MANDIRI_VA", name: "Mandiri Virtual Account", icon: CreditCard },
  { id: "BNI_VA", name: "BNI Virtual Account", icon: CreditCard },
  { id: "BRI_VA", name: "BRI Virtual Account", icon: CreditCard },
  { id: "CREDIT_CARD", name: "Kartu Kredit / Debit Online", icon: CreditCard },
];

export default function BillingPage() {
  const [subscription, setSubscription] = React.useState<BusinessUsageSummary | null>(null);
  const [invoices, setInvoices] = React.useState<InvoiceDto[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // Upgrade / Checkout Dialog state
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = React.useState<SubscriptionPlanId | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState("QRIS");
  const [isCreatingCheckout, setIsCreatingCheckout] = React.useState(false);
  const [activePendingInvoice, setActivePendingInvoice] = React.useState<InvoiceDto | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = React.useState(false);

  // Cancel dialog state
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);

  // Invoice Receipt Dialog state
  const [viewInvoice, setViewInvoice] = React.useState<InvoiceDto | null>(null);

  const loadBillingData = React.useCallback(async () => {
    try {
      const [sub, invs] = await Promise.all([
        billingApi.getSubscription(),
        billingApi.listInvoices(),
      ]);
      setSubscription(sub);
      setInvoices(invs);
    } catch (err) {
      console.error("Failed to load billing data:", err);
      toast.error("Gagal memuat data langganan & faktur.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [sub, invs] = await Promise.all([
          billingApi.getSubscription(),
          billingApi.listInvoices(),
        ]);
        if (!active) return;
        setSubscription(sub);
        setInvoices(invs);
      } catch (err) {
        console.error("Failed to load billing data:", err);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadBillingData();
    toast.success("Data langganan berhasil diperbarui.");
  };

  const handleOpenUpgrade = (planId: SubscriptionPlanId) => {
    setSelectedPlanForUpgrade(planId);
  };

  const handleCreateCheckout = async () => {
    if (!selectedPlanForUpgrade) return;
    setIsCreatingCheckout(true);
    try {
      const res = await billingApi.createCheckout(
        selectedPlanForUpgrade,
        selectedPaymentMethod
      );
      toast.success(res.message);
      setActivePendingInvoice(res.invoice);
      // Refresh invoice list
      const updatedInvoices = await billingApi.listInvoices();
      setInvoices(updatedInvoices);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membuat invoice.";
      toast.error(msg);
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  const handleSimulatePayment = async (invoiceId: string) => {
    setIsSimulatingPayment(true);
    try {
      const res = await billingApi.simulatePayment(invoiceId, selectedPaymentMethod);
      toast.success(
        res.alreadyPaid
          ? "Invoice ini sudah lunas sebelumnya."
          : "🎉 Pembayaran Sandbox Berhasil! Paket langganan Anda kini aktif 30 hari."
      );
      setActivePendingInvoice(null);
      setSelectedPlanForUpgrade(null);
      await loadBillingData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Simulasi pembayaran gagal.";
      toast.error(msg);
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    try {
      await billingApi.cancelSubscription();
      toast.success("Langganan Anda berhasil dibatalkan.");
      setShowCancelDialog(false);
      await loadBillingData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal membatalkan langganan.";
      toast.error(msg);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading || !subscription) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Langganan & Billing"
          description="Kelola paket langganan, kuota pemakaian, dan riwayat faktur tagihan."
        />
        <LoadingState variant="cards" count={3} />
        <LoadingState variant="table" count={3} />
      </div>
    );
  }

  const currentPlan = SUBSCRIPTION_PLANS[subscription.plan] || SUBSCRIPTION_PLANS.FREE_TRIAL;
  const isTrial = subscription.plan === "FREE_TRIAL";
  const isActive = subscription.status === "ACTIVE";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Langganan & Billing"
        description="Kelola paket langganan bisnis, pantau kuota pemakaian, dan akses riwayat faktur pembayaran."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Perbarui Status</span>
            </Button>
            <Link href="/pricing" target="_blank">
              <Button variant="ghost" size="sm" className="gap-1.5 text-slate-600">
                <span>Daftar Harga</span>
                <ExternalLink className="size-3.5" />
              </Button>
            </Link>
          </div>
        }
      />

      {/* Sandbox Environment Notification Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200/90 bg-amber-50/80 p-4 text-amber-900 shadow-2xs dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
        <ShieldCheck className="size-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <p className="font-semibold">Mode Pembayaran: Sandbox (Testing Simulator Aktif)</p>
          <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Semua transaksi di halaman ini diproses melalui gateway pengujian. Anda dapat menguji proses upgrade paket secara instan dengan metode pembayaran QRIS, Virtual Account, atau Kartu Kredit tanpa biaya nyata.
          </p>
        </div>
      </div>

      {/* Current Subscription Card */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Paket Aktif Saat Ini"
          description="Status dan rincian paket langganan BookEase Anda."
          className="lg:col-span-2"
          headerAction={
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold"
                    : isTrial
                    ? "bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                    : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 font-semibold"
                }
              >
                {subscription.status === "ACTIVE"
                  ? "Aktif"
                  : subscription.status === "TRIALING"
                  ? "Uji Coba Gratis"
                  : subscription.status === "PAST_DUE"
                  ? "Jatuh Tempo"
                  : subscription.status === "CANCELLED"
                  ? "Dibatalkan"
                  : "Kadaluarsa"}
              </Badge>
            </div>
          }
        >
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl bg-slate-50/90 border border-slate-200/80 p-4 dark:bg-slate-900/60 dark:border-slate-800">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Paket Langganan
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {subscription.planName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentPlan.description}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {subscription.priceFormatted}
                </p>
                {isTrial && subscription.trialDaysLeft > 0 && (
                  <p className="text-xs font-medium text-amber-600 dark:text-amber-400 flex items-center sm:justify-end gap-1 mt-1">
                    <Clock className="size-3.5" />
                    <span>{subscription.trialDaysLeft} hari tersisa masa trial</span>
                  </p>
                )}
                {subscription.currentPeriodEnd && !isTrial && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Perpanjangan: {formatDateId(subscription.currentPeriodEnd)}
                  </p>
                )}
              </div>
            </div>

            {/* Quota Progress Meters */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Pemakaian Kuota Sumber Daya
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Services Meter */}
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="size-3.5 text-indigo-500" />
                      Layanan Aktif
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {subscription.usage.services.used} /{" "}
                      {subscription.usage.services.limit === -1
                        ? "∞"
                        : subscription.usage.services.limit}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        subscription.usage.services.percentage >= 90
                          ? "bg-rose-500"
                          : "bg-indigo-600"
                      }`}
                      style={{ width: `${subscription.usage.services.percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {subscription.usage.services.limit === -1
                      ? "Tanpa batas layanan"
                      : `${100 - subscription.usage.services.percentage}% kuota tersisa`}
                  </p>
                </div>

                {/* Staff Meter */}
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Users className="size-3.5 text-indigo-500" />
                      Anggota Staf
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {subscription.usage.staff.used} /{" "}
                      {subscription.usage.staff.limit === -1
                        ? "∞"
                        : subscription.usage.staff.limit}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        subscription.usage.staff.percentage >= 90
                          ? "bg-rose-500"
                          : "bg-emerald-600"
                      }`}
                      style={{ width: `${subscription.usage.staff.percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {subscription.usage.staff.limit === -1
                      ? "Tanpa batas staf"
                      : `${100 - subscription.usage.staff.percentage}% kuota tersisa`}
                  </p>
                </div>

                {/* Bookings Meter */}
                <div className="rounded-xl border border-slate-200/80 p-3.5 bg-white dark:border-slate-800 dark:bg-slate-900/40 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="size-3.5 text-indigo-500" />
                      Reservasi Bulan Ini
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {subscription.usage.bookingsThisMonth.used} /{" "}
                      {subscription.usage.bookingsThisMonth.limit === -1
                        ? "∞"
                        : subscription.usage.bookingsThisMonth.limit}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        subscription.usage.bookingsThisMonth.percentage >= 90
                          ? "bg-rose-500"
                          : "bg-violet-600"
                      }`}
                      style={{
                        width: `${subscription.usage.bookingsThisMonth.percentage}%`,
                      }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Reset tiap awal bulan kalender
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                onClick={() => handleOpenUpgrade("PRO")}
                className="gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold shadow-xs"
              >
                <Zap className="size-4" />
                <span>Tingkatkan ke Pro Business</span>
              </Button>
              {isActive && (
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(true)}
                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-slate-200/80"
                >
                  Batalkan Langganan
                </Button>
              )}
            </div>
          </div>
        </SectionCard>

        {/* Benefits & Security Guarantee Card */}
        <SectionCard
          title="Keuntungan Langganan"
          description="Infrastruktur andal untuk kelancaran bisnis Anda."
        >
          <div className="space-y-4 pt-1 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <ShieldCheck className="size-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-900 dark:text-white">Tenant Isolation Penuh</p>
                <p className="text-slate-500 leading-relaxed">
                  Data pelanggan, jadwal booking, dan transaksi tersimpan aman di database terpisah secara logis.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                <CheckCircle2 className="size-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-900 dark:text-white">Tanpa Kontrak Terikat</p>
                <p className="text-slate-500 leading-relaxed">
                  Bebas batalkan kapan saja. Fitur tetap aktif hingga akhir periode tagihan Anda berakhir.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                <Lock className="size-4" />
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-slate-900 dark:text-white">Keamanan Transaksi Terjamin</p>
                <p className="text-slate-500 leading-relaxed">
                  Pembayaran diproses lewat payment gateway berlisensi Bank Indonesia dengan enkripsi TLS 1.3.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Pricing Upgrade Options Matrix */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Pilihan Paket Berlangganan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Pilih paket yang paling sesuai dengan skala pertumbuhan operasional bisnis Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {(["STARTER", "PRO", "ENTERPRISE"] as SubscriptionPlanId[]).map((planId) => {
            const plan = SUBSCRIPTION_PLANS[planId];
            const isCurrent = subscription.plan === planId;

            return (
              <div
                key={planId}
                className={`relative flex flex-col justify-between rounded-2xl border p-6 bg-white dark:bg-slate-900 transition-all ${
                  plan.popular
                    ? "border-indigo-600 shadow-lg ring-2 ring-indigo-600/30 dark:border-indigo-500"
                    : "border-slate-200/90 shadow-2xs hover:border-slate-300 dark:border-slate-800"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 px-3 py-0.5 text-[11px] font-bold text-white shadow-xs">
                    Paling Populer
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      {isCurrent && (
                        <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-300 text-[10px]">
                          Paket Anda
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                      {plan.priceFormatted}
                    </p>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                        <Check className="size-4 shrink-0 text-emerald-600 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  {isCurrent ? (
                    <Button
                      variant="outline"
                      className="w-full text-xs font-semibold"
                      disabled
                    >
                      Paket Sedang Aktif
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleOpenUpgrade(planId)}
                      className={`w-full text-xs font-semibold ${
                        plan.popular
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                          : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900"
                      }`}
                    >
                      Pilih {plan.name}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History Table */}
      <SectionCard
        title="Riwayat Faktur & Tagihan"
        description="Semua transaksi langganan dan bukti pembayaran tercatat secara transparan."
      >
        {invoices.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="Belum Ada Faktur"
            description="Faktur pembayaran akan dibuat secara otomatis saat Anda meningkatkan paket langganan."
          />
        ) : (
          <div className="overflow-x-auto -mx-6 -mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">No. Faktur</TableHead>
                  <TableHead>Paket</TableHead>
                  <TableHead>Total Tagihan</TableHead>
                  <TableHead>Metode</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {SUBSCRIPTION_PLANS[inv.plan]?.name || inv.plan}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatRupiah(inv.amount)}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {inv.paymentMethod || "QRIS"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDateId(inv.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          inv.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold text-[11px]"
                            : inv.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-300 font-semibold text-[11px]"
                            : "bg-rose-50 text-rose-700 border-rose-300 font-semibold text-[11px]"
                        }
                      >
                        {inv.status === "PAID"
                          ? "Lunas"
                          : inv.status === "PENDING"
                          ? "Menunggu"
                          : inv.status === "EXPIRED"
                          ? "Kadaluarsa"
                          : "Gagal"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {inv.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => {
                            setActivePendingInvoice(inv);
                            setSelectedPlanForUpgrade(inv.plan);
                          }}
                        >
                          Bayar Sekarang
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => setViewInvoice(inv)}
                      >
                        <Receipt className="size-3.5" />
                        <span>Faktur</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </SectionCard>

      {/* Upgrade / Checkout Modal */}
      <Dialog
        open={Boolean(selectedPlanForUpgrade)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPlanForUpgrade(null);
            setActivePendingInvoice(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="size-5 text-indigo-600" />
              <span>Checkout Langganan Sandbox</span>
            </DialogTitle>
            <DialogDescription>
              {activePendingInvoice
                ? `Selesaikan pembayaran faktur ${activePendingInvoice.invoiceNumber}`
                : `Konfirmasi peningkatan ke paket ${
                    selectedPlanForUpgrade
                      ? SUBSCRIPTION_PLANS[selectedPlanForUpgrade]?.name
                      : ""
                  }`}
            </DialogDescription>
          </DialogHeader>

          {selectedPlanForUpgrade && (
            <div className="space-y-4 py-2">
              {/* Order Summary */}
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 space-y-2 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Paket Langganan</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {SUBSCRIPTION_PLANS[selectedPlanForUpgrade]?.name}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Durasi</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    1 Bulan (30 Hari)
                  </span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between text-sm">
                  <span className="font-bold text-slate-900 dark:text-white">
                    Total Pembayaran
                  </span>
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    {formatRupiah(SUBSCRIPTION_PLANS[selectedPlanForUpgrade]?.price || 0)}
                  </span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pilih Saluran Pembayaran (Sandbox Gateway)
                </label>
                <Select
                  value={selectedPaymentMethod}
                  onValueChange={(val) => {
                    if (val) setSelectedPaymentMethod(val);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih saluran pembayaran" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sandbox simulated badge */}
              <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-xs text-indigo-800 dark:bg-indigo-950/60 dark:border-indigo-900 dark:text-indigo-300">
                <p className="font-semibold">Simulasi Instan Sandbox</p>
                <p className="text-[11px] opacity-90">
                  Klik &quot;Simulasikan Bayar Sukses&quot; di bawah untuk langsung menguji pengaktifan langganan tanpa kartu kredit nyata.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedPlanForUpgrade(null);
                setActivePendingInvoice(null);
              }}
              disabled={isCreatingCheckout || isSimulatingPayment}
            >
              Batal
            </Button>
            {activePendingInvoice ? (
              <Button
                onClick={() => handleSimulatePayment(activePendingInvoice.id)}
                disabled={isSimulatingPayment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {isSimulatingPayment ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="size-4 animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  "Simulasikan Bayar Sukses (Sandbox)"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCreateCheckout}
                disabled={isCreatingCheckout}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {isCreatingCheckout ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="size-4 animate-spin" />
                    Menerbitkan Invoice...
                  </span>
                ) : (
                  "Lanjutkan ke Sandbox Checkout"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Details / Printable Receipt Modal */}
      <Dialog open={Boolean(viewInvoice)} onOpenChange={(open) => !open && setViewInvoice(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Receipt className="size-5 text-indigo-600" />
                <span>Faktur Pembayaran Resmi</span>
              </span>
              {viewInvoice && (
                <Badge
                  variant="outline"
                  className={
                    viewInvoice.status === "PAID"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold"
                      : "bg-amber-50 text-amber-700 border-amber-300 font-semibold"
                  }
                >
                  {viewInvoice.status === "PAID" ? "LUNAS" : viewInvoice.status}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {viewInvoice && (
            <div className="space-y-5 text-xs">
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      BookEase Indonesia
                    </h4>
                    <p className="text-slate-400">Platform Reservasi Jasa SaaS</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      {viewInvoice.invoiceNumber}
                    </p>
                    <p className="text-slate-400">{formatDateId(viewInvoice.createdAt)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Deskripsi Item</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Langganan Paket {SUBSCRIPTION_PLANS[viewInvoice.plan]?.name || viewInvoice.plan} (30 Hari)
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                    <span className="text-slate-500">Gateway Pembayaran</span>
                    <span className="text-slate-800 dark:text-slate-200">
                      {viewInvoice.paymentProvider} ({viewInvoice.paymentMethod || "QRIS"})
                    </span>
                  </div>
                  {viewInvoice.paidAt && (
                    <div className="flex justify-between py-1 border-b border-slate-50 dark:border-slate-800/60">
                      <span className="text-slate-500">Tanggal Pelunasan</span>
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {formatDateId(viewInvoice.paidAt)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 text-sm font-extrabold">
                    <span className="text-slate-900 dark:text-white">Total Bayar</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      {formatRupiah(viewInvoice.amount)}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 text-center italic">
                Faktur ini merupakan dokumen sah yang diterbitkan oleh sistem penagihan BookEase Sandbox.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewInvoice(null)}>
              Tutup
            </Button>
            <Button
              variant="default"
              className="gap-2"
              onClick={() => {
                window.print();
              }}
            >
              <Download className="size-4" />
              <span>Cetak Faktur</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancellation Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <AlertTriangle className="size-5" />
              <span>Batalkan Langganan?</span>
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan langganan {subscription.planName}? Akun Anda akan kehilangan akses ke fitur Pro setelah masa aktif berakhir.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
              disabled={isCancelling}
            >
              Kembali
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={isCancelling}
            >
              {isCancelling ? "Membatalkan..." : "Ya, Batalkan Langganan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
