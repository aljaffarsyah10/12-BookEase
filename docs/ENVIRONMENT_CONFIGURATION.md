# Konfigurasi Environment Variables - BookEase

Dokumen ini mendetailkan setiap variabel lingkungan (*environment variables*) yang dibutuhkan oleh platform **BookEase** di lingkungan *Development*, *Staging*, dan *Production*.

---

## 1. Daftar Variabel Lingkungan

| Nama Variabel | Wajib? | Default / Format | Deskripsi |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | **Ya** | `postgresql://user:pass@host:port/db?schema=public` | URL koneksi utama PostgreSQL (gunakan pooled connection di serverless). |
| `DIRECT_URL` | Opsional | `postgresql://user:pass@host:5432/db` | Koneksi langsung untuk eksekusi migrasi database Prisma. |
| `AUTH_SECRET` | **Ya** | Minimal 32 karakter | Kunci enkripsi & tanda tangan HMAC-SHA256 untuk sesi login pengguna. |
| `SESSION_SECRET` | Opsional | Minimal 32 karakter | Alternatif fallback untuk `AUTH_SECRET`. |
| `CANCELLATION_TOKEN_SECRET` | **Ya** | Minimal 32 karakter | Kunci rahasia HMAC untuk token pembatalan reservasi mandiri pelanggan. |
| `NEXT_PUBLIC_APP_URL` | **Ya** | `https://bookease.id` | Domain kanonikal aplikasi tanpa tanda garis miring di akhir. |
| `RESEND_API_KEY` | Opsional* | `re_...` | API Key pengiriman email notifikasi via Resend. (*Wajib jika email aktif). |
| `RESEND_FROM_EMAIL` | Opsional | `BookEase <notifications@bookease.id>` | Alamat email pengirim (domain harus terverifikasi di Resend). |
| `LOG_LEVEL` | Opsional | `INFO` (prod), `DEBUG` (dev) | Ambang batas pencatatan log terstruktur (`DEBUG`, `INFO`, `WARN`, `ERROR`, `FATAL`). |
| `ALERT_WEBHOOK_URL` | Opsional | `https://example.com/webhook/alerts` | Webhook URL untuk pengiriman notifikasi alert otomatis (Slack / Discord / Teams). |
| `PAYMENT_GATEWAY_MODE` | Opsional | `SANDBOX` | Mode gateway pembayaran (`SANDBOX` untuk pengujian, `PRODUCTION` untuk live). |
| `REDIS_URL` | Opsional | `rediss://default:pass@endpoint:port` | URL Redis/Upstash untuk cache terdistribusi (otomatis fallback ke in-memory cache). |

---

## 2. Cara Menghasilkan Kunci Rahasia Aman

Kunci sesi (`AUTH_SECRET`) dan token pembatalan (`CANCELLATION_TOKEN_SECRET`) **wajib memiliki panjang minimal 32 karakter** di lingkungan produksi. Jika kurang, sistem akan melempar fatal error demi keamanan.

### Menggunakan OpenSSL:
```bash
openssl rand -base64 32
```

### Menggunakan Node.js CLI:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 3. Praktik Terbaik Keamanan

1. **Jangan Pernah Meng-commit File `.env`**:
   Pastikan file `.env`, `.env.local`, dan `.env.production` selalu ada di dalam `.gitignore`. Hanya file `.env.example` yang boleh tersimpan di repositori Git.
2. **Rotasi Kunci Berkala**:
   Ganti nilai `AUTH_SECRET` dan `CANCELLATION_TOKEN_SECRET` setiap 90 hari atau segera jika dicurigai ada kebocoran kredensial.
3. **Connection Pooling Database**:
   Saat menggunakan runtime serverless (seperti Vercel atau AWS Lambda), selalu aktifkan PgBouncer / Connection Pooler pada database PostgreSQL untuk menghindari *exhaustion connection limit*.
