/**
 * TEMPORARY PHASE 5 MOCK DATA — DO NOT USE IN PRODUCTION
 * Will be replaced by `/api/v1/services` in Phase 7.
 */
import type { Service } from "@/types";

export const INITIAL_SERVICES_MOCK: Service[] = [
  {
    id: "srv_01",
    businessId: "biz_glow_01",
    name: "Signature Hydrating Facial",
    description:
      "Pembersihan mendalam, ekstraksi komedo lembut, dan masker serum hyaluronic acid untuk kulit cerah lembap.",
    price: 250000,
    durationMinutes: 60,
    isActive: true,
    staffIds: ["stf_01", "stf_02"],
  },
  {
    id: "srv_02",
    businessId: "biz_glow_01",
    name: "Brightening Vitamin C Peel",
    description:
      "Perawatan eksfoliasi ringan dengan infus Vitamin C murni untuk menyamarkan noda hitam dan meratakan warna kulit.",
    price: 325000,
    durationMinutes: 45,
    isActive: true,
    staffIds: ["stf_01", "stf_03"],
  },
  {
    id: "srv_03",
    businessId: "biz_glow_01",
    name: "Royal Hair Spa & Aromatherapy",
    description:
      "Creambath nutrisi keratin disertai pijat kepala, bahu, dan leher dengan minyak esensial lavender.",
    price: 185000,
    durationMinutes: 60,
    isActive: true,
    staffIds: ["stf_02", "stf_03"],
  },
  {
    id: "srv_04",
    businessId: "biz_glow_01",
    name: "Express Glow Facial",
    description:
      "Perawatan wajah singkat 30 menit cocok untuk jadwal padat di sela jam istirahat.",
    price: 150000,
    durationMinutes: 30,
    isActive: false,
    staffIds: ["stf_02"],
  },
];

