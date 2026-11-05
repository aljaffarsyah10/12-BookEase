# BookEase — Production Deployment Guide

Dokumen panduan resmi deployment dan operasional produksi aplikasi **BookEase** (Online Appointment & Booking Management System untuk Bisnis Jasa Lokal).

---

## 1. Arsitektur Deployment Produksi

### Rekomendasi Utama: Managed Serverless Architecture (SaaS MVP)
Arsitektur ini direkomendasikan untuk skalabilitas tinggi, pemeliharaan minimal, dan biaya operasional yang efisien:

```
[ Pelanggan & Pemilik Bisnis ]
             │
             ▼ HTTPS (Port 443)
┌──────────────────────────────────────────────┐
│ Cloudflare DNS / CDN Edge                    │
│ - WAF & DDoS Mitigation                      │
│ - Global SSL/TLS Termination                 │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│ Vercel Edge & Serverless Functions           │
│ - Next.js 16 (App Router + Turbopack)       │
│ - Static Prerender + Partial Prerendering    │
│ - API Routes (/api/v1/*)                     │
└──────────────┬───────────────────────────────┘
               │
       ┌───────┴────────────────────────┐
       ▼                                ▼
┌───────────────────────────┐    ┌───────────────────────────┐
│ Supabase PostgreSQL       │    │ Resend Email Platform     │
│ - Supavisor Pooler (6543) │    │ - DKIM / SPF Signed       │
│ - Automated Daily Backups │    │ - Transactional Notices   │
│ - Row-level ACID Lock     │    │ - Non-blocking API        │
└───────────────────────────┘    └───────────────────────────┘
```

### Opsi Alternatif: Self-Hosted VPS + Docker Container
Jika bisnis membutuhkan kontrol penuh atas kedaulatan data dan infrastruktur lokal:
- **Server**: Ubuntu 22.04 LTS / Debian 12 (Min. 2 vCPU, 4GB RAM, 40GB SSD)
- **Container**: Docker + Docker Compose (`app` + `db`)
- **Reverse Proxy**: Caddy Server (Automated HTTPS Let's Encrypt) atau Nginx

---

## 2. Persyaratan & Pra-Deployment

Sebelum memulai proses rilis, pastikan akun dan kredensial berikut telah tersedia:
1. **GitHub Repository**: Akses push/admin ke repository BookEase.
2. **Akun Vercel**: Terhubung ke akun GitHub organisasi/developer.
3. **Akun Supabase**: Project baru dengan region terdekat target pelanggan (e.g., `Singapore (ap-southeast-1)` untuk Indonesia).
4. **Akun Resend**: Domain aktif yang telah dikonfigurasi DNS record-nya.
5. **Domain Aktif**: Domain publik (e.g., `bookease.id` atau subdomain).

---

## 3. Konfigurasi Environment Variables

Siapkan variabel lingkungan berikut pada dashboard Vercel (**Settings > Environment Variables**):

| Nama Variabel | Wajib | Contoh Nilai | Keterangan |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Ya** | `postgresql://postgres.[ref]:[pass]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` | URL PostgreSQL dengan Connection Pooling (Port 6543). |
| `DIRECT_URL` | **Ya** | `postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres` | URL koneksi langsung untuk menjalankan migration schema (Port 5432). |
| `AUTH_SECRET` | **Ya** | `6a8f1e2c9b4d7... (min. 32 char)` | Secret kriptografis penandatangan session cookie. Generate via `openssl rand -base64 32`. |
| `CANCELLATION_TOKEN_SECRET` | **Ya** | `8d3c5f1a0e7b2... (min. 32 char)` | Secret penandatangan HMAC-SHA256 cancellation token. |
| `NEXT_PUBLIC_APP_URL` | **Ya** | `https://bookease.id` | URL publik kanonikal website tanpa trailing slash. |
| `RESEND_API_KEY` | Opsional | `re_123456789_abcdef...` | API Key dari dashboard Resend untuk notifikasi email. |
| `EMAIL_FROM` | Opsional | `BookEase <noreply@bookease.id>` | Alamat email pengirim yang sesuai dengan domain di Resend. |
| `NODE_ENV` | **Ya** | `production` | Menjamin error handling aman dan mematikan auth fallback. |

> [!CAUTION]
> Jangan pernah membagikan atau mengunggah nilai `AUTH_SECRET`, `CANCELLATION_TOKEN_SECRET`, atau `DATABASE_URL` ke dalam repository Git publik.

---

## 4. Langkah-Langkah Deployment (Vercel + Supabase)

### Langkah 1: Persiapan Database Supabase
1. Masuk ke dashboard Supabase dan buat project baru di region `ap-southeast-1` (Singapore).
2. Buka menu **Project Settings > Database**.
3. Salin connection string:
   - Pilih tab **Connection pooling** (Mode: `Transaction`, Port: `6543`) untuk `DATABASE_URL`.
   - Pilih tab **Direct connection** (Port: `5432`) untuk `DIRECT_URL`.

### Langkah 2: Menjalankan Database Migration
Jalankan perintah migrasi langsung dari terminal developer terverifikasi ke production database:
```bash
# Set environment variable DIRECT_URL secara temporer
$env:DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# Terapkan seluruh migrasi schema Prisma
npx prisma migrate deploy

# Sinkronkan Prisma Client
npx prisma generate
```

> [!IMPORTANT]
> Jangan pernah menjalankan `npx prisma migrate dev` pada environment produksi karena berisiko memicu database reset atau kehilangan data.

### Langkah 3: Menghubungkan Repository ke Vercel
1. Buka dashboard Vercel, pilih **Add New > Project**, lalu impor repository GitHub BookEase.
2. Pada form konfigurasi:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `prisma generate && next build`
   - **Install Command**: `npm ci`
3. Masukkan seluruh Environment Variables dari Bagian 3.
4. Klik tombol **Deploy** dan pantau build log hingga status berubah menjadi **Ready**.

### Langkah 4: Konfigurasi Custom Domain & DNS
1. Pada project Vercel, masuk ke **Settings > Domains**.
2. Masukkan domain utama, misalnya `bookease.id` dan `www.bookease.id`.
3. Masuk ke dashboard DNS provider Anda (Cloudflare, Niagahoster, Domainesia, dsb.), lalu tambahkan DNS Records:
   - **A Record**: `@` mengarah ke IP Vercel `76.76.21.21`
   - **CNAME Record**: `www` mengarah ke `cname.vercel-dns.com`
4. Tunggu propagasi DNS (biasanya 5–15 menit). Vercel akan menerbitkan sertifikat SSL/TLS gratis otomatis dari Let's Encrypt.

### Langkah 5: Konfigurasi Domain Email di Resend
1. Masuk ke dashboard Resend, buka menu **Domains > Add Domain**.
2. Daftarkan domain `bookease.id`.
3. Tambahkan 3 DNS records yang diberikan oleh Resend:
   - **TXT Record** untuk verifikasi domain (`resend._domainkey`)
   - **TXT Record** untuk SPF (`v=spf1 include:amazonses.com ~all`)
   - **MX Record** untuk bounce handling (`feedback-smtp.us-east-1.amazonses.com`)
4. Klik **Verify Domain** hingga status berlabel hijau **Verified**.

---

## 5. Deployment Alternatif (VPS + Docker)

Jika menggunakan VPS mandiri, ikuti prosedur berikut:

1. Klon repository ke server VPS:
   ```bash
   git clone https://github.com/your-org/bookease.git /opt/bookease
   cd /opt/bookease
   ```
2. Buat file `.env` di server:
   ```bash
   cp .env.example .env
   nano .env
   ```
3. Bangun dan jalankan container dengan Docker Compose:
   ```bash
   docker compose up -d --build
   ```
4. Jalankan migrasi di dalam container:
   ```bash
   docker compose exec app npx prisma migrate deploy
   ```
5. Gunakan Caddy Server untuk reverse proxy otomatis HTTPS:
   ```caddy
   bookease.id {
       reverse_proxy localhost:3000
   }
   ```

---

## 6. Prosedur Backup & Restore Database

### Kebijakan Backup (Backup Policy)
- **Supabase Automated Daily Backups**: Aktif otomatis setiap 24 jam dengan retensi minimal 7 hari (Tier Free/Pro).
- **Point-in-Time Recovery (PITR)**: Dapat diaktifkan pada Pro tier untuk rollback per detik jika terjadi insiden korupsi data.

### Manual Backup (Logical Dump)
Jalankan dump data terjadwal via cron atau sebelum deployment besar:
```bash
# Ekspor snapshot database ke file SQL terkompresi
pg_dump "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" \
  -F c -b -v -f "bookease_backup_$(date +%Y%m%d_%H%M%S).dump"
```

### Prosedur Pemulihan (Disaster Recovery / Restore)
Jika terjadi insiden kehilangan data:
```bash
# Restore snapshot dari file dump ke database target
pg_restore -d "postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres" \
  --clean --if-exists -v "bookease_backup_20261106_000000.dump"
```

---

## 7. Monitoring, Logging & Observability

1. **Application Health & Edge Logs**:
   - Buka **Vercel Dashboard > Logs** untuk memantau request real-time, error rate 5xx, dan latency response serverless function.
2. **Database Performance**:
   - Buka **Supabase Dashboard > Database > Query Performance** untuk mengidentifikasi slow queries (> 200ms) atau lonjakan koneksi pooler.
3. **Email Delivery Telemetry**:
   - Pantau status keterkiriman email di **Resend Dashboard > Emails** untuk melihat status *Delivered*, *Opened*, *Bounced*, atau *Spam Complaints*.

---

## 8. Rollback Procedure

Jika rilis versi baru mengalami bug kritis di production:
1. **Instant Frontend Rollback**:
   - Buka **Vercel Dashboard > Deployments**.
   - Cari deployment sebelumnya yang stabil, klik ikon tiga titik (`...`), lalu pilih **Redeploy** / **Promote to Production**. Rollback instan selesai dalam waktu < 5 detik.
2. **Database Rollback**:
   - Jika terdapat migrasi skema yang memicu isu, pulihkan snapshot database menggunakan perintah `pg_restore` dari backup sebelum rilis.

---

## 9. Panduan Troubleshooting Masalah Umum

| Gejala Masalah | Kemungkinan Penyebab | Tindakan Solusi |
| :--- | :--- | :--- |
| Error `P1001: Can't reach database server` | Firewall database atau kuota koneksi habis. | Pastikan menggunakan port pooler `6543` dengan parameter `?pgbouncer=true` pada `DATABASE_URL`. |
| Error `401 Unauthorized` pada sesi login | `AUTH_SECRET` tidak sinkron atau format cookie ditolak. | Pastikan `AUTH_SECRET` terisi dengan string acak >= 32 karakter dan browser mengakses via protokol HTTPS. |
| Status booking conflict `409` berulang | Jadwal staf bentrok pada interval yang sama. | Pastikan buffer time diperhitungkan dan periksa riwayat booking aktif staf terkait di tabel `bookings`. |
| Email konfirmasi tidak diterima | Domain belum diverifikasi di Resend atau kuota tercapai. | Cek status domain di Resend dashboard, verifikasi SPF/DKIM record di DNS domain, atau periksa folder spam pelanggan. |
| Tautan pembatalan `403 Forbidden` | Token signature tidak cocok atau URL terpotong. | Verifikasi bahwa token dibuat menggunakan algoritma HMAC-SHA256 dengan secret `CANCELLATION_TOKEN_SECRET` yang persisten. |

