# Daftar Periksa Pra-Produksi (Production Go-Live Checklist) - BookEase

Daftar periksa komprehensif sebelum merilis platform **BookEase** ke publik atau lingkungan produksi komersial.

---

## 1. Keamanan & Autentikasi (Security)

- [x] Kunci `AUTH_SECRET` dikonfigurasi dengan panjang $\ge 32$ karakter acak.
- [x] Kunci `CANCELLATION_TOKEN_SECRET` dikonfigurasi dengan panjang $\ge 32$ karakter acak.
- [x] Enkripsi kata sandi menggunakan `bcryptjs` dengan *salt rounds* $\ge 12$.
- [x] Sesi autentikasi menggunakan cookie `HttpOnly`, `SameSite=Lax`, dan flag `Secure` aktif di HTTPS.
- [x] Proteksi CSRF memverifikasi header `Origin` / `Referer` pada setiap mutasi API (`POST`, `PATCH`, `DELETE`).
- [x] PII Masking aktif pada structured logger (informasi sandi, token, dan kartu kredit disensor otomatis).
- [x] Security HTTP Headers aktif di `next.config.ts` (`HSTS`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Permissions-Policy`).
- [x] *Tenant Isolation* terverifikasi: Seluruh kueri database membatasi data berdasarkan `businessId`.

---

## 2. Basis Data & Ketahanan (Database & Disaster Recovery)

- [x] Skema database telah disinkronkan dengan `npx prisma db push` atau `npx prisma migrate deploy`.
- [x] Connection Pooling (PgBouncer) aktif untuk mencegah lonjakan koneksi serverless.
- [x] Skrip pencadangan otomatis `scripts/backup-database.cjs` telah diuji dan menghasilkan *checksum* SHA-256 yang valid.
- [x] Skrip pemulihan darurat `scripts/restore-database.cjs` telah diuji.
- [x] Cron job harian untuk `npm run db:backup` telah dijadwalkan pada pukul 02:00 WIB.
- [x] Retensi otomatis 7 hari aktif untuk menjaga kapasitas disk server.

---

## 3. SEO, Metadata & Media Sosial

- [x] File `robots.txt` aktif di `/robots.txt` dengan izin perayapan halaman publik dan pemblokiran `/dashboard/` & `/api/`.
- [x] Dynamic `sitemap.xml` aktif di `/sitemap.xml` yang secara otomatis mengindeks seluruh halaman publik dan bisnis terdaftar (`/book/{slug}`).
- [x] Open Graph & Twitter Cards terkonfigurasi dengan `title`, `description`, `url`, dan `locale: "id_ID"`.
- [x] Schema.org Structured Data (`SoftwareApplication`, `Organization`, dan `LocalBusiness`) terpasang untuk Google Rich Results.
- [x] Web App Manifest aktif di `/manifest.webmanifest` dengan tema warna `#4f46e5`.
- [x] Canonical URL terpasang di setiap halaman untuk mencegah isu *duplicate content*.

---

## 4. Aksesibilitas & Responsivitas (A11y & Mobile)

- [x] Tautan *Skip to main content* terpasang di `src/app/layout.tsx` untuk pengguna pembaca layar (*screen reader*).
- [x] Seluruh tombol dan kontrol interaktif memiliki `aria-label` yang deskriptif.
- [x] Rasio kontras warna teks terhadap latar belakang memenuhi standar WCAG AA.
- [x] Tata letak responsif teruji di perangkat Mobile (320px–480px), Tablet (768px), dan Desktop (1024px+).
- [x] Dialog modal dapat ditutup dengan tombol keyboard `Esc` dan mengunci fokus navigasi saat terbuka.

---

## 5. Pemantauan & Observability

- [x] Endpoint pemeriksaan kesehatan aktif:
  - `/api/health` (Laporan status menyeluruh)
  - `/api/health/live` (Liveness container probe)
  - `/api/health/ready` (Readiness database probe)
- [x] Error Tracker in-memory aktif untuk mengelompokkan error berdasarkan *fingerprint* dan *breadcrumbs*.
- [x] Fallback Error Boundaries (`src/app/error.tsx` & `src/app/global-error.tsx`) siap menangani error runtime tanpa menampilkan layar putih kosong (*blank screen*).
- [x] Webhook alert terkonfigurasi ke saluran komunikasi pengembang (`ALERT_WEBHOOK_URL`).

---

## 6. Kualitas Kode & Otomasi CI/CD

- [x] Seluruh pengujian otomatis lulus 100% (`npm test` — 55 tests, 10 suites).
- [x] Type checking TypeScript lulus tanpa error (`npx tsc --noEmit`).
- [x] Linter ESLint lulus tanpa peringatan atau error (`npm run lint`).
- [x] Next.js Turbopack build berhasil mengompilasi 45 rute produksi (`npm run build`).
