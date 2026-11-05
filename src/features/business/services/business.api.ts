import { apiClient } from "@/lib/api-client";
import type { BusinessProfileFormValues } from "@/lib/validations/business.schema";
import type { Business, OperatingHour, Service, Staff } from "@/types";

export interface PublicBusinessProfile extends Business {
  services: Service[];
  staff: Staff[];
  operatingHours: OperatingHour[];
}

export const businessApi = {
  async getBusiness(): Promise<Business> {
    return apiClient.get<Business>("/api/v1/business");
  },

  async updateBusiness(values: BusinessProfileFormValues): Promise<Business> {
    return apiClient.patch<Business>("/api/v1/business", values);
  },

  async getPublicBySlug(slug: string): Promise<PublicBusinessProfile> {
    return apiClient.get<PublicBusinessProfile>(`/api/v1/businesses/${slug}`);
  },
};

