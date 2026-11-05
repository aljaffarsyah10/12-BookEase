/**
 * TEMPORARY PHASE 5 MOCK SERVICE — DO NOT USE IN PRODUCTION
 * Replace with fetch('/api/v1/business') and fetch('/api/v1/businesses/[slug]') in Phase 7.
 */
import { INITIAL_BUSINESS_MOCK } from "@/features/business/mocks/business.mock";
import type { BusinessProfileFormValues } from "@/lib/validations/business.schema";
import type { Business } from "@/types";

const STORAGE_KEY = "bookease_mock_business_v1";

function loadBusinessState(): Business {
  if (typeof window === "undefined") {
    return { ...INITIAL_BUSINESS_MOCK };
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Business;
  } catch {
    // ignore storage errors
  }
  return { ...INITIAL_BUSINESS_MOCK };
}

function saveBusinessState(business: Business): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(business));
  } catch {
    // ignore storage errors
  }
}

export const businessMockService = {
  async getBusiness(): Promise<Business> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    return loadBusinessState();
  },

  async getPublicBusinessBySlug(slug: string): Promise<Business | null> {
    await new Promise((resolve) => setTimeout(resolve, 180));
    const current = loadBusinessState();
    if (current.slug === slug || slug === INITIAL_BUSINESS_MOCK.slug) {
      return current;
    }
    return null;
  },

  async updateBusiness(payload: BusinessProfileFormValues): Promise<Business> {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const current = loadBusinessState();
    const updated: Business = {
      ...current,
      name: payload.name,
      slug: payload.slug,
      category: payload.category,
      description: payload.description || null,
      phone: payload.phone || null,
      address: payload.address || null,
      timezone: payload.timezone,
      bufferTimeMinutes: payload.bufferTimeMinutes,
    };
    saveBusinessState(updated);
    return updated;
  },
};

