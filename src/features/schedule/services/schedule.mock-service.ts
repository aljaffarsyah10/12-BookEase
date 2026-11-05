/**
 * TEMPORARY PHASE 5 MOCK SERVICE — DO NOT USE IN PRODUCTION
 * Replace with `/api/v1/schedule` in Phase 7.
 */
import { INITIAL_OPERATING_HOURS_MOCK } from "@/features/schedule/mocks/schedule.mock";
import type { OperatingHourItemValues } from "@/lib/validations/schedule.schema";
import type { OperatingHour } from "@/types";

const STORAGE_KEY = "bookease_mock_schedule_v1";

function loadScheduleState(): OperatingHour[] {
  if (typeof window === "undefined") {
    return [...INITIAL_OPERATING_HOURS_MOCK];
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as OperatingHour[];
  } catch {
    // ignore storage errors
  }
  return [...INITIAL_OPERATING_HOURS_MOCK];
}

function saveScheduleState(hours: OperatingHour[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(hours));
  } catch {
    // ignore storage errors
  }
}

export const scheduleMockService = {
  async getSchedule(): Promise<OperatingHour[]> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return loadScheduleState();
  },

  async updateSchedule(
    items: OperatingHourItemValues[]
  ): Promise<OperatingHour[]> {
    await new Promise((resolve) => setTimeout(resolve, 320));
    const current = loadScheduleState();
    const updated = items.map((item) => {
      const existing = current.find((c) => c.dayOfWeek === item.dayOfWeek);
      return {
        id: existing?.id ?? `oph_${item.dayOfWeek}`,
        businessId: "biz_glow_01",
        dayOfWeek: item.dayOfWeek,
        openTime: item.openTime,
        closeTime: item.closeTime,
        isClosed: item.isClosed,
      };
    });
    saveScheduleState(updated);
    return updated;
  },
};

