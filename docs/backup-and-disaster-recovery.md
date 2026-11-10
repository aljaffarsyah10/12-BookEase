# Strategi Backup & Disaster Recovery (DR) - BookEase

Dokumen ini menjelaskan arsitektur, kebijakan, dan Prosedur Operasi Standar (SOP) untuk pencadangan data serta pemulihan bencana (*Disaster Recovery*) pada platform **BookEase**.

---

## 1. Sasaran Pemulihan (Recovery Objectives)

| Parameter | Target SLA | Keterangan |
| :--- | :--- | :--- |
| **RPO** (*Recovery Point Objective*) | **1 Jam** | Kehilangan data maksimum yang dapat ditoleransi jika terjadi bencana katastropik. |
| **RTO** (*Recovery Time Objective*) | **15 Menit** | Waktu maksimal yang dibutuhkan untuk memulihkan layanan hingga beroperasi normal kembali. |
| **Retention Policy** | **7 Hari (Lokal), 30 Hari (Cloud/Cold Storage)** | Snapshot harian dan rotasi otomatis untuk efisiensi penyimpanan. |

---

## 2. Arsitektur Pencadangan Data

### A. Snapshot Otomatis
Pencadangan dilakukan menggunakan skrip `scripts/backup-database.cjs` yang mengekspor seluruh entitas relasional:
- `users`
- `businesses`
- `services`
- `staff` & `staff_services`
- `operating_hours`
- `bookings`
- `invoices`

### B. Validasi Integritas Kriptografis (SHA-256)
Setiap arsip pencadangan dibuat bersamaan dengan file checksum `.sha256`. Saat proses *restore*, checksum dihitung ulang untuk mencegah kerusakan data (*data corruption*) atau manipulasi berkas.

### C. Pembersihan Otomatis (Pruning)
Arsip lokal yang lebih lama dari 7 hari dihapus secara otomatis setiap kali skrip dijalankan untuk mencegah kepenuhan disk penyimpanan.

---

## 3. Jadwal Otomatisasi (Cron Job)

Untuk menjalankan backup harian secara otomatis pada pukul 02:00 WIB:

```cron
# Eksekusi backup database setiap hari jam 02:00 WIB
0 19 * * * cd /var/www/bookease && node scripts/backup-database.cjs >> /var/log/bookease-backup.log 2>&1
```

Di lingkungan Windows Task Scheduler:
```powershell
schtasks /create /tn "BookEase-DailyBackup" /tr "node D:\10Project\12-BookEase\scripts\backup-database.cjs" /sc daily /st 02:00
```

---

## 4. Prosedur Pemulihan (Disaster Recovery Runbook)

Jika terjadi insiden data (misalnya kesalahan manusia atau gangguan hardware):

1. **Identifikasi Berkas Backup Terkini**:
   ```bash
   ls -la backups/
   ```
2. **Uji Integritas & Jalankan Pemulihan**:
   ```bash
   node scripts/restore-database.cjs backups/backup-2026-11-10T22-30-00-000Z.json
   ```
3. **Verifikasi Kesehatan Sistem**:
   Panggil endpoint health check:
   ```bash
   curl http://localhost:3000/api/health
   ```
   Pastikan status komponen database mengembalikan `"status": "healthy"`.
