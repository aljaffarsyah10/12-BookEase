export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED"
  | "NO_SHOW";

export interface Business {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  timezone: "Asia/Jakarta" | "Asia/Makassar" | "Asia/Jayapura";
  bufferTimeMinutes: number;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  staffIds: string[];
}

export interface Staff {
  id: string;
  businessId: string;
  name: string;
  roleOrTitle: string | null;
  bio?: string | null;
  isActive: boolean;
  serviceIds: string[];
}

export interface OperatingHour {
  id: string;
  businessId: string;
  dayOfWeek: number; // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
  openTime: string; // "HH:mm"
  closeTime: string; // "HH:mm"
  isClosed: boolean;
}

export interface TimeSlot {
  time: string; // "HH:mm" in business timezone
  startAt: string; // ISO UTC
  endAt: string; // ISO UTC
  availableStaffIds: string[];
}

export interface Booking {
  id: string;
  reference: string;
  businessId: string;
  serviceId: string;
  staffId: string;
  serviceNameSnapshot: string;
  servicePriceSnapshot: number;
  durationMinutesSnapshot: number;
  staffName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes?: string | null;
  date: string; // "YYYY-MM-DD" in business timezone
  time: string; // "HH:mm" in business timezone
  startAt: string; // ISO UTC
  endAt: string; // ISO UTC
  status: BookingStatus;
  cancelReason?: string | null;
  createdAt: string;
}
