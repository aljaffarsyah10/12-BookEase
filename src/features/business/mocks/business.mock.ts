/**
 * TEMPORARY PHASE 5 MOCK DATA — DO NOT USE IN PRODUCTION
 * Will be replaced by `/api/v1/business` & `/api/v1/businesses/[slug]` in Phase 7.
 */
import { BUSINESS_CATEGORIES } from "@/constants/business";
import type { Business } from "@/types";

export { BUSINESS_CATEGORIES };

export const INITIAL_BUSINESS_MOCK: Business = {
  id: "biz_glow_01",
  name: "Glow Beauty Studio",
  slug: "glow-beauty-studio",
  category: "Beauty & Salon",
  description:
    "Studio perawatan kulit wajah, rambut, dan relaksasi profesional di pusat kota Jakarta dengan terapis berpengalaman.",
  address: "Jl. Jenderal Sudirman No. 45, Senayan, Jakarta Selatan",
  phone: "+6281234567890",
  timezone: "Asia/Jakarta",
  bufferTimeMinutes: 10,
};

