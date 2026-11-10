"use client";

import * as React from "react";
import {
  CheckCircle2,
  Plus,
  RotateCcw,
  Search,
  Sparkles,
  Users,
  XCircle,
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCard } from "@/components/shared/section-card";
import { serviceApi } from "@/features/services/services/service.api";
import { StaffCard } from "@/features/staff/components/staff-card";
import { staffApi } from "@/features/staff/services/staff.api";
import type { StaffFormValues } from "@/lib/validations/staff.schema";
import type { Service, Staff } from "@/types";

const StaffFormDialog = dynamic(
  () =>
    import("@/features/staff/components/staff-form-dialog").then(
      (m) => m.StaffFormDialog
    ),
  { ssr: false }
);

export default function StaffManagementPage() {
  const [staffList, setStaffList] = React.useState<Staff[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Search & Filters
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  const [selectedServiceId, setSelectedServiceId] = React.useState<string>("ALL");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<Staff | null>(null);

  const loadAll = React.useCallback(async () => {
    const [stfData, srvData] = await Promise.all([
      staffApi.listStaff(false),
      serviceApi.listServices(false),
    ]);
    setStaffList(stfData);
    setServices(srvData);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      staffApi.listStaff(false),
      serviceApi.listServices(false),
    ]).then(([stfData, srvData]) => {
      if (active) {
        setStaffList(stfData);
        setServices(srvData);
        setIsLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleOpenAdd = () => {
    setEditingStaff(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormOpen(true);
  };

  const handleSaveStaff = async (values: StaffFormValues) => {
    if (editingStaff) {
      await staffApi.updateStaff(editingStaff.id, values);
      toast.success("Data staf berhasil diperbarui!");
    } else {
      await staffApi.createStaff(values);
      toast.success("Staf baru berhasil ditambahkan!");
    }
    await loadAll();
  };

  const handleToggleActive = async (staff: Staff) => {
    const updated = await staffApi.toggleStaffActive(staff);
    toast.success(
      updated.isActive
        ? `Staf "${updated.name}" diaktifkan kembali.`
        : `Staf "${updated.name}" dinonaktifkan dari jadwal booking baru.`,
    );
    await loadAll();
  };

  // Filter staff based on search, status, and assigned service
  const filteredStaff = React.useMemo(() => {
    return staffList.filter((st) => {
      if (statusFilter === "ACTIVE" && !st.isActive) return false;
      if (statusFilter === "INACTIVE" && st.isActive) return false;

      if (selectedServiceId !== "ALL") {
        const handlesService =
          st.serviceIds.includes(selectedServiceId) ||
          services.some(
            (srv) =>
              srv.id === selectedServiceId && srv.staffIds.includes(st.id)
          );
        if (!handlesService) return false;
      }

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = st.name.toLowerCase().includes(q);
        const matchRole = st.roleOrTitle?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchRole) return false;
      }

      return true;
    });
  }, [staffList, services, search, statusFilter, selectedServiceId]);

  const totalActive = staffList.filter((s) => s.isActive).length;
  const totalInactive = staffList.length - totalActive;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manajemen Staf (Staff)"
        description="Kelola anggota tim atau penyedia layanan serta hubungkan dengan layanan yang ditangani."
        actions={
          <Button
            onClick={handleOpenAdd}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="size-4" />
            <span>Tambah Staf</span>
          </Button>
        }
      />

      {/* Summary Filter Pills */}
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
          Semua Staf ({staffList.length})
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

      {/* Search & Service Filter */}
      <SectionCard contentClassName="p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
          <div className="relative sm:col-span-6">
            <Search className="pointer-events-none absolute top-3 left-3.5 size-4 text-slate-400" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau posisi staf..."
              className="pl-10 h-10 text-sm"
            />
          </div>

          <div className="sm:col-span-5">
            <select
              aria-label="Filter berdasarkan Layanan"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200/90 bg-white px-3.5 text-xs sm:text-sm font-medium text-slate-800 shadow-2xs transition-colors focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/10 focus:outline-none"
            >
              <option value="ALL">Semua Layanan Ditangani</option>
              {services.map((srv) => (
                <option key={srv.id} value={srv.id}>
                  Layanan: {srv.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-1 flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setSelectedServiceId("ALL");
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
      ) : staffList.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Belum Ada Staf Terdaftar"
          description="Tambahkan anggota staf atau penyedia jasa untuk mulai mengalokasikan jadwal layanan."
          action={
            <Button
              onClick={handleOpenAdd}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="size-4" />
              <span>Tambah Staf Pertama</span>
            </Button>
          }
        />
      ) : filteredStaff.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Tidak Ada Staf yang Cocok"
          description="Tidak ditemukan anggota tim dengan kata kunci atau filter layanan yang dipilih."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setSelectedServiceId("ALL");
              }}
            >
              Tampilkan Semua Staf
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredStaff.map((st) => (
            <StaffCard
              key={st.id}
              staff={st}
              services={services}
              onEdit={handleOpenEdit}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      <StaffFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialData={editingStaff}
        services={services}
        onSubmitStaff={handleSaveStaff}
      />
    </div>
  );
}
