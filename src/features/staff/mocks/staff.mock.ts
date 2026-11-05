/**
 * TEMPORARY PHASE 5 MOCK DATA — DO NOT USE IN PRODUCTION
 * Will be replaced by `/api/v1/staff` in Phase 7.
 */
import type { Staff } from "@/types";

export const INITIAL_STAFF_MOCK: Staff[] = [
  {
    id: "stf_01",
    businessId: "biz_glow_01",
    name: "Siti Rahma",
    roleOrTitle: "Senior Aesthetician",
    bio: "Spesialis perawatan kulit sensitif dan anti-aging dengan pengalaman 6 tahun.",
    isActive: true,
    serviceIds: ["srv_01", "srv_02"],
  },
  {
    id: "stf_02",
    businessId: "biz_glow_01",
    name: "Nadia Putri",
    roleOrTitle: "Beauty & Hair Specialist",
    bio: "Ahli perawatan facial hidrasi dan terapi relaksasi rambut.",
    isActive: true,
    serviceIds: ["srv_01", "srv_03", "srv_04"],
  },
  {
    id: "stf_03",
    businessId: "biz_glow_01",
    name: "Rina Wulandari",
    roleOrTitle: "Skin & Scalp Therapist",
    bio: "Berfokus pada brightening treatment dan perawatan kulit kepala sehat.",
    isActive: true,
    serviceIds: ["srv_02", "srv_03"],
  },
  {
    id: "stf_04",
    businessId: "biz_glow_01",
    name: "Dewi Lestari",
    roleOrTitle: "Junior Therapist (Cuti)",
    bio: "Terapis perawatan wajah dasar.",
    isActive: false,
    serviceIds: ["srv_01"],
  },
];

