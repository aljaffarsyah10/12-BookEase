# Strategi Rollback & Rencana Kontinjensi (Rollback Strategy SOP) - BookEase

Dokumen ini menjelaskan prosedur rollback (*reversal*) darurat jika terjadi regresi kritis, kegagalan fungsional, atau gangguan tak terduga setelah rilis produksi.

---

## 1. Kriteria Pemicu Rollback (Rollback Triggers)

Prosedur rollback wajib segera dieksekusi jika salah satu kondisi berikut terpenuhi dalam 60 menit setelah deployment:

1. **Error Rate Melonjak**: Tingkat error HTTP 5xx melebihi **2%** dari total lalu lintas selama 5 menit berturut-turut.
2. **Katalog & Reservasi Terblokir**: Pelanggan tidak dapat membuat reservasi di halaman `/book/{slug}`.
3. **Koneksi Database Putus**: Endpoint `/api/health/ready` mengembalikan status `unready` / HTTP 503 secara persisten.
4. **Data Corruption / Data Leak**: Ditemukan anomali integritas data atau insiden isolasi multi-tenant.

---

## 2. Prosedur Rollback Aplikasi

### A. Lingkungan Vercel (Instant Rollback)

Vercel mendukung rollback tanpa *rebuild* dalam hitungan detik:

1. Buka dashboard proyek di [Vercel Project Deployments](https://vercel.com).
2. Cari rilis produksi stabil sebelumnya (misalnya commit hash `eeab978` atau tag versi sebelum insiden).
3. Klik ikon menu titik tiga (`...`) pada deployment target $\rightarrow$ pilih **Instant Rollback**.
4. Verifikasi bahwa domain utama (`https://bookease.id`) langsung dialihkan ke build stabil tersebut.
5. Jalankan uji asap:
   ```bash
   npm run test:smoke https://bookease.id
   ```

---

### B. Lingkungan Docker / Container

1. Identifikasi tag image versi sebelumnya:
   ```bash
   docker images | grep bookease
   ```
2. Jalankan ulang container dengan tag sebelumnya:
   ```bash
   docker stop bookease-prod
   docker rm bookease-prod
   docker run -d \
     --name bookease-prod \
     -p 3000:3000 \
     --env-file .env.production \
     --restart unless-stopped \
     bookease:v0.9.0 # Tag rilis stabil sebelumnya
   ```
3. Verifikasi kesehatan container:
   ```bash
   curl -I http://localhost:3000/api/health/live
   ```

---

### C. Lingkungan VPS (PM2)

1. Kembali ke commit stabil sebelumnya:
   ```bash
   cd /var/www/bookease
   git log --oneline -5
   git checkout <STABLE_COMMIT_HASH>
   ```
2. Re-install & build:
   ```bash
   npm ci
   npx prisma generate
   npm run build
   ```
3. Reload proses PM2 tanpa downtime (*zero-downtime reload*):
   ```bash
   pm2 reload bookease --update-env
   ```

---

## 3. Strategi Rollback Skema Basis Data (Database Rollback)

### Prinsip: Migrasi Skema Harus Selalu Backward-Compatible (Expand & Contract Pattern)
- **Tahap Expand**: Tambahkan kolom baru sebagai opsional (`nullable`) atau dengan nilai default. Jangan langsung menghapus atau mengubah nama kolom aktif.
- **Tahap Contract**: Hapus kolom lama hanya setelah kode aplikasi versi baru stabil 100% dan tidak ada lagi dependensi terhadap kolom lama.

### Prosedur Darurat Pemulihan Basis Data
Jika terjadi inkonsistensi data katastropik:
1. Aktifkan mode pemeliharaan (*Maintenance Mode*) pada Nginx:
   ```bash
   sudo cp /etc/nginx/maintenance.html /var/www/html/index.html
   ```
2. Jalankan skrip pemulihan database dari cadangan terkini:
   ```bash
   node --env-file=.env.production scripts/restore-database.cjs backups/<NAMA_FILE_BACKUP_TERAKHIR>.json
   ```
3. Jalankan verifikasi integritas:
   ```bash
   curl http://localhost:3000/api/health
   ```
4. Nonaktifkan mode pemeliharaan dan buka kembali akses publik.
