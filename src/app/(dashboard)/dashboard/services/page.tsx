"use client";

import * as React from "react";
import {
  ArrowUpDown,
  CheckCircle2,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  XCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { ServiceCard } from "@/features/services/components/service-card";
import { serviceApi } from "@/features/services/services/service.api";
import { staffApi } from "@/features/staff/services/staff.api";
import type { ServiceFormValues } from "@/lib/validations/service.schema";
import type { Service, Staff } from "@/types";

const ServiceFormDialog = dynamic(
  () =>
    import("@/features/services/components/service-form-dialog").then(
      (m) => m.ServiceFormDialog
    ),
  { ssr: false }
);

type ServiceSortOption =
  | "name_asc"
  | "name_desc"
  | "price_asc"
  | "price_desc"
  | "duration_asc"
  | "duration_desc";

export default function ServicesManagementPage() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [staffList, setStaffList] = React.useState<Staff[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Search, Filter & Sort
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [sortBy, setSortBy] = React.useState<ServiceSortOption>("name_asc");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<Service | null>(
    null,
  );
  const [deletingService, setDeletingService] = React.useState<Service | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = React.useState(false);

  const loadAll = React.useCallback(async () => {
    const [srvData, stfData] = await Promise.all([
      serviceApi.listServices(false),
      staffApi.listStaff(false),
    ]);
    setServices(srvData);
    setStaffList(stfData);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      serviceApi.listServices(false),
      staffApi.listStaff(false),
    ]).then(([srvData, stfData]) => {
      if (active) {
        setServices(srvData);
        setStaffList(stfData);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormOpen(true);
  };

  const handleDuplicate = (service: Service) => {
    setEditingService({
      ...service,
      id: "", // empty id marks it for new creation
      name: `[Salin] ${service.name}`,
    });
    setFormOpen(true);
    toast.info(`Menduplikasi layanan "${service.name}". Silakan sesuaikan lalu simpan.`);
  };

  const handleSaveService = async (values: ServiceFormValues) => {
    if (editingService && editingService.id) {
      await serviceApi.updateService(editingService.id, values);
      toast.success("Layanan berhasil diperbarui!");
    } else {
      await serviceApi.createService(values);
      toast.success("Layanan baru berhasil ditambahkan!");
    }
    await loadAll();
  };

  const handleToggleActive = async (service: Service) => {
    const updated = await serviceApi.toggleServiceActive(service);
    toast.success(
      updated.isActive
        ? `Layanan "${updated.name}" diaktifkan.`
        : `Layanan "${updated.name}" dinonaktifkan dari halaman publik.`,
    );
    await loadAll();
  };

  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    await serviceApi.deleteService(deletingService.id);
    toast.success(`Layanan "${deletingService.name}" berhasil dihapus.`);
    setIsDeleting(false);
    setDeletingService(null);
    await loadAll();
  };

  // Filtered & Sorted Services
  const filteredServices = React.useMemo(() => {
    return services
      .filter((srv) => {
        if (statusFilter === "ACTIVE" && !srv.isActive) return false;
        if (statusFilter === "INACTIVE" && srv.isActive) return false;
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchName = srv.name.toLowerCase().includes(q);
          const matchDesc = srv.description?.toLowerCase().includes(q) ?? false;
          if (!matchName && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name_asc":
            return a.name.localeCompare(b.name);
          case "name_desc":
            return b.name.localeCompare(a.name);
          case "price_asc":
            return a.price - b.price;
          case "price_desc":
            return b.price - a.price;
          case "duration_asc":
            return a.durationMinutes - b.durationMinutes;
          case "duration_desc":
            return b.durationMinutes - a.durationMinutes;
          default:
            return 0;
        }
      });
  }, [services, search, statusFilter, sortBy]);

  const totalActive = services.filter((s) => s.isActive).length;
  const totalInactive = services.length - totalActive;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Layanan (Services)"
        description="Atur katalog layanan, durasi pengerjaan, harga, dan penugasan staf."
        actions={
          <Button
            onClick={handleOpenAdd}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="size-4" />
            <span>Tambah Layanan</span>
          </Button>
        }
      />

      {/* Quick Summary Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setStatusFilter("ALL")}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            statusFilter === "ALL"
              ? "bg-indigo-600 text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          Semua Layanan ({services.length})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("ACTIVE")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            statusFilter === "ACTIVE"
              ? "bg-emerald-600 text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <CheckCircle2 className="size-3 text-emerald-500" />
          Aktif ({totalActive})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("INACTIVE")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
            statusFilter === "INACTIVE"
              ? "bg-slate-700 text-white shadow-2xs"
              : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          }`}
        >
          <XCircle className="size-3 text-slate-400" />
          Nonaktif ({totalInactive})
        </button>
      </div>

      {/* Search & Sort Controls */}
      <SectionCard contentClassName="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="relative sm:col-span-7">
            <Search className="pointer-events-none absolute top-3 left-3.5 size-4 text-slate-400" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau deskripsi layanan..."
              className="pl-10 h-10 text-sm"
            />
          </div>

          <div className="sm:col-span-4">
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute top-3 left-3.5 size-4 text-slate-400" />
              <select
                aria-label="Urutkan Layanan"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as ServiceSortOption)}
                className="h-10 w-full pl-10 pr-3.5 rounded-lg border border-slate-200/90 bg-white text-xs sm:text-sm font-medium text-slate-800 shadow-2xs transition-colors focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 focus:outline-none"
              >
                <option value="name_asc">Nama (A – Z)</option>
                <option value="name_desc">Nama (Z – A)</option>
                <option value="price_asc">Harga Terendah</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="duration_asc">Durasi Tercepat</option>
                <option value="duration_desc">Durasi Terlama</option>
              </select>
            </div>
          </div>

          <div className="sm:col-span-1 flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setSortBy("name_asc");
              }}
              title="Reset Filter"
              className="w-full sm:w-auto h-10 px-3 text-slate-600 hover:text-slate-900"
            >
              <RotateCcw className="size-4" />
              <span className="sm:hidden ml-2 text-xs">Reset</span>
            </Button>
          </div>
        </div>
      </SectionCard>

      {isLoading ? (
        <LoadingState variant="cards" count={4} />
      ) : services.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Belum Ada Layanan Terdaftar"
          description="Tambahkan layanan pertama Anda beserta harga dan durasinya agar pelanggan dapat mulai melakukan reservasi."
          action={
            <Button
              onClick={handleOpenAdd}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="size-4" />
              <span>Tambah Layanan Pertama</span>
            </Button>
          }
        />
      ) : filteredServices.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Tidak Ada Layanan yang Cocok"
          description="Tidak ditemukan layanan dengan kriteria pencarian atau status yang dipilih."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
            >
              Tampilkan Semua Layanan
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredServices.map((srv) => (
            <ServiceCard
              key={srv.id}
              service={srv}
              staffList={staffList}
              onEdit={handleOpenEdit}
              onDuplicate={handleDuplicate}
              onToggleActive={handleToggleActive}
              onDelete={setDeletingService}
            />
          ))}
        </div>
      )}

      <ServiceFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingService}
        staffList={staffList}
        onSubmitService={handleSaveService}
      />

      <ConfirmDialog
        open={!!deletingService}
        onOpenChange={(open) => !open && setDeletingService(null)}
        title="Hapus Layanan?"
        description={`Apakah Anda yakin ingin menghapus layanan "${deletingService?.name}"? Anda juga dapat memilih menonaktifkan layanan jika hanya ingin menyembunyikannya sementara.`}
        confirmLabel="Ya, Hapus Layanan"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
