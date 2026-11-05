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
  timezone: string;
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
}

export interface Staff {
  id: string;
  businessId: string;
  name: string;
  roleOrTitle?: string | null;
  isActive: boolean;
}

export interface OperatingHour {
  id: string;
  businessId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface Booking {
  id: string;
  reference: string;
  businessId: string;
  serviceId: string;
  staffId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerNotes?: string | null;
  startAt: string;
  endAt: string;
  status: BookingStatus;
}

