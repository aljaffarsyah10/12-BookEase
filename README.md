<div align="center">

![BookEase Banner](./public/images/banner.svg)

# BookEase — Online Appointment & Booking System

**Sistem Manajemen Reservasi & Janji Temu Online Berbasis Cloud untuk Bisnis Jasa Lokal**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.10-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passed-emerald?style=flat-square&logo=node.js)](./TEST_REPORT.md)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](#lisensi)

[Fitur Utama](#-fitur-utama) • [Arsitektur](#-arsitektur--alur-sistem) • [Cara Menjalankan](#-cara-menjalankan-proyek-quick-start) • [Dokumentasi API](#-skema-api--status-reservasi) • [Docker](#-menjalankan-dengan-docker) • [Rilis](#-catatan-rilis)

</div>

---

## 📖 Tentang Proyek BookEase

**BookEase** adalah aplikasi web modern yang dibangun untuk menghilangkan friksi pencatatan manual janji temu via pesan singkat (WhatsApp/DM) atau buku reservasi kertas pada bisnis jasa lokal (seperti *Barbershop*, Salon Kecantikan, Klinik Estetika, Studio Foto, Spa/Pijat Refleksi, dan Konsultan Independen).

### Nilai Utama:
- **Zero Friction untuk Pelanggan**: Reservasi mandiri tanpa kewajiban membuat akun atau mengingat kata sandi (*Guest Checkout Flow*).
- **Anti-Double Booking**: Algoritma deteksi konflik dan konkurensi di tingkat transaksi basis data menjamin tidak ada dua pelanggan yang memesan staf dan waktu yang sama.
- **Fleksibilitas Multi-Zona Waktu**: Mendukung penuh jam operasional dan konversi waktu akurat melintasi WIB (`UTC+7`), WITA (`UTC+8`), dan WIT (`UTC+9`).
- **Pembatalan Mandiri Terverifikasi**: Pelanggan dapat membatalkan janji secara mandiri melalui tautan unik bertanda tangan kriptografis HMAC-SHA256 tanpa perlu login.
- **Dashboard Operasional Pemilik**: Rekap statistik harian, kalender interaktif mingguan, manajemen katalog layanan, jam kerja, dan tim staf.

---

## 🏗️ Arsitektur & Alur Sistem

![BookEase Architecture](./public/images/architecture.svg)

```mermaid
sequenceDiagram
    autonumber
    actor Pelanggan as Pelanggan (Guest)
    participant Web as BookEase Web (/book/[slug])
    participant API as Availability Engine
    participant DB as PostgreSQL (Prisma)
    participant Email as Resend Email Service
    actor Owner as Pemilik Bisnis (/dashboard)

    Pelanggan->>Web: 1. Pilih Layanan & Staf
    Web->>API: 2. Query Slot Tersedia (Tanggal Terpilih)
    API->>DB: Cek Jam Operasional, Booking Aktif & Buffer Time
    DB-->>API: Kembalikan Slot Bebas
    API-->>Web: Tampilkan Jam Bebas (e.g. 10:00, 11:00)
    Pelanggan->>Web: 3. Isi Nama & Kontak -> Konfirmasi
    Web->>API: 4. POST /api/v1/bookings
    API->>DB: Eksekusi Transaksi ACID (Kunci Slot & Buat Booking)
    DB-->>API: Booking Berhasil Disimpan (Status: CONFIRMED)
    API--)Email: Kirim Email Konfirmasi (Non-blocking)
    API-->>Web: Redirect ke Halaman Sukses (Kode BK-...)
    Owner->>DB: Buka Dashboard -> Notifikasi Reservasi Masuk Real-Time
```

---

## ✨ Fitur Utama

### 1. Pelanggan (Public Customer Experience)
- **Multi-Step Booking Wizard**:
  - **Langkah 1 (Layanan)**: Informasi nama layanan, estimasi durasi, dan rincian harga Rupiah.
  - **Langkah 2 (Staf)**: Pilihan staf favorit atau opsi otomatis *"Staf Mana Saja (Any Available)"*.
  - **Langkah 3 (Waktu)**: Pemilihan tanggal interaktif dengan kalkulasi slot jam yang otomatis mengecualikan waktu lampau dan slot terisi.
  - **Langkah 4 (Konfirmasi)**: Pengisian nama, email, nomor WhatsApp/telepon, dan catatan tambahan.
- **Bukti Reservasi Instan**: Kode referensi terstruktur (contoh: `BK-20261106-9X4K2P`) beserta snapshot data layanan.
- **Customer Cancellation Flow**: Pelanggan dapat membatalkan reservasi secara mandiri via `/book/cancel?ref=...&token=...`. Slot waktu langsung terbuka kembali untuk pelanggan lain.

### 2. Pemilik Bisnis (Business Owner Dashboard)
- **Ringkasan Operasional (Dashboard Overview)**: Kartu metrik total reservasi, booking hari ini, booking mendatang, layanan tuntas, dan estimasi omzet.
- **Daftar & Manajemen Reservasi**:
  - Filter pencarian kata kunci multi-kolom (nama, email, telepon, referensi).
  - Filter status kehadiran (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`).
  - Filter tanggal kalender dan *server-side pagination*.
  - **Tampilan Kalender Mingguan**: Tampilan visual per hari dengan label waktu dan tombol aksi cepat pembaruan status.
- **Katalog Layanan (Service Management)**: Tambah, edit, dan atur durasi, harga, status aktif/nonaktif, serta kualifikasi staf penanggung jawab.
- **Tim Staf (Staff Management)**: Profil staf, titel profesional, dan asosiasi layanan keahlian.
- **Jam Operasional & Jeda Waktu (Schedule & Buffer Time)**:
  - Konfigurasi jam buka dan tutup mingguan (Senin–Minggu) dengan opsi hari libur.
  - Pengaturan jeda persiapan/istirahat (*buffer time* 0–60 menit) antar-sesi janji temu.
  - Pilihan zona waktu bisnis (`Asia/Jakarta`, `Asia/Makassar`, `Asia/Jayapura`).

---

## 🛠️ Tech Stack

| Lapisan | Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) | Server Components modern, Partial Prerendering (PPR), dan performa edge cepat |
| **Bahasa** | [TypeScript 5](https://www.typescriptlang.org/) | *End-to-end type safety* dari database hingga UI components |
| **UI Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Base UI / Shadcn | Desain clean, modular, responsif mobile-first, dan aksesibilitas tinggi |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) via [Prisma ORM 7](https://www.prisma.io/) | Relasi referensial kuat, integritas ACID, dan kemudahan migrasi skema |
| **Timezone** | [date-fns](https://date-fns.org/) & [date-fns-tz](https://github.com/marnusw/date-fns-tz) | Perhitungan zona waktu lokal Indonesia yang presisi tanpa distorsi UTC |
| **Validasi** | [Zod 4](https://zod.dev/) | Validasi skema runtime pada form client dan payload API route |
| **Email** | [Resend](https://resend.com/) | Pengiriman email transaksional modern dengan fallback graceful dev stub |
| **Testing** | Node.js Test Runner Native (`node:test`) | Eksekusi test suite sangat cepat (< 1 detik) tanpa overhead runtime |

---

## 🚀 Cara Menjalankan Proyek (Quick Start)

Ikuti langkah-langkah berikut untuk menjalankan BookEase di komputer lokal Anda:

### 1. Prasyarat Sistem
Pastikan telah terpasang:
- **Node.js**: Versi `20.x` atau `22.x` (Direkomendasikan Node.js v22+)
- **NPM**: Versi `10.x` ke atas
- **PostgreSQL**: Server PostgreSQL aktif lokal atau cloud (misal: Supabase / Neon / Docker)
- **Git**

### 2. Klon Repository
```bash
git clone https://github.com/your-username/bookease.git
cd bookease
```

### 3. Salin Environment Variables
Salin file template konfigurasi:
```bash
cp .env.example .env.local
```
Sesuaikan konfigurasi di `.env.local`:
```env
# URL Database PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bookease?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/bookease?schema=public"

# Kunci Rahasia Sesi (Min. 32 karakter)
AUTH_SECRET="bookease-development-auth-secret-min32characters-key-xyz"

# Kunci Rahasia Token Pembatalan HMAC
CANCELLATION_TOKEN_SECRET="bookease-cancellation-token-secret-min32characters"

# URL Aplikasi Kanonikal
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Kunci API Resend (Opsional di dev - jika kosong akan otomatis menggunakan dev stub logging)
RESEND_API_KEY=""
EMAIL_FROM="BookEase <noreply@bookease.id>"
```

### 4. Pasang Dependensi
```bash
npm install
```

### 5. Inisialisasi Database & Migrasi Prisma
Jalankan migrasi skema database:
```bash
# Generate Prisma Client
npx prisma generate

# Terapkan migrasi ke database lokal Anda
npx prisma migrate dev --name init
```

*(Opsional)* Jika Anda ingin mengisikan data awal/dummy bisnis, Anda dapat menjalankan seeder jika tersedia:
```bash
npx prisma db seed
```

### 6. Jalankan Server Development
```bash
npm run dev
```
Aplikasi akan aktif di **[http://localhost:3000](http://localhost:3000)** 🎉

---

## 🧪 Pengujian & Kualitas Kode

BookEase dilengkapi dengan rangkaian automated test suite menyeluruh yang menguji validasi, keamanan multi-tenant, dan konkurensi:

```bash
# Menjalankan seluruh Unit, Concurrency, dan Security Tests
npm test

# Menjalankan pemeriksaan TypeScript Typecheck
npx tsc --noEmit

# Menjalankan ESLint
npm run lint

# Menjalankan simulasi Production Build
npm run build
```

> Hasil pengujian lengkap dapat dibaca pada [**TEST_REPORT.md**](./TEST_REPORT.md).

---

## 🐳 Menjalankan dengan Docker

BookEase menyediakan konfigurasi kontainer siap pakai menggunakan Docker Compose:

```bash
# Bangun dan jalankan web app beserta database PostgreSQL
docker compose up -d --build

# Terapkan migrasi database di dalam kontainer
docker compose exec app npx prisma migrate deploy

# Periksa status kontainer
docker compose ps
```
Aplikasi dapat langsung diakses melalui `http://localhost:3000`.

---

## 📂 Struktur Direktori Proyek

```
bookease/
├── prisma/
│   └── schema.prisma              # Definisi model database PostgreSQL
├── public/
│   └── images/                    # Asset gambar visual, banner SVG & diagram
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── (auth)/                # Route grup autentikasi (login, register)
│   │   ├── (dashboard)/           # Route grup dashboard bisnis terproteksi
│   │   ├── api/v1/                # Endpoint REST API (auth, bookings, services, staff)
│   │   ├── book/[slug]/           # Halaman reservasi publik pelanggan (Guest Wizard)
│   │   ├── book/cancel/           # Halaman pembatalan pelanggan mandiri
│   │   ├── robots.ts              # Konfigurasi SEO bot crawling
│   │   └── sitemap.ts             # XML Sitemap dinamis
│   ├── components/                # Reusable UI components (buttons, dialogs, cards)
│   ├── features/                  # Modul fitur domain (auth, bookings, services, staff)
│   ├── lib/                       # Utilitas helper (format currency, date-fns-tz, HMAC token)
│   └── server/                    # Server-side policies, services, dan error handlers
├── tests/                         # Automated test suite (unit, concurrency, security)
├── DEPLOYMENT_GUIDE.md            # Panduan resmi rilis produksi (Vercel, Supabase, VPS)
├── RELEASE_NOTES.md               # Catatan rilis BookEase v1.0.0
├── TEST_REPORT.md                 # Laporan audit QA & hasil uji otomatis
└── Dockerfile                     # Multi-stage production container image
```

---

## 📡 Skema API & Status Reservasi

### Alur Siklus Status Booking:
```
           ┌───────────┐
           │  PENDING  │ (Reservasi baru masuk)
           └─────┬─────┘
                 │
                 ▼
          ┌─────────────┐
          │  CONFIRMED  │ (Dikonfirmasi pemilik/sistem)
          └──────┬──────┘
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│ COMPLETED │ │ CANCELLED │ │  NO_SHOW  │ (Status Terminal - Immutable)
└───────────┘ └───────────┘ └───────────┘
```

### Ringkasan Endpoint API Utama:
| Method | Endpoint | Deskripsi | Akses |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Mendaftarkan akun bisnis & workspace baru | Publik |
| `POST` | `/api/v1/auth/login` | Autentikasi pemilik bisnis (Set Cookie Sesi) | Publik |
| `GET` | `/api/v1/businesses/[slug]` | Mengambil profil publik bisnis untuk wizard | Publik |
| `GET` | `/api/v1/availability` | Menghitung slot waktu bebas berdasarkan tanggal & staf | Publik |
| `POST` | `/api/v1/bookings` | Membuat reservasi baru (dengan lock anti-konflik) | Publik |
| `POST` | `/api/v1/bookings/customer-cancel`| Membatalkan reservasi via signature token HMAC | Publik |
| `GET` | `/api/v1/bookings` | Mengambil daftar booking bisnis (search, filter, pagination) | Owner |
| `PATCH`| `/api/v1/bookings/[id]` | Memperbarui status reservasi | Owner |
| `GET` | `/api/v1/dashboard/stats` | Statistik omzet & ringkasan operasional harian | Owner |

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi **MIT License**. Silakan gunakan, pelajari, dan kembangkan sesuai kebutuhan bisnis Anda.

---

<div align="center">
  <sub>Dibangun dengan dedikasi untuk memajukan digitalisasi UMKM dan bisnis jasa lokal di Indonesia 🇮🇩</sub>
</div>
