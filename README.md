<div align="center">

![BookEase Banner](./public/images/banner.svg)

# BookEase — Online Appointment & Booking SaaS Platform

**Platform Manajemen Reservasi, Penjadwalan Janji Temu, dan Ekosistem Bisnis Jasa Berbasis Cloud**

[![Next.js](https://img.shields.io/badge/Next.js-16.4.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Base UI](https://img.shields.io/badge/Base_UI-Primitives-4f46e5?style=flat-square)](https://base-ui.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-7.10-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Tests](https://img.shields.io/badge/Tests-55%2F55%20Passed-emerald?style=flat-square&logo=node.js)](./TEST_REPORT.md)
[![Turbopack Build](https://img.shields.io/badge/Build-46%20Routes%20Clean-success?style=flat-square&logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](#-lisensi)

[Tampilan Visual](#-tampilan-visual-aplikasi) • [Arsitektur Sistem](#-arsitektur--alur-sistem-saas-v100) • [Fitur Utama](#-fitur-utama) • [Model Bisnis SaaS](#-model-bisnis-saas--billing-sandbox) • [Observability & Health Checks](#-sistem-monitoring--observability) • [Cara Menjalankan](#-cara-menjalankan-proyek-quick-start) • [Dokumentasi Lengkap](#-dokumentasi-teknis--sop-produksi)

</div>

---

## 📖 Tentang BookEase

**BookEase** adalah platform *Software-as-a-Service* (SaaS) modern yang dibangun khusus untuk mendigitalkan dan mengotomatisasi operasional bisnis jasa di Indonesia (seperti Barbershop, Salon Kecantikan, Klinik Estetika, Studio Foto, Fisioterapi, Pusat Kebugaran, dan Konsultan Independen).

BookEase menghilangkan inefisiensi pencatatan manual via chat WhatsApp atau buku kertas dengan menghadirkan **halaman pemesanan mandiri publik (`/book/[slug]`)**, **pencegahan double booking bergaransi atomik**, **alokasi staf fleksibel**, **sistem langganan dengan masa uji coba 14 hari**, dan **gateway pembayaran Sandbox (QRIS, Virtual Account, Kartu Kredit)**.

---

## 📸 Tampilan Visual Aplikasi

### 1. Dashboard Operasional Pemilik Bisnis
Antarmuka manajemen terpusat dengan navigasi terstruktur gaya *Linear*, ringkasan KPI harian, daftar reservasi real-time, dan status operasional hari ini.

![BookEase Dashboard Preview](./public/images/dashboard-preview.svg)

---

### 2. Public Guest Booking Wizard (`/book/[slug]`)
Alur reservasi 4-langkah yang intuitif tanpa mewajibkan pelanggan membuat akun atau mengingat kata sandi (*Zero-Friction Checkout*).

![BookEase Booking Wizard Preview](./public/images/booking-wizard-preview.svg)

---

### 3. Langganan & Billing SaaS Dashboard (`/dashboard/billing`)
Manajemen paket berlangganan lengkap dengan meteran pemakaian kuota real-time (Layanan, Staf, Kuota Reservasi), simulator pembayaran Sandbox instan, dan riwayat faktur siap cetak.

![BookEase Billing Preview](./public/images/billing-preview.svg)

---

### 4. Sistem Monitoring & Observability (`/api/health`)
Telemetri performa aplikasi, latensi database PostgreSQL real-time, sensor konsumsi memori heap, dan structured JSON logging dengan PII masking otomatis.

![BookEase Observability Preview](./public/images/observability-preview.svg)

---

## 🏗️ Arsitektur & Alur Sistem SaaS v1.0.0

Arsitektur aplikasi terbagi menjadi 4 pilar yang saling terisolasi dengan aman:

![BookEase Architecture](./public/images/architecture.svg)

### Diagram Alur Reservasi Mandiri (Guest Booking Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Pelanggan as Pelanggan (Guest)
    participant Web as BookEase Web (/book/[slug])
    participant API as Availability Engine
    participant DB as PostgreSQL (Prisma ORM)
    participant Email as Resend Email Service
    actor Owner as Pemilik Bisnis (/dashboard)

    Pelanggan->>Web: 1. Pilih Layanan & Staf (Favorit atau Siapa Saja)
    Web->>API: 2. Query Slot Bebas (Tanggal Terpilih)
    API->>DB: Periksa Jam Operasional, Buffer Time & Booking Aktif
    DB-->>API: Kembalikan Daftar Jam Bebas
    API-->>Web: Tampilkan Jam Ketersediaan (e.g. 09:00, 10:00, 11:00)
    Pelanggan->>Web: 3. Isi Kontak & Konfirmasi Reservasi
    Web->>API: 4. POST /api/v1/bookings
    API->>DB: Eksekusi Transaksi ACID (Lock Slot & Generate BK-...)
    DB-->>API: Reservasi Berhasil (Status: CONFIRMED)
    API--)Email: Kirim Notifikasi Email Asynchronous (Resend)
    API-->>Web: Redirect ke Halaman Sukses dengan Kode Referensi & HMAC Token
    Owner->>DB: Buka Dashboard -> Notifikasi Reservasi Masuk Real-Time
```

---

## ✨ Fitur Utama

### 1. Mesin Penjadwalan & Anti-Double Booking
- **Kalkulasi Slot Ketersediaan Dinamis**: Mengalkulasi interval waktu layanan ditambah *buffer time* pembersihan antar pelanggan.
- **Konversi Multi-Zona Waktu Akurat**: Mendukung penuh WIB (`UTC+7`), WITA (`UTC+8`), dan WIT (`UTC+9`) dengan penyimpanan UTC presisi.
- **Pencegahan Double-Booking Atomik**: Kueri transaksi ACID mengunci slot waktu secara konsisten untuk mencegah konflik pemesanan bersamaan.

### 2. Multi-Tenant Workspace & Keamanan Mutlak
- **Isolasi Data Penyewa (Tenant Isolation)**: Seluruh data layanan, staf, jadwal, dan reservasi terikat ketat ke `businessId`.
- **Token Pembatalan Kriptografis**: Pelanggan dapat membatalkan reservasi secara mandiri melalui tautan bertanda tangan HMAC-SHA256 tanpa perlu login.
- **Proteksi CSRF Origin & Rate Limiting**: Memverifikasi header `Origin` pada setiap mutasi API dan membatasi *request flood*.
- **Penyensoran Data Sensitif (PII Masking)**: Informasi kredensial, token, dan kartu kredit disensor otomatis dari log sistem.

### 3. Model Bisnis SaaS & Billing Sandbox
- **Uji Coba Gratis 14 Hari (Free Trial)**: Otomatis aktif saat pendaftaran baru tanpa memerlukan kartu kredit.
- **Tingkatan Paket Fleksibel**:
  - **Starter** (`Rp 99.000 / bln`): 2 staf, 5 layanan, 100 reservasi/bulan.
  - **Pro Business** (`Rp 199.000 / bln`): 10 staf, 30 layanan, 500 reservasi/bulan, analitik lengkap, email otomatis.
  - **Enterprise** (`Rp 499.000 / bln`): Kuota tanpa batas, prioritas dukungan 24/7.
- **Penegakan Batas Kuota (Usage Limit Guards)**: Sistem secara otomatis menjaga agar pembuatan staf, layanan, dan booking mematuhi limit paket yang aktif.
- **Simulator Pembayaran Sandbox**: Pengujian instan metode QRIS, BCA VA, Mandiri VA, BNI/BRI VA, dan Kartu Kredit dengan webhook listener terintegrasi.

### 4. Observability, Alerting & Health Probes
- **Structured JSON Logging**: Log terstruktur dengan correlation ID unik (`requestId`) dan format JSON single-line di produksi.
- **Pemeriksaan Kesehatan Aplikasi**:
  - `/api/health`: Status operasional menyeluruh (Database latency, alokasi memori, metrik performa).
  - `/api/health/live`: Probe liveness container Docker/Kubernetes.
  - `/api/health/ready`: Probe readiness memastikan koneksi database siap melayani traffic.
- **Sistem Alert Otomatis**: Mendeteksi lonjakan error server beruntun (5xx), latensi database tinggi ($> 500\text{ ms}$), dan konsumsi memori tinggi ($> 90\%$) dengan jeda debouncing 10 menit.

### 5. Pencadangan & Pemulihan Basis Data (Disaster Recovery)
- **Snapshot Otomatis**: Ekspor seluruh tabel relasional ke format JSON terstruktur.
- **Verifikasi Integritas SHA-256**: Setiap berkas cadangan dilengkapi *checksum* kriptografis untuk mencegah korupsi data.
- **Rotasi Retensi 7 Hari**: Arsip cadangan lama dibersihkan secara otomatis.
- **Perintah Eksekusi Cepat**: `npm run db:backup`.

### 6. Optimasi Produksi, SEO & Aksesibilitas
- **Dynamic Sitemap XML (`/sitemap.xml`)**: Secara dinamis mengindeks rute statis serta seluruh halaman bisnis publik (`/book/[slug]`).
- **Structured Data (Schema.org JSON-LD)**: `SoftwareApplication`, `Organization`, dan `LocalBusiness` terpasang untuk Google Rich Results.
- **Web App Manifest (`/manifest.webmanifest`)**: Siap diinstalasi sebagai Progressive Web App (PWA).
- **Aksesibilitas WCAG AA**: Tautan *Skip to main content* dan rasio kontras warna standar internasional.
- **Docker Containerization**: Multi-stage `Dockerfile` (`node:22-alpine`) dengan non-root user `nextjs:nodejs`.

---

## 🚀 Cara Menjalankan Proyek (Quick Start)

### 1. Prasyarat Sistem
- Node.js v20.x atau v22.x LTS
- PostgreSQL 15+ (Lokal, Docker, Supabase, atau Neon)

### 2. Kloning Repositori & Instalasi Dependensi
```bash
git clone https://github.com/aljaffarsyah10/12-BookEase.git
cd 12-BookEase
npm install
```

### 3. Konfigurasi Variabel Lingkungan
Salin file konfigurasi contoh:
```bash
cp .env.example .env.local
```
Sesuaikan parameter utama di `.env.local`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bookease?schema=public"
AUTH_SECRET="kunci-rahasia-autentikasi-minimal-32-karakter-acak"
CANCELLATION_TOKEN_SECRET="kunci-rahasia-cancellation-minimal-32-karakter"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Sinkronisasi Basis Data & Seed Data Awal
```bash
npx prisma generate
npx prisma db push
npm run db:seed
```
*Akun Demo bawaan: `budi@glowstudio.id` / `Password123`*

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Pengujian & Validasi Kualitas (Quality Assurance)

Proyek ini dilengkapi rangkaian pengujian otomatis komprehensif tanpa dependensi eksternal yang lambat:

```bash
# 1. Menjalankan seluruh test suites (55 automated tests)
npm test

# 2. Menjalankan pemeriksaan linter ESLint
npm run lint

# 3. Menjalankan verifikasi tipe data TypeScript
npx tsc --noEmit

# 4. Menjalankan build produksi Next.js Turbopack (46 rute)
npm run build

# 5. Menjalankan uji asap produksi (Smoke Test)
npm run test:smoke

# 6. Menjalankan pencadangan basis data otomatis
npm run db:backup
```

---

## 🐳 Menjalankan dengan Docker

BookEase menyediakan multi-stage `Dockerfile` siap pakai untuk containerization:

```bash
# Build Docker Image
docker build -t bookease:latest .

# Jalankan Container
docker run -d \
  --name bookease-app \
  -p 3000:3000 \
  --env-file .env.local \
  bookease:latest
```

---

## 📚 Dokumentasi Teknis & SOP Produksi

Seluruh panduan teknis mendalam tersedia lengkap di direktori `docs/`:

- 📘 **[Dokumentasi Lengkap API (REST API Spec)](./docs/API_DOCUMENTATION.md)**: Spesifikasi endpoint, parameter, dan kode status.
- 🚀 **[Panduan Deployment Produksi](./docs/PRODUCTION_DEPLOYMENT_GUIDE.md)**: Prosedur rilis ke Vercel, Docker, dan VPS Ubuntu Nginx.
- ⚙️ **[Konfigurasi Variabel Lingkungan](./docs/ENVIRONMENT_CONFIGURATION.md)**: Referensi lengkap setiap variabel environment.
- ✅ **[Daftar Periksa Pra-Produksi (Go-Live Checklist)](./docs/PRODUCTION_CHECKLIST.md)**: Audit keamanan, performa, dan reliabilitas.
- 🛡️ **[Strategi Rollback Darurat](./docs/ROLLBACK_STRATEGY.md)**: SOP pemulihan instan jika terjadi insiden rilis.
- 📈 **[Pemantauan Pasca-Rilis (Post-Launch Monitoring)](./docs/POST_LAUNCH_MONITORING.md)**: Pemantauan 4 sinyal emas SRE dan eskalasi P1–P4.
- 🗺️ **[Peta Jalan Produk (Product Roadmap)](./docs/PRODUCT_ROADMAP.md)**: Roadmap pengembangan Q1 2027 s/d Q4 2027.
- 📝 **[Catatan Rilis v1.0.0 (Release Notes)](./docs/RELEASE_NOTES_v1.0.0.md)**: Ringkasan changelog dan spesifikasi rilis publik.

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi **MIT**. Silakan tinjau berkas [LICENSE](./LICENSE) untuk detail lengkap.

---

<div align="center">
  <b>BookEase Indonesia</b> • Solusi Cerdas Reservasi Bisnis Jasa Anda
</div>
