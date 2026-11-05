"use client";

import * as React from "react";
import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingState } from "@/components/shared/loading-state";
import { PageHeader } from "@/components/shared/page-header";
import { ServiceCard } from "@/features/services/components/service-card";
import { ServiceFormDialog } from "@/features/services/components/service-form-dialog";
import { serviceMockService } from "@/features/services/services/service.mock-service";
import { staffMockService } from "@/features/staff/services/staff.mock-service";
import type { ServiceFormValues } from "@/lib/validations/service.schema";
import type { Service, Staff } from "@/types";

export default function ServicesManagementPage() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [staffList, setStaffList] = React.useState<Staff[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

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
      serviceMockService.listServices(false),
      staffMockService.listStaff(false),
    ]);
    setServices(srvData);
    setStaffList(stfData);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    let active = true;
    Promise.all([
      serviceMockService.listServices(false),
      staffMockService.listStaff(false),
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

  const handleSaveService = async (values: ServiceFormValues) => {
    if (editingService) {
      await serviceMockService.updateService(editingService.id, values);
      toast.success("Layanan berhasil diperbarui!");
    } else {
      await serviceMockService.createService(values);
      toast.success("Layanan baru berhasil ditambahkan!");
    }
    await loadAll();
  };

  const handleToggleActive = async (service: Service) => {
    const updated = await serviceMockService.toggleServiceActive(service.id);
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
    await serviceMockService.deleteService(deletingService.id);
    toast.success(`Layanan "${deletingService.name}" berhasil dihapus.`);
    setIsDeleting(false);
    setDeletingService(null);
    await loadAll();
  };

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
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {services.map((srv) => (
            <ServiceCard
              key={srv.id}
              service={srv}
              staffList={staffList}
              onEdit={handleOpenEdit}
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
