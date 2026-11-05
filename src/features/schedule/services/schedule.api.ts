import { apiClient } from "@/lib/api-client";
import type { ScheduleFormValues } from "@/lib/validations/schedule.schema";
import type { OperatingHour } from "@/types";

export const scheduleApi = {
  async getSchedule(): Promise<OperatingHour[]> {
    return apiClient.get<OperatingHour[]>("/api/v1/schedule");
  },

  async saveSchedule(
    values: ScheduleFormValues
  ): Promise<{ bufferTimeMinutes: number; schedule: OperatingHour[] }> {
    return apiClient.put<{ bufferTimeMinutes: number; schedule: OperatingHour[] }>(
      "/api/v1/schedule",
      values
    );
  },
};

