import { apiClient } from "@/lib/api-client";
import type { ServiceFormValues } from "@/lib/validations/service.schema";
import type { Service } from "@/types";

export const serviceApi = {
  async listServices(onlyActive = false): Promise<Service[]> {
    const query = onlyActive ? "?active=true" : "";
    return apiClient.get<Service[]>(`/api/v1/services${query}`);
  },

  async createService(values: ServiceFormValues): Promise<Service> {
    return apiClient.post<Service>("/api/v1/services", values);
  },

  async updateService(id: string, values: ServiceFormValues): Promise<Service> {
    return apiClient.patch<Service>(`/api/v1/services/${id}`, values);
  },

  async toggleServiceActive(service: Service): Promise<Service> {
    return apiClient.patch<Service>(`/api/v1/services/${service.id}`, {
      name: service.name,
      description: service.description || "",
      price: service.price,
      durationMinutes: service.durationMinutes,
      isActive: !service.isActive,
      staffIds: service.staffIds,
    });
  },

  async deleteService(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/services/${id}`);
  },
};

