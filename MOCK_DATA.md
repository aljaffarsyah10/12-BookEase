# MOCK_DATA.md — BookEase Mock Layer Deprecation & Real API Integration Status

**Project:** BookEase — Online Booking & Appointment Management SaaS  
**Phase:** Phase 7 — Frontend & Backend Integration  
**Status:** MOCK LAYER DEPRECATED & REPLACED (All production UI components now communicate with real REST API endpoints)

---

## 1. Status Migrasi Mock Layer (Phase 7 Integration)

Pada **Phase 7**, seluruh UI production (Dashboard Pemilik Bisnis, Manajemen Layanan, Staf, Jadwal, Daftar Reservasi, Detail Reservasi, serta Public Booking Wizard dan Halaman Konfirmasi) telah sepenuhnya diintegrasikan ke Backend REST API dan Database PostgreSQL melalui Prisma 7.

Semua komponen halaman (`src/app/`) dan komponen fitur (`src/components/`, `src/features/`) **tidak lagi memanggil mock services**.

| Fitur / Halaman | Mock Service Sebelumnya | Real API Client (Phase 7) | Target Endpoint Backend |
| :--- | :--- | :--- | :--- |
| Login Akun Bisnis | Mock timeout di `/login` | `authApi.login()` | `POST /api/v1/auth/login` |
| Pendaftaran Bisnis | Mock timeout di `/register` | `authApi.register()` | `POST /api/v1/auth/register` |
| Profil Bisnis | `businessMockService` | `businessApi.getBusiness()` & `updateBusiness()` | `GET`, `PATCH /api/v1/business` |
| Halaman Booking Publik | `businessMockService.getPublicBusinessBySlug()` | `businessApi.getPublicBySlug()` | `GET /api/v1/businesses/[slug]` |
| Manajemen Layanan (CRUD) | `serviceMockService` | `serviceApi.listServices()`, `createService()`, `updateService()`, `deleteService()` | `GET`, `POST /api/v1/services`, `PATCH`, `DELETE /api/v1/services/[id]` |
| Manajemen Staf (CRUD) | `staffMockService` | `staffApi.listStaff()`, `createStaff()`, `updateStaff()` | `GET`, `POST /api/v1/staff`, `PATCH /api/v1/staff/[id]` |
| Jam Operasional (7 Hari) | `scheduleMockService` | `scheduleApi.getSchedule()` & `saveSchedule()` | `GET`, `PUT /api/v1/schedule` |
| Ketersediaan Slot Waktu | `bookingMockService.getAvailableSlots()` | `bookingApi.getAvailability()` | `GET /api/v1/availability` |
| Pembuatan Reservasi Publik | `bookingMockService.createBooking()` | `bookingApi.createBooking()` | `POST /api/v1/bookings` (Transaksional dengan deteksi konflik 409) |
| Daftar Reservasi | `bookingMockService.listBookings()` | `bookingApi.listBookings()` | `GET /api/v1/bookings?search=&status=&date=` |
| Detail & Status Reservasi | `bookingMockService.getBookingById()` / `updateBookingStatus()` | `bookingApi.getBookingById()` & `updateBookingStatus()` | `GET`, `PATCH /api/v1/bookings/[id]` |
| Konfirmasi Booking Publik | `bookingMockService.getBookingByReference()` | `bookingApi.getBookingByReference()` | `GET /api/v1/bookings/reference/[ref]` |
| Ringkasan Dashboard | `computeDashboardMockStats()` | `bookingApi.listBookings()` + `businessApi.getBusiness()` | `computeDashboardStats()` dengan kalkulasi waktu nyata |

---

## 2. File Mock Status

File-file data awal di `src/features/*/mocks/*.mock.ts` dan `src/features/*/services/*.mock-service.ts` telah diisolasi dan tidak diimpor oleh modul production aplikasi mana pun (`0 active references in src/app/ & src/components/`).
File mock tersebut dipertahankan hanya sebagai referensi unit testing / fixture data development awal jika diperlukan di masa depan.
