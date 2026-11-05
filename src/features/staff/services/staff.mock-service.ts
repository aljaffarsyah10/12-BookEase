/**
 * TEMPORARY PHASE 5 MOCK SERVICE — DO NOT USE IN PRODUCTION
 * Replace with `/api/v1/staff` and `/api/v1/staff/[id]` in Phase 7.
 */
import { INITIAL_STAFF_MOCK } from "@/features/staff/mocks/staff.mock";
import type { StaffFormValues } from "@/lib/validations/staff.schema";
import type { Staff } from "@/types";

const STORAGE_KEY = "bookease_mock_staff_v1";

function loadStaffState(): Staff[] {
  if (typeof window === "undefined") {
    return [...INITIAL_STAFF_MOCK];
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Staff[];
  } catch {
    // ignore storage errors
  }
  return [...INITIAL_STAFF_MOCK];
}

function saveStaffState(staffList: Staff[]): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(staffList));
  } catch {
    // ignore storage errors
  }
}

export const staffMockService = {
  async listStaff(onlyActive = false): Promise<Staff[]> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    const all = loadStaffState();
    return onlyActive ? all.filter((s) => s.isActive) : all;
  },

  async createStaff(payload: StaffFormValues): Promise<Staff> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const all = loadStaffState();
    const created: Staff = {
      id: `stf_${Date.now().toString(36)}`,
      businessId: "biz_glow_01",
      name: payload.name,
      roleOrTitle: payload.roleOrTitle,
      bio: payload.bio || null,
      isActive: payload.isActive,
      serviceIds: payload.serviceIds,
    };
    const next = [...all, created];
    saveStaffState(next);
    return created;
  },

  async updateStaff(id: string, payload: StaffFormValues): Promise<Staff> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const all = loadStaffState();
    const idx = all.findIndex((item) => item.id === id);
    if (idx === -1) {
      throw new Error("Staf tidak ditemukan");
    }
    const updated: Staff = {
      ...all[idx],
      name: payload.name,
      roleOrTitle: payload.roleOrTitle,
      bio: payload.bio || null,
      isActive: payload.isActive,
      serviceIds: payload.serviceIds,
    };
    all[idx] = updated;
    saveStaffState(all);
    return updated;
  },

  async toggleStaffActive(id: string): Promise<Staff> {
    await new Promise((resolve) => setTimeout(resolve, 250));
    const all = loadStaffState();
    const idx = all.findIndex((item) => item.id === id);
    if (idx === -1) {
      throw new Error("Staf tidak ditemukan");
    }
    const updated: Staff = {
      ...all[idx],
      isActive: !all[idx].isActive,
    };
    all[idx] = updated;
    saveStaffState(all);
    return updated;
  },
};

