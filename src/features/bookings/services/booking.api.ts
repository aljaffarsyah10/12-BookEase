import { apiClient } from "@/lib/api-client";
import type { CreateBookingFormValues } from "@/lib/validations/booking.schema";
import type { Booking, BookingStatus, TimeSlot } from "@/types";

export interface AvailabilityResponse {
  isClosed: boolean;
  timezone: string;
  serviceDurationMinutes?: number;
  bufferTimeMinutes?: number;
  slots: TimeSlot[];
}

export interface PaginatedBookingsResponse {
  items: Booking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const bookingApi = {
  async listBookings(filters?: {
    search?: string;
    status?: BookingStatus | "ALL";
    date?: string;
    sortBy?: "startAt" | "customerName" | "servicePriceSnapshot" | "status";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<Booking[] | PaginatedBookingsResponse> {
    const params = new URLSearchParams();
    if (filters?.search) params.set("search", filters.search);
    if (filters?.status && filters.status !== "ALL")
      params.set("status", filters.status);
    if (filters?.date) params.set("date", filters.date);
    if (filters?.sortBy) params.set("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.set("sortOrder", filters.sortOrder);
    if (filters?.page) params.set("page", String(filters.page));
    if (filters?.limit) params.set("limit", String(filters.limit));

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return apiClient.get<Booking[] | PaginatedBookingsResponse>(
      `/api/v1/bookings${queryString}`
    );
  },

  async getBookingById(id: string): Promise<Booking> {
    return apiClient.get<Booking>(`/api/v1/bookings/${id}`);
  },

  async getBookingByReference(reference: string): Promise<Booking> {
    return apiClient.get<Booking>(
      `/api/v1/bookings/reference/${encodeURIComponent(reference)}`
    );
  },

  async updateBookingStatus(
    id: string,
    status: BookingStatus,
    cancelReason?: string
  ): Promise<Booking> {
    return apiClient.patch<Booking>(`/api/v1/bookings/${id}`, {
      status,
      cancelReason,
    });
  },

  async updateBulkStatus(
    ids: string[],
    status: BookingStatus,
    cancelReason?: string
  ): Promise<{ updatedCount: number; updatedIds: string[] }> {
    return apiClient.post<{ updatedCount: number; updatedIds: string[] }>(
      "/api/v1/bookings/bulk-status",
      { ids, status, cancelReason }
    );
  },

  async customerCancel(params: {
    reference: string;
    token: string;
    reason?: string;
  }): Promise<Booking> {
    return apiClient.post<Booking>("/api/v1/bookings/customer-cancel", params);
  },

  async createBooking(values: CreateBookingFormValues): Promise<Booking> {
    return apiClient.post<Booking>("/api/v1/bookings", values);
  },

  async getAvailability(params: {
    slug: string;
    serviceId: string;
    date: string;
    staffId?: string;
  }): Promise<AvailabilityResponse> {
    const query = new URLSearchParams({
      slug: params.slug,
      serviceId: params.serviceId,
      date: params.date,
    });
    if (params.staffId && params.staffId !== "any") {
      query.set("staffId", params.staffId);
    }
    return apiClient.get<AvailabilityResponse>(
      `/api/v1/availability?${query.toString()}`
    );
  },
};
