# Release Notes — BookEase v1.0.0 (Production Release)

**Tanggal Rilis**: 5 November 2026  
**Status**: General Availability (GA) — Production Ready  
**Target Pengguna**: Pemilik Bisnis Jasa Lokal (Barbershop, Salon Kecantikan, Klinik Perawatan, Studio Foto, dsb.) & Pelanggan Akhir.

---

## 1. Ikhtisar Produk (Product Overview)

**BookEase** adalah aplikasi web modern berbasis cloud untuk manajemen reservasi dan janji temu online yang dirancang khusus bagi penyedia jasa lokal di Indonesia. BookEase mengeliminasi friksi pencatatan manual via chat atau buku kas dengan menghadirkan:
- **Bagi Pemilik Bisnis**: Dashboard terintegrasi untuk mengatur katalog layanan, staf, jadwal operasional, rekap pendapatan estimasi, kalender mingguan, serta manajemen status kehadiran pelanggan.
- **Bagi Pelanggan**: Halaman publik responsif tanpa kewajiban registrasi akun (*frictionless guest booking*) yang memungkinkan pelanggan memilih layanan, staf, tanggal, dan slot jam janji temu secara mandiri dalam hitungan menit.

---

## 2. Fitur Utama yang Dirilis (Features Delivered)

### A. Autentikasi & Profil Bisnis (Owner Onboarding)
- **Registrasi & Login Aman (FR-01 & FR-02)**: Menggunakan cookie sesi terenkripsi dengan proteksi `httpOnly`, `sameSite`, dan `secure`. Password di-hash menggunakan `bcryptjs` 12 salt rounds.
- **Slug URL Unik**: Setiap bisnis memiliki URL publik eksklusif (contoh: `bookease.id/book/barbershop-pangkas-rapi`).
- **Workspace Bisnis (FR-05)**: Pengaturan nama bisnis, kategori, nomor kontak, alamat fisik, logo, zona waktu regional, dan jeda istirahat antar-janji temu (*buffer time*).

### B. Katalog Layanan & Staf (Service & Staff Management)
- **Layanan Jasa (FR-03)**: CRUD layanan dengan detail nama, deskripsi, harga dalam Rupiah bulat, estimasi durasi (5–480 menit), serta alokasi staf penanggung jawab.
- **Tim Staf / Terapis / Kapster (FR-04)**: CRUD profil staf, titel/peran, bio singkat, status aktif/nonaktif, dan penugasan layanan.

### C. Jam Operasional & Mesin Ketersediaan Slot (Availability Engine)
- **Jam Buka & Libur Mingguan (FR-06)**: Konfigurasi jam operasional per hari (Minggu s/d Sabtu) dengan toggle libur (*isClosed*).
- **Timezone Awareness Multi-Region**: Kompatibilitas penuh zona waktu Indonesia (`Asia/Jakarta` WIB, `Asia/Makassar` WITA, `Asia/Jayapura` WIT) dengan penyimpanan waktu presisi UTC.
- **Dynamic Slot Generator (FR-08)**: Menghitung slot waktu janji temu yang valid, mengeliminasi waktu di masa lalu, jam istirahat, dan waktu yang telah terisi.

### D. Alur Reservasi Mandiri Pelanggan (Guest Booking Wizard)
- **Multi-Step Booking Wizard (FR-07 & FR-09)**: Alur 4 langkah intuitif (Pilih Layanan $\rightarrow$ Pilih Staf / "Staf Mana Saja" $\rightarrow$ Pilih Tanggal & Waktu $\rightarrow$ Data Kontak & Konfirmasi).
- **Auto-Allocation Staf Bebas**: Sistem otomatis mencarikan staf yang tidak bertabrakan jadwal saat pelanggan memilih opsi fleksibel.
- **Kode Referensi Unik (FR-13)**: Pembuatan kode referensi terstruktur `BK-YYYYMMDD-XXXXXX` untuk bukti reservasi.
- **Halaman Sukses**: Rincian janji temu, instruksi kedatangan, serta tautan pembatalan langsung bagi pelanggan.

### E. Manajemen Reservasi & Dashboard Owner
- **Dashboard Overview (FR-14)**: Ringkasan metrik statistik harian (Total Bookings, Booking Hari Ini, Booking Mendatang, Layanan Selesai, dan Estimasi Pendapatan).
- **Daftar Booking Interaktif (FR-10)**: Filter pencarian cepat (nama, email, telepon, kode referensi), filter status dropdown, filter tanggal, dan server-side pagination.
- **Kalender Reservasi Mingguan**: Tampilan visual jadwal mingguan (*Table* vs *Calendar* switch) dengan badge status kehadiran berwarna dan aksi cepat ubah status.
- **Detail Booking Lengkap (FR-11)**: Snapshot permanen harga dan durasi layanan saat pemesanan, catatan pelanggan, riwayat tanggal, dan transisi status.
- **State Machine Terproteksi**: Transisi terverifikasi (`PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `COMPLETED` / `CANCELLED` / `NO_SHOW`). Status final bersifat immutable.

### F. Fitur Tambahan & Penyempurnaan (Phase 8 Completion)
- **Customer Self-Service Cancellation**: Pembatalan reservasi mandiri oleh pelanggan melalui tautan aman ber-signature HMAC-SHA256 (`/book/cancel`).
- **Buffer Time Enforcement**: Jeda waktu persiapan/istirahat antar-sesi secara otomatis memperluas interval proteksi slot booking aktif.
- **Notifikasi Email Transaksional**: Integrasi dengan `resend` untuk konfirmasi pembuatan booking dan pembatalan dengan fallback non-blocking yang andal.
- **SEO & Social Sharing Ready**: Dukungan `metadataBase`, dynamic OpenGraph tags pada halaman profil bisnis publik, `robots.ts` (dashboard terproteksi `noindex`), dan `sitemap.ts`.

---

## 3. Metrik Kualitas & Keamanan (Quality Assurance)

- **Test Suite Otomatis**: **20/20 Test Cases Passed (100%)** mencakup logic overlap konkurensi, timezone offset, transisi status, token tampering, sanitasi Zod, dan rate limiting.
- **Static Typing**: 0 TypeScript errors (`npx tsc --noEmit`).
- **Linting & Code Style**: 0 ESLint errors (`npm run lint`).
- **Production Artifacts**: 35 rute Next.js (Static, Partial Prerendering, dan Dynamic Serverless) berhasil terkompilasi optimal via Turbopack.
- **Multi-Tenant Protection**: Setiap endpoint data internal menerapkan isolasi `businessId`, mencegah kerentanan IDOR (Insecure Direct Object Reference).
- **Session Hardening**: Fallback dev otomatis dimatikan saat `NODE_ENV === "production"`, mewajibkan autentikasi ketat.

---

## 4. Batasan Ruang Lingkup MVP (Known Limitations)

Sesuai dengan kesepakatan spesifikasi PRD Playbook, batasan fitur pada versi 1.0.0 ini meliputi:
1. **Single-Branch Only**: Setiap akun pemilik bisnis mengelola satu lokasi outlet fisik.
2. **Guest Checkout Model**: Pelanggan tidak memerlukan pendaftaran akun pengguna atau password; konfirmasi dan pembatalan dilakukan melalui kode referensi dan token aman.
3. **Pembayaran Langsung (Manual / Cash on Arrival)**: Belum terhubung dengan payment gateway otomatis. Pembayaran dilakukan pelanggan di lokasi atau via transfer langsung ke pemilik bisnis.
4. **Email Notification**: Notifikasi utama dikirimkan melalui email (Resend); integrasi WhatsApp Gateway direncanakan untuk versi mendatang.

---

## 5. Rencana Pengembangan Selanjutnya (Future Roadmap)

- **v1.1.0 — Integrasi Payment Gateway**: Pembayaran DP (Down Payment) atau pelunasan di muka via QRIS, Virtual Account, dan E-Wallet (Midtrans / Xendit).
- **v1.2.0 — Notifikasi WhatsApp Otomatis**: Pengiriman reminder janji temu H-1 dan H-2 jam langsung ke WhatsApp pelanggan.
- **v1.3.0 — Customer Self-Service Portal**: Riwayat reservasi pelanggan berbasis login OTP nomor telepon / WhatsApp.
- **v1.4.0 — Multi-Location / Multi-Branch**: Pengelolaan banyak cabang bisnis dalam satu dashboard induk organisasi.

