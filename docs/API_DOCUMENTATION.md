# BookEase REST API Documentation

Dokumentasi lengkap antarmuka pemrograman aplikasi (API) untuk platform SaaS **BookEase**.

- **Base URL (Production)**: `https://bookease.id`
- **Base URL (Local)**: `http://localhost:3000`
- **Current Version**: `v1`
- **Content-Type**: `application/json`

---

## 1. Format Respons Standar

### Respons Sukses (HTTP 200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operasi berhasil dilakukan."
}
```

### Respons Gagal (HTTP 4xx / 5xx)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Deskripsi pesan kesalahan yang ramah pengguna.",
    "details": {
      "requestId": "req_l9x1a2b_3f8a",
      "referenceCode": "d41d8cd98f00b204"
    }
  }
}
```

---

## 2. Autentikasi & Keamanan Sesi

BookEase menggunakan cookie sesi terenkripsi dan bertanda tangan HMAC-SHA256 (`bookease_session`).
- **Atribut Cookie**: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` (di production).
- **Proteksi CSRF**: API memvalidasi header `Origin` atau `Referer` pada request mutasi (`POST`, `PATCH`, `DELETE`).

---

## 3. Ringkasan Endpoint API

### A. Autentikasi & Akun Pengguna

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Mendaftarkan pemilik akun & workspace bisnis baru (otomatis mendapat Free Trial 14 hari) | Publik |
| `POST` | `/api/v1/auth/login` | Autentikasi pengguna dan menetapkan cookie sesi | Publik |
| `GET` | `/api/v1/auth/me` | Mengambil data sesi pengguna & bisnis saat ini | Terautentikasi |
| `POST` | `/api/v1/auth/logout` | Menghapus cookie sesi | Terautentikasi |

---

### B. Bisnis & Profil Publik

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/business` | Mengambil rincian profil bisnis pemilik yang login | Terautentikasi |
| `PATCH` | `/api/v1/business` | Memperbarui profil bisnis (nama, kategori, telepon, buffer time) | Terautentikasi |
| `GET` | `/api/v1/businesses/{slug}` | Profil bisnis publik beserta katalog layanan & staf | Publik |

---

### C. Katalog Layanan

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/services` | Daftar layanan (query `?active=true` untuk hanya aktif) | Terautentikasi |
| `POST` | `/api/v1/services` | Menambahkan layanan baru (dibatasi kuota paket) | Terautentikasi |
| `GET` | `/api/v1/services/{id}` | Mengambil detail 1 layanan | Terautentikasi |
| `PATCH` | `/api/v1/services/{id}` | Memperbarui layanan | Terautentikasi |
| `DELETE` | `/api/v1/services/{id}` | Menghapus layanan | Terautentikasi |

---

### D. Tim Staf & Tenaga Ahli

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/staff` | Daftar staf (query `?active=true`) | Terautentikasi |
| `POST` | `/api/v1/staff` | Mendaftarkan staf baru beserta penugasan layanan | Terautentikasi |
| `PATCH` | `/api/v1/staff/{id}` | Memperbarui profil staf & keahlian layanan | Terautentikasi |
| `DELETE` | `/api/v1/staff/{id}` | Menghapus staf | Terautentikasi |

---

### E. Jam Operasional & Ketersediaan Slot

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/schedule` | Jam operasional mingguan bisnis (0=Minggu, 6=Sabtu) | Terautentikasi |
| `PUT` | `/api/v1/schedule` | Memperbarui jadwal 7 hari operasional | Terautentikasi |
| `GET` | `/api/v1/availability` | Menghitung slot kosong real-time (`slug`, `serviceId`, `staffId`, `date`) | Publik |

---

### F. Manajemen Reservasi (Bookings)

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/bookings` | Daftar reservasi dengan filter, pagination, dan multi-sort | Terautentikasi |
| `POST` | `/api/v1/bookings` | Membuat reservasi baru (dengan alokasi staf pintar & pencegahan double-booking) | Publik |
| `GET` | `/api/v1/bookings/{id}` | Detail reservasi | Terautentikasi |
| `PATCH` | `/api/v1/bookings/{id}` | Memperbarui status reservasi (`CONFIRMED`, `CANCELLED`, `COMPLETED`, `NO_SHOW`) | Terautentikasi |
| `POST` | `/api/v1/bookings/bulk-status` | Pembaruan status massal banyak reservasi sekaligus | Terautentikasi |
| `POST` | `/api/v1/bookings/customer-cancel` | Pembatalan mandiri oleh pelanggan menggunakan HMAC token | Publik |
| `GET` | `/api/v1/bookings/reference/{ref}` | Mengambil detail booking berdasarkan kode referensi | Publik (Masked) |

---

### G. Langganan SaaS & Penagihan (Billing)

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/billing/subscription` | Rincian paket aktif, kuota sumber daya, dan sisa trial | Terautentikasi |
| `POST` | `/api/v1/billing/checkout` | Menerbitkan invoice peningkatan paket (`STARTER`, `PRO`, `ENTERPRISE`) | Terautentikasi |
| `GET` | `/api/v1/billing/invoices` | Riwayat faktur tagihan bisnis | Terautentikasi |
| `POST` | `/api/v1/billing/simulate` | Simulasi pembayaran instan Sandbox (QRIS, VA, CC) | Terautentikasi |
| `POST` | `/api/v1/billing/webhook` | Menerima notifikasi status pembayaran gateway | Publik (Webhook) |
| `DELETE`| `/api/v1/billing/subscription` | Membatalkan paket langganan aktif | Terautentikasi |

---

### H. Health Checks & Observability

| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Status kesehatan menyeluruh (Database, memori, metrik) | Publik / Monitoring |
| `GET` | `/api/health/live` | Liveness probe (HTTP 200 OK jika container berjalan) | Orchestrator |
| `GET` | `/api/health/ready` | Readiness probe (Memastikan koneksi database siap) | Orchestrator |
