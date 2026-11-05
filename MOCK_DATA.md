# MOCK_DATA.md — BookEase Temporary Mock Layer Documentation

**Project:** BookEase — Online Booking & Appointment Management SaaS  
**Phase:** Phase 5 — Core Frontend Feature Development  
**Status:** Temporary Frontend-Only Mock Layer (To Be Replaced in Phase 7)

---

## 1. Tujuan Layer Mock

Pada **Phase 5**, seluruh antarmuka inti BookEase (mulai dari Dashboard Pemilik Bisnis hingga Public Booking Wizard pelanggan) dibangun dan diuji menggunakan **Mock Service Layer** yang terisolasi.

Aturan arsitektur mock:
1. **Tidak ada data mock yang di-hardcode di dalam komponen UI/halaman.**
2. Seluruh data awal disimpan dalam direktori `src/features/*/mocks/*.mock.ts`.
3. Seluruh operasi baca/tulis dari UI dipanggil melalui metode asynchronous di `src/features/*/services/*.mock-service.ts` (dengan persistensi sementara di `sessionStorage` browser selama sesi pengujian).
4. Pada **Phase 7 (Frontend & Backend Integration)**, seluruh pemanggilan `*.mock-service.ts` akan digantikan oleh HTTP request ke endpoint REST API `/api/v1/*` dan Server Components query.

---

## 2. Daftar File Mock Data & Mock Services

| No | File Mock / Service | Tujuan Data & Fungsionalitas | Halaman / Komponen Pengguna |
| :--- | :--- | :--- | :--- |
| 1 | `src/features/business/mocks/business.mock.ts` | Menyediakan data awal profil bisnis (`Glow Beauty Studio`), slug (`glow-beauty-studio`), alamat, telepon, timezone (`Asia/Jakarta`), `bufferTimeMinutes`, dan daftar kategori bisnis. | `/dashboard/business`, `/book/[slug]` |
| 2 | `src/features/business/services/business.mock-service.ts` | Menyediakan fungsi `getBusiness()`, `getPublicBusinessBySlug(slug)`, dan `updateBusiness(payload)`. | `src/app/(dashboard)/dashboard/business/page.tsx`, `src/app/(dashboard)/dashboard/schedule/page.tsx`, `src/app/book/[slug]/page.tsx` |
| 3 | `src/features/services/mocks/service.mock.ts` | Menyediakan 4 katalog layanan awal beserta harga (Rupiah), durasi (menit), status aktif/nonaktif, dan relasi `staffIds`. | `/dashboard/services`, `/book/[slug]` |
| 4 | `src/features/services/services/service.mock-service.ts` | Menyediakan CRUD layanan simulasi: `listServices(onlyActive)`, `createService()`, `updateService()`, `toggleServiceActive()`, dan `deleteService()`. | `src/app/(dashboard)/dashboard/services/page.tsx`, `src/app/(dashboard)/dashboard/staff/page.tsx`, `src/app/book/[slug]/page.tsx` |
| 5 | `src/features/staff/mocks/staff.mock.ts` | Menyediakan 4 profil anggota staf awal beserta jabatan (`roleOrTitle`), bio, status `isActive`, dan daftar `serviceIds`. | `/dashboard/staff`, `/dashboard/services`, `/book/[slug]` |
| 6 | `src/features/staff/services/staff.mock-service.ts` | Menyediakan operasi `listStaff(onlyActive)`, `createStaff()`, `updateStaff()`, dan `toggleStaffActive()`. | `src/app/(dashboard)/dashboard/staff/page.tsx`, `src/app/(dashboard)/dashboard/services/page.tsx`, `src/app/book/[slug]/page.tsx` |
| 7 | `src/features/schedule/mocks/schedule.mock.ts` | Menyediakan jadwal operasional 7 hari (`dayOfWeek` `0..6`), `openTime`, `closeTime`, dan flag `isClosed` (Minggu libur). | `/dashboard/schedule`, kalkulasi slot `/book/[slug]` |
| 8 | `src/features/schedule/services/schedule.mock-service.ts` | Menyediakan `getSchedule()` dan `updateSchedule(items)`. | `src/app/(dashboard)/dashboard/schedule/page.tsx`, `booking.mock-service.ts` |
| 9 | `src/features/bookings/mocks/booking.mock.ts` | Menyediakan 5 data reservasi awal dengan variasi status (`CONFIRMED`, `PENDING`, `COMPLETED`, `CANCELLED`) beserta snapshot harga dan durasi layanan. | `/dashboard`, `/dashboard/bookings`, `/dashboard/bookings/[id]`, `/book/[slug]/success` |
| 10 | `src/features/bookings/services/booking.mock-service.ts` | Menyediakan `listBookings(filters)`, `getBookingById(id)`, `getBookingByReference(ref)`, `updateBookingStatus()`, `getAvailableSlots()`, dan `createBooking()`. | `/dashboard`, `/dashboard/bookings`, `/dashboard/bookings/[id]`, `src/components/booking/booking-wizard.tsx`, `/book/[slug]/success` |
| 11 | `src/features/dashboard/mocks/dashboard.mock.ts` | Menghitung metrik ringkasan dashboard (`totalBookings`, `todayBookingsCount`, `upcomingBookingsCount`, `completedBookingsCount`, `pendingBookingsCount`). | `src/app/(dashboard)/dashboard/page.tsx` |

---

## 3. Rencana Penggantian pada Phase 7 (Integration Mapping)

Tabel berikut memetakan setiap metode mock yang **wajib diganti** dengan implementasi backend nyata pada **Phase 7**:

| Mock Method Saat Ini (Phase 5) | Target Endpoint / Server Action (Phase 7) | Catatan Integrasi Phase 7 |
| :--- | :--- | :--- |
| Simulasi submit di `/login` | `signIn("credentials", ...)` (Auth.js) | Menggunakan session autentikasi nyata dan redirect server/client. |
| Simulasi submit di `/register` | `POST /api/v1/auth/register` | Membuat `User`, `Business`, dan 7 baris `OperatingHour` di PostgreSQL. |
| `businessMockService.getBusiness()` | `GET /api/v1/business` | Mengambil bisnis berdasarkan `session.user.businessId`. |
| `businessMockService.updateBusiness()` | `PATCH /api/v1/business` | Memvalidasi keunikan `slug` dan menyimpan perubahan di PostgreSQL. |
| `businessMockService.getPublicBusinessBySlug()` | `GET /api/v1/businesses/[slug]` | Mengambil profil publik, layanan aktif, staf aktif, dan jam buka. |
| `serviceMockService.listServices()` | `GET /api/v1/services` | Mengambil daftar layanan milik bisnis yang sedang login. |
| `serviceMockService.createService()` | `POST /api/v1/services` | Menyimpan layanan baru beserta relasi tabel `staff_services`. |
| `serviceMockService.updateService()` / `toggleServiceActive()` | `PATCH /api/v1/services/[id]` | Memperbarui data layanan dan relasi staf dengan verifikasi kepemilikan. |
| `serviceMockService.deleteService()` | `DELETE /api/v1/services/[id]` | Menghapus atau menonaktifkan layanan jika sudah memiliki histori booking. |
| `staffMockService.listStaff()` | `GET /api/v1/staff` | Mengambil daftar staf milik bisnis. |
| `staffMockService.createStaff()` | `POST /api/v1/staff` | Menambahkan staf baru dan relasi `staff_services`. |
| `staffMockService.updateStaff()` / `toggleStaffActive()` | `PATCH /api/v1/staff/[id]` | Memperbarui informasi staf dan status `isActive`. |
| `scheduleMockService.getSchedule()` | `GET /api/v1/schedule` | Mengambil 7 baris `OperatingHour` milik bisnis. |
| `scheduleMockService.updateSchedule()` | `PUT /api/v1/schedule` | Menyimpan pembaruan jadwal 7 hari dalam transaksi Prisma. |
| `bookingMockService.getAvailableSlots()` | `GET /api/v1/availability` | Menggunakan `SlotEngine` di backend dengan konversi UTC ↔ `Business.timezone`. |
| `bookingMockService.createBooking()` | `POST /api/v1/bookings` | Menggunakan transaksi Prisma + row lock `FOR UPDATE` + constraint `btree_gist`. |
| `bookingMockService.listBookings()` | `GET /api/v1/bookings` | Mendukung filter status, tanggal, pencarian teks, dan pagination database. |
| `bookingMockService.getBookingById()` | `GET /api/v1/bookings/[id]` | Memverifikasi `booking.businessId === session.user.businessId`. |
| `bookingMockService.updateBookingStatus()` | `PATCH /api/v1/bookings/[id]` | Memvalidasi transisi status melalui state machine backend. |
| `computeDashboardMockStats()` | Server query di `/dashboard` / `GET /api/v1/bookings` | Menghitung agregat langsung dari tabel `bookings` di PostgreSQL. |

