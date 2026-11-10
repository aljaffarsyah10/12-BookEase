export const BUSINESS_CATEGORIES = [
  "General",
  "Kecantikan & Salon",
  "Kesehatan & Klinik",
  "Konsultasi & Coaching",
  "Pendidikan & Kursus",
  "Otomotif & Servis",
  "Fotografi & Studio",
  "Olahraga & Fitness",
  "Lainnya",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];
