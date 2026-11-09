<div align="center">

![BookEase Banner](./public/images/banner.svg)

# BookEase — Online Appointment & Booking System

**Platform Manajemen Reservasi & Janji Temu Online Berbasis Cloud untuk Bisnis Jasa Lokal**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Base UI](https://img.shields.io/badge/Base_UI-Primitives-4f46e5?style=flat-square)](https://base-ui.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.10-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-20%2F20%20Passed-emerald?style=flat-square&logo=node.js)](./TEST_REPORT.md)
[![UI/UX](https://img.shields.io/badge/UI%2FUX-Premium_SaaS-6366f1?style=flat-square)](#-standar-redesign-uiux-premium-saas)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](#-lisensi)

[Tampilan Visual](#-tampilan-visual-aplikasi) • [Fitur Utama](#-fitur-utama) • [Standar UI/UX](#-standar-redesign-uiux-premium-saas) • [Cara Menjalankan](#-cara-menjalankan-proyek-quick-start) • [Troubleshooting DB](#-panduan-mengatasi-kendala-database-p1000) • [Dokumentasi API](#-skema-api--status-reservasi) • [Docker](#-menjalankan-dengan-docker)

</div>

---

## 📖 Tentang Proyek BookEase

**BookEase** adalah aplikasi web modern yang dibangun untuk menghilangkan friksi pencatatan manual janji temu via chat WhatsApp atau buku catatan kertas pada bisnis jasa lokal (seperti *Barbershop*, Salon Kecantikan, Klinik Estetika, Studio Foto, Fisioterapi, Spa/Refleksi, dan Konsultan Independen).

### Nilai Utama:
- **Zero-Friction untuk Pelanggan**: Reservasi mandiri dalam 4 langkah tanpa kewajiban membuat akun atau mengingat kata sandi (*Guest Checkout Flow*).
- **Anti-Double Booking**: Algoritma deteksi konflik dan konkurensi di tingkat transaksi basis data menjamin tidak ada dua pelanggan yang memesan staf dan waktu yang sama.
- **Dukungan Multi-Zona Waktu**: Mendukung penuh jam operasional dan konversi waktu akurat melintasi WIB (`UTC+7`), WITA (`UTC+8`), dan WIT (`UTC+9`).
- **Pembatalan Mandiri Kriptografis**: Pelanggan dapat membatalkan janji secara mandiri melalui token HMAC-SHA256 yang aman tanpa perlu login.
- **Dashboard SaaS Kelas Dunia**: Rekap statistik KPI harian, kalender interaktif mingguan, katalog layanan, alokasi staf, dan jam kerja.

---

## 📸 Tampilan Visual Aplikasi

### 1. Dashboard Operasional Pemilik Bisnis
Antarmuka manajemen terpusat dengan navigasi terstruktur gaya *Linear*, ringkasan KPI *Stripe-grade*, daftar reservasi terbaru, dan jadwal hari ini.

![BookEase Dashboard Preview](./public/images/dashboard-preview.svg)

---

### 2. Public Guest Booking Wizard
Alur reservasi online yang intuitif dan responsif bagi pelanggan dengan ringkasan biaya real-time (*sticky summary*) dan penangkal bentrok jadwal.

![BookEase Booking Wizard Preview](./public/images/booking-wizard-preview.svg)

---

## 🎨 Standar Redesign UI/UX (Premium SaaS)

Berdasarkan pedoman [Redesign uiux.md](./Redesign%20uiux.md), BookEase telah dirombak menyeluruh dengan bahasa desain modern setara **Linear, Stripe, Raycast, dan Vercel**:

| Aspek Desain | Standar Baru BookEase | Implementasi |
| :--- | :--- | :--- |
| **Palet Warna** | *Deep Navy & Slate Surfaces* | Latar canvas `#0F172A`, permukaan card `#FFFFFF` / `#F8FAFC`, aksen primer Indigo `#4F46E5`, dan semantic tints (Emerald, Amber, Rose). |
| **Tipografi** | Skala Hierarki Tajam | Page Title (28–32px Bold), Section Title (20–24px Semibold), Metric KPI (24–28px Bold), Body Text (14–16px Regular). |
| **Komponen UI** | Base UI + Custom Tokens | Standardisasi tinggi button (`h-9` default, `h-10` lg, `h-11` xl), input ring-focus halus (`ring-3 ring-indigo-500/10`), pill badge dot status. |
| **Layout & Spacing** | *Balanced Whitespace* | App shell `max-w-7xl` terpusat, header *glassmorphism* (`backdrop-blur-md`), grid adaptif desktop 7-kolom kalender & mobile-friendly card stack. |
| **Navigasi Shell** | Linear-Style Grouping | Pembagian kelompok menu yang jelas: **OPERASIONAL** (Ringkasan & Reservasi) dan **KONFIGURASI** (Katalog Layanan, Tim Staf, Jam Kerja, Profil). |

---

## 🏗️ Arsitektur & Alur Sistem

![BookEase Architecture](./public/images/architecture.svg)

```mermaid
sequenceDiagram
    autonumber
    actor Pelanggan as Pelanggan (Guest)
    participant Web as BookEase Web (/book/[slug])
    participant API as Availability Engine
    participant DB as PostgreSQL (Prisma ORM)
    participant Email as Resend Email Service
    actor Owner as Pemilik Bisnis (/dashboard)

    Pelanggan->>Web: 1. Pilih Layanan & Staf Favorit
    Web->>API: 2. Query Slot Bebas (Tanggal Terpilih)
    API->>DB: Periksa Jam Buka, Buffer Time & Booking Aktif
    DB-->>API: Kembalikan Daftar Waktu Tersedia
    API-->>Web: Tampilkan Jam Bebas (e.g. 09:00, 10:00, 11:00)
    Pelanggan->>Web: 3. Isi Kontak & Konfirmasi Reservasi
    Web->>API: 4. POST /api/v1/bookings
    API->>DB: Eksekusi Transaksi ACID (Lock Slot & Generate BK-...)
    DB-->>API: Reservasi Berhasil (Status: CONFIRMED)
    API--)Email: Kirim Notifikasi Email (Non-blocking Asynchronous)
    API-->>Web: Redirect ke Halaman Sukses dengan Ref Code
    Owner->>DB: Buka Dashboard -> Notifikasi Reservasi Masuk Real-Time
```

---

## ✨ Fitur Utama

### 1. Pengalaman Pelanggan (Public Customer Experience)
- **4-Step Booking Wizard**:
  - **Langkah 1 (Layanan)**: Informasi nama layanan, estimasi durasi, dan rincian harga Rupiah.
  - **Langkah 2 (Staf)**: Pilihan staf favorit atau opsi otomatis *"Siapa Saja yang Tersedia (Any Available)"*.
  - **Langkah 3 (Waktu)**: Pemilihan tanggal interaktif dengan kalkulasi slot jam yang otomatis mengecualikan waktu lampau dan slot terisi.
  - **Langkah 4 (Konfirmasi)**: Pengisian nama, email, nomor WhatsApp/telepon, dan catatan tambahan.
- **Sticky Live Summary**: Kartu rincian estimasi biaya dan jadwal yang diperbarui secara dinamis di setiap langkah.
- **Bukti Reservasi Instan**: Kode referensi unik (contoh: `BK-20261109-8F92A1`) dengan fitur satu-klik salin (*copy to clipboard*).
- **Pembatalan Mandiri Terproteksi**: Pelanggan dapat membatalkan janji via tautan khusus (`/book/cancel?ref=...&token=...`).

### 2. Dashboard Pemilik Bisnis (Business Owner Dashboard)
- **Ringkasan Operasional**: Metrik utama total reservasi, jadwal hari ini, layanan tuntas, dan estimasi omzet.
- **Daftar & Kalender Reservasi**:
  - Segmented control toggle antara **Tampilan Tabel** dan **Tampilan Kalender Mingguan**.
  - Filter multi-kolom kata kunci (nama, email, telepon, kode referensi).
  - Filter status kehadiran (`PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`, `NO_SHOW`).
  - Filter tanggal dan pagination server-side.
- **Katalog Layanan**: Tambah, edit, atur durasi pengerjaan, harga, serta kualifikasi staf penanggung jawab.
- **Tim Staf**: Manajemen profil staf, spesialisasi, dan status aktif/cuti.
- **Jam Operasional & Buffer Time**:
  - Pengaturan jam buka dan tutup mingguan (Senin–Minggu) dengan penanda hari libur.
  - Jeda persiapan (*buffer time* 0–60 menit) antar-sesi janji temu.
  - Dukungan zona waktu lokal (`Asia/Jakarta`, `Asia/Makassar`, `Asia/Jayapura`).

---

## 🛠️ Tech Stack

| Lapisan | Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) | Server Components modern, Partial Prerendering (PPR), dan performa edge cepat |
| **Bahasa** | [TypeScript 5](https://www.typescriptlang.org/) | *End-to-end type safety* dari database hingga UI components |
| **UI Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + Base UI | Desain modular, modern tokens, performa tinggi, dan aksesibilitas ramah keyboard |
| **Database** | [PostgreSQL 16](https://www.postgresql.org/) via [Prisma ORM 7](https://www.prisma.io/) | Relasi referensial kuat, integritas ACID, dan migrasi skema deklaratif |
| **Timezone** | [date-fns](https://date-fns.org/) & [date-fns-tz](https://github.com/marnusw/date-fns-tz) | Perhitungan zona waktu lokal Indonesia yang presisi tanpa pergeseran hari UTC |
| **Validasi** | [Zod 4](https://zod.dev/) | Validasi skema runtime pada form client dan payload API route |
| **Email** | [Resend](https://resend.com/) | Pengiriman email transaksional modern dengan fallback graceful dev stub |
| **Testing** | Node.js Test Runner Native (`node:test`) | Eksekusi test suite instan (< 1 detik) tanpa overhead Jest/Vitest |

---

## 🚀 Cara Menjalankan Proyek (Quick Start)

Ikuti langkah-langkah berikut untuk menjalankan BookEase di komputer lokal Anda:

### 1. Prasyarat Sistem
- **Node.js**: Versi `20.x` atau `22.x` (Direkomendasikan Node.js v22+)
- **NPM**: Versi `10.x` ke atas
- **PostgreSQL**: Server PostgreSQL aktif (lokal, Docker, atau cloud seperti Supabase/Neon)
- **Git**

### 2. Klon Repository
```bash
git clone https://github.com/your-username/bookease.git
cd bookease
```

### 3. Salin Environment Variables
Salin file template konfigurasi:
```bash
# Windows (PowerShell)
Copy-Item .env.example .env.local

# Linux / macOS
cp .env.example .env.local
```

Sesuaikan konfigurasi di `.env.local`:
```env
# Koneksi Database PostgreSQL
DATABASE_URL="postgresql://postgres:password_anda@localhost:5432/bookease?schema=public"
DIRECT_URL="postgresql://postgres:password_anda@localhost:5432/bookease?schema=public"

# Kunci Rahasia Sesi (Min. 32 karakter)
AUTH_SECRET="bookease-development-auth-secret-min32characters-key-xyz"

# Kunci Rahasia Token Pembatalan HMAC
CANCELLATION_TOKEN_SECRET="bookease-cancellation-token-secret-min32characters"

# URL Aplikasi Kanonikal
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Kunci API Resend (Opsional - jika kosong otomatis menggunakan dev stub logging)
RESEND_API_KEY=""
EMAIL_FROM="BookEase <noreply@bookease.id>"
```

### 4. Pasang Dependensi
```bash
npm install
```

### 5. Inisialisasi Database & Migrasi Prisma
Pastikan database PostgreSQL `bookease` telah dibuat, lalu jalankan:
```bash
# Generate Prisma Client
npx prisma generate

# Terapkan migrasi ke database lokal Anda
npx prisma migrate dev --name init
```

*(Opsional)* Jalankan seeder untuk memasukkan data awal dummy:
```bash
npx prisma db seed
```

### 6. Jalankan Server Development
```bash
npm run dev
```
Buka browser Anda dan akses:
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Demo Booking Publik**: [http://localhost:3000/book/glow-beauty-studio](http://localhost:3000/book/glow-beauty-studio)
- **Dashboard Bisnis**: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
- **Login Pemilik**: [http://localhost:3000/login](http://localhost:3000/login)

---

## 🔧 Panduan Mengatasi Kendala Database (P1000)

Jika saat menjalankan `npx prisma migrate dev` Anda menemui kendala:
```text
Error: P1000: Authentication failed against database server, the provided database credentials for `postgres` are not valid.
```

Berikut langkah-langkah solusinya:

### Opsi A: Sesuaikan Password PostgreSQL Lokal
1. Periksa password user `postgres` yang Anda tentukan saat instalasi PostgreSQL di komputer Anda.
2. Buka `.env.local`, perbarui baris `DATABASE_URL`:
   ```env
   DATABASE_URL="postgresql://postgres:PASSWORD_ASLI_ANDA@localhost:5432/bookease?schema=public"
   DIRECT_URL="postgresql://postgres:PASSWORD_ASLI_ANDA@localhost:5432/bookease?schema=public"
   ```
3. Pastikan database `bookease` sudah dibuat di pgAdmin / psql:
   ```sql
   CREATE DATABASE bookease;
   ```

### Opsi B: Gunakan PostgreSQL via Docker (Paling Praktis)
Jika Anda tidak ingin mengonfigurasi PostgreSQL manual:
```bash
# Jalankan PostgreSQL via Docker
docker run --name bookease-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=bookease -p 5432:5432 -d postgres:16-alpine

# Jalankan migrasi Prisma
npx prisma migrate dev --name init
```

---

## 🧪 Pengujian & Kualitas Kode

BookEase dilengkapi dengan automated test suite (20 unit, concurrency, dan security tests):

```bash
# Menjalankan seluruh Unit, Concurrency, dan Security Tests (20/20 Passed)
npm test

# Menjalankan pemeriksaan TypeScript Typecheck
npx tsc --noEmit

# Menjalankan ESLint
npm run lint

# Menjalankan simulasi Production Build
npm run build
```

> Rincian pengujian lengkap tersedia pada [**TEST_REPORT.md**](./TEST_REPORT.md).

---

## 🐳 Menjalankan dengan Docker

BookEase menyediakan konfigurasi multi-stage siap pakai menggunakan Docker Compose:

```bash
# Bangun dan jalankan web app beserta database PostgreSQL
docker compose up -d --build

# Terapkan migrasi database di dalam kontainer
docker compose exec app npx prisma migrate deploy

# Periksa status kontainer
docker compose ps
```
Aplikasi dapat langsung diakses melalui [http://localhost:3000](http://localhost:3000).

---

## 📂 Struktur Direktori Proyek

```
bookease/
├── prisma/
│   ├── schema.prisma              # Definisi model database PostgreSQL
│   └── seed.ts                    # Seeder data awal bisnis
├── public/
│   └── images/                    # Visual preview SVG, banner & diagram arsitektur
│       ├── banner.svg             # Banner cover BookEase
│       ├── architecture.svg       # Diagram alur arsitektur sistem
│       ├── dashboard-preview.svg  # Mockup SVG dashboard operasional
│       └── booking-wizard-preview.svg # Mockup SVG alur public booking
├── src/
│   ├── app/                       # Next.js App Router (Turbopack)
│   │   ├── (auth)/                # Route autentikasi (login, register)
│   │   ├── (dashboard)/           # Dashboard bisnis (bookings, services, staff, schedule)
│   │   ├── (marketing)/           # Landing page, fitur, pricing
│   │   ├── api/v1/                # Endpoint REST API publik & bisnis
│   │   ├── book/[slug]/           # Halaman booking publik pelanggan (Guest Wizard)
│   │   └── book/cancel/           # Halaman pembatalan mandiri pelanggan
│   ├── components/                # Reusable UI components & design tokens
│   │   ├── booking/               # Multi-step booking wizard & review card
│   │   ├── dashboard/             # Sidebar, header, stat card
│   │   ├── shared/                # Page header, section card, status badge
│   │   └── ui/                    # Base UI primitives (button, input, table, dialog)
│   ├── features/                  # Modul domain (auth, bookings, services, staff)
│   ├── lib/                       # Utilitas helper (format rupiah, date-fns-tz, HMAC token)
│   └── server/                    # Layanan server-side, policies, & error handling
├── tests/                         # Automated test suite (unit, concurrency, security)
├── Redesign uiux.md               # Spesifikasi & aturan UI/UX SaaS premium
├── DEPLOYMENT_GUIDE.md            # Panduan resmi deploy produksi
├── RELEASE_NOTES.md               # Catatan rilis BookEase v1.0.0
├── TEST_REPORT.md                 # Laporan audit QA & hasil uji otomatis
└── Dockerfile                     # Multi-stage production container image
```

---

## 📡 Skema API & Status Reservasi

### Alur Siklus Status Booking:
```
           ┌───────────┐
           │  PENDING  │ (Reservasi baru dibuat oleh pelanggan)
           └─────┬─────┘
                 │
                 ▼
          ┌─────────────┐
          │  CONFIRMED  │ (Dikonfirmasi oleh pemilik bisnis)
          └──────┬──────┘
                 │
     ┌───────────┼───────────┐
     ▼           ▼           ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│ COMPLETED │ │ CANCELLED │ │  NO_SHOW  │ (Status Terminal - Immutable)
└───────────┘ └───────────┘ └───────────┘
```

### Ringkasan Endpoint REST API:
| Method | Endpoint | Deskripsi | Hak Akses |
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

Proyek ini didistribusikan di bawah lisensi **[MIT License](./LICENSE)**. Silakan gunakan, pelajari, dan kembangkan sesuai kebutuhan bisnis Anda.

---

<div align="center">
  <sub>Dibangun dengan dedikasi untuk memajukan digitalisasi UMKM dan bisnis jasa lokal di Indonesia 🇮🇩</sub>
</div>
