"use client";

import * as React from "react";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { serviceApi } from "@/features/services/services/service.api";
import { StaffCard } from "@/features/staff/components/staff-card";
import { StaffFormDialog } from "@/features/staff/components/staff-form-dialog";
import { staffApi } from "@/features/staff/services/staff.api";
import type { StaffFormValues } from "@/lib/validations/staff.schema";
import type { Service, Staff } from "@/types";

export default function StaffManagementPage() {
  const [staffList, setStaffList] = React.useState<Staff[]>([]);
  const [services, setServices] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {staffList.map((st) => (
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
