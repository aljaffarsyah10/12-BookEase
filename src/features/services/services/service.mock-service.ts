/**
 * TEMPORARY PHASE 5 MOCK SERVICE — DO NOT USE IN PRODUCTION
 * Replace with `/api/v1/services` and `/api/v1/services/[id]` in Phase 7.
 */
import { INITIAL_SERVICES_MOCK } from "@/features/services/mocks/service.mock";
import type { ServiceFormValues } from "@/lib/validations/service.schema";
import type { Service } from "@/types";

const STORAGE_KEY = "bookease_mock_services_v1";

function loadServicesState(): Service[] {
  if (typeof window === "undefined") {
    return [...INITIAL_SERVICES_MOCK];
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Service[];
  } catch {
    // ignore storage errors
  }
  return [...INITIAL_SERVICES_MOCK];
}

function saveServicesState(services: Service[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(services));
  } catch {
    // ignore storage errors
  }
}

export const serviceMockService = {
  async listServices(onlyActive = false): Promise<Service[]> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    const all = loadServicesState();
    return onlyActive ? all.filter((s) => s.isActive) : all;
  },

  async createService(payload: ServiceFormValues): Promise<Service> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const all = loadServicesState();
    const created: Service = {
      id: `srv_${Date.now().toString(36)}`,
      businessId: "biz_glow_01",
      name: payload.name,
      description: payload.description || null,
      price: payload.price,
      durationMinutes: payload.durationMinutes,
      isActive: payload.isActive,
      staffIds: payload.staffIds,
    };
    const next = [created, ...all];
    saveServicesState(next);
    return created;
  },

  async updateService(
    id: string,
    payload: ServiceFormValues
  ): Promise<Service> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const all = loadServicesState();
    const idx = all.findIndex((item) => item.id === id);
    if (idx === -1) {
      throw new Error("Layanan tidak ditemukan");
    }
    const updated: Service = {
      ...all[idx],
      name: payload.name,
      description: payload.description || null,
      price: payload.price,
      durationMinutes: payload.durationMinutes,
      isActive: payload.isActive,
      staffIds: payload.staffIds,
    };
    all[idx] = updated;
    saveServicesState(all);
    return updated;
  },

  async toggleServiceActive(id: string): Promise<Service> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const all = loadServicesState();
    const idx = all.findIndex((item) => item.id === id);
    if (idx === -1) {
      throw new Error("Layanan tidak ditemukan");
    }
    const updated: Service = {
      ...all[idx],
      isActive: !all[idx].isActive,
    };
    all[idx] = updated;
    saveServicesState(all);
    return updated;
  },

  async deleteService(id: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const all = loadServicesState();
    saveServicesState(all.filter((item) => item.id !== id));
  },
};

