# Panduan Deployment Produksi (Production Deployment Guide) - BookEase

Dokumen ini memandu proses deployment platform **BookEase** ke lingkungan produksi dengan keandalan tinggi, performa optimal, dan keamanan maksimal.

---

## 1. Prasyarat Sistem

- **Node.js**: v20.x atau v22.x LTS
- **Database**: PostgreSQL 15+ (Didukung oleh Supabase, Neon, AWS RDS, DigitalOcean Managed Database)
- **Email Service**: Resend API account dengan domain terverifikasi
- **Domain**: Nama domain aktif dengan akses pengelolaan DNS

---

## 2. Opsi Deployment

### Opsi A: Vercel (Sangat Direkomendasikan)

1. **Hubungkan Repositori GitHub**:
   - Masuk ke dashboard [Vercel](https://vercel.com).
   - Impor repositori `aljaffarsyah10/12-BookEase`.
2. **Konfigurasi Environment Variables**:
   Salin nilai dari `.env.example`:
   - `DATABASE_URL` (Gunakan mode pooled / pgbouncer port 6543)
   - `DIRECT_URL` (Gunakan direct connection port 5432)
   - `AUTH_SECRET` (Minimal 32 karakter acak: `openssl rand -base64 32`)
   - `CANCELLATION_TOKEN_SECRET` (Minimal 32 karakter acak)
   - `NEXT_PUBLIC_APP_URL` (`https://bookease.id`)
   - `RESEND_API_KEY` & `RESEND_FROM_EMAIL`
3. **Build & Output Settings**:
   - Framework Preset: **Next.js**
   - Build Command: `npx prisma generate && next build`
   - Install Command: `npm install`
4. **Deploy**:
   - Klik **Deploy**. Vercel akan otomatis mengompilasi rute dan mendistribusikan aset ke Edge CDN global.

---

### Opsi B: Docker Container (Railway, Render, Fly.io, Google Cloud Run)

Gunakan `Dockerfile` multi-stage yang telah disediakan di root proyek:

1. **Build Docker Image**:
   ```bash
   docker build -t bookease:latest .
   ```
2. **Jalankan Container**:
   ```bash
   docker run -d \
     --name bookease-prod \
     -p 3000:3000 \
     --env-file .env.production \
     --restart unless-stopped \
     bookease:latest
   ```
3. **Liveness Probe**:
   Aplikasi dilengkapi endpoint pemeriksaan kesehatan container:
   - Liveness: `http://localhost:3000/api/health/live`
   - Readiness: `http://localhost:3000/api/health/ready`

---

### Opsi C: Virtual Private Server (VPS Ubuntu 22.04 / 24.04 LTS)

#### 1. Setup Server & Dependency
```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git
sudo npm install -g pm2
```

#### 2. Kloning Repositori & Instalasi
```bash
cd /var/www
sudo git clone https://github.com/aljaffarsyah10/12-BookEase.git bookease
cd bookease
sudo chown -R $USER:$USER /var/www/bookease
npm ci
cp .env.example .env.production
nano .env.production # Masukkan kredensial database dan secret keys
```

#### 3. Sinkronisasi Skema Database & Build
```bash
npx prisma generate
npx prisma db push # Atau: npx prisma migrate deploy
npm run build
```

#### 4. Jalankan dengan PM2 Process Manager
```bash
pm2 start npm --name "bookease" -- start
pm2 save
pm2 startup
```

#### 5. Konfigurasi Nginx Reverse Proxy
Buat file konfigurasi `/etc/nginx/sites-available/bookease`:
```nginx
server {
    server_name bookease.id www.bookease.id;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan konfigurasi dan pasang SSL Let's Encrypt:
```bash
sudo ln -s /etc/nginx/sites-available/bookease /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d bookease.id -d www.bookease.id
```

---

## 3. Otomatisasi Database Backup di Produksi

Jadwalkan pencadangan otomatis harian menggunakan crontab:
```bash
crontab -e
```
Tambahkan baris berikut (dijalankan tiap pukul 02:00 WIB):
```cron
0 19 * * * cd /var/www/bookease && npm run db:backup >> /var/log/bookease-backup.log 2>&1
```
Arsip cadangan akan tersimpan di direktori `backups/` dengan validasi *checksum* SHA-256 dan retensi otomatis 7 hari.
