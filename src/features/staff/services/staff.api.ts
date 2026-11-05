import { apiClient } from "@/lib/api-client";
import type { StaffFormValues } from "@/lib/validations/staff.schema";
import type { Staff } from "@/types";

export const staffApi = {
  async listStaff(onlyActive = false): Promise<Staff[]> {
    const query = onlyActive ? "?active=true" : "";
    return apiClient.get<Staff[]>(`/api/v1/staff${query}`);
  },

  async createStaff(values: StaffFormValues): Promise<Staff> {
    return apiClient.post<Staff>("/api/v1/staff", values);
  },

  async updateStaff(id: string, values: StaffFormValues): Promise<Staff> {
    return apiClient.patch<Staff>(`/api/v1/staff/${id}`, values);
  },

  async toggleStaffActive(staff: Staff): Promise<Staff> {
    return apiClient.patch<Staff>(`/api/v1/staff/${staff.id}`, {
      name: staff.name,
      roleOrTitle: staff.roleOrTitle || "Staf",
      bio: staff.bio || "",
      isActive: !staff.isActive,
      serviceIds: staff.serviceIds,
    });
  },
};

