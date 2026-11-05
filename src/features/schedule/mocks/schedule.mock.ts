/**
 * TEMPORARY PHASE 5 MOCK DATA — DO NOT USE IN PRODUCTION
 * Will be replaced by `/api/v1/schedule` in Phase 7.
 */
import type { OperatingHour } from "@/types";

export const INITIAL_OPERATING_HOURS_MOCK: OperatingHour[] = [
  {
    id: "oph_0",
    businessId: "biz_glow_01",
    dayOfWeek: 0, // Minggu
    openTime: "09:00",
    closeTime: "17:00",
    isClosed: true,
  },
  {
    id: "oph_1",
    businessId: "biz_glow_01",
    dayOfWeek: 1, // Senin
    openTime: "09:00",
    closeTime: "18:00",
    isClosed: false,
  },
  {
    id: "oph_2",
    businessId: "biz_glow_01",
    dayOfWeek: 2, // Selasa
    openTime: "09:00",
    closeTime: "18:00",
    isClosed: false,
  },
  {
    id: "oph_3",
    businessId: "biz_glow_01",
    dayOfWeek: 3, // Rabu
    openTime: "09:00",
    closeTime: "18:00",
    isClosed: false,
  },
  {
    id: "oph_4",
    businessId: "biz_glow_01",
    dayOfWeek: 4, // Kamis
    openTime: "09:00",
    closeTime: "18:00",
    isClosed: false,
  },
  {
    id: "oph_5",
    businessId: "biz_glow_01",
    dayOfWeek: 5, // Jumat
    openTime: "09:00",
    closeTime: "18:00",
    isClosed: false,
  },
  {
    id: "oph_6",
    businessId: "biz_glow_01",
    dayOfWeek: 6, // Sabtu
    openTime: "10:00",
    closeTime: "16:00",
    isClosed: false,
  },
];

