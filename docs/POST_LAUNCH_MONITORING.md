# Panduan Pemantauan Pasca-Rilis (Post-Launch Monitoring Plan) - BookEase

Dokumen ini menguraikan protokol observabilitas, target metrik kesehatan, dan rencana respons insiden setelah aplikasi **BookEase** diluncurkan ke produksi.

---

## 1. Empat Sinyal Emas (Google SRE Golden Signals)

| Sinyal | Target SLA Produksi | Cara Memantau | Tindakan Jika Melanggar Ambang Batas |
| :--- | :--- | :--- | :--- |
| **Latensi (Latency)** | $p95 < 250\text{ ms}$, Rata-rata $< 100\text{ ms}$ | Endpoint `/api/health` & widget dashboard `/dashboard/settings` | Periksa koneksi pool PostgreSQL, bersihkan query N+1, aktifkan Redis cache. |
| **Lalu Lintas (Traffic)** | Bebas lonjakan tak wajar | Metrik throughput di `/api/health` | Amati pola bot; aktifkan firewall rate-limiting jika terdeteksi DoS. |
| **Tingkat Error (Errors)** | Error rate $< 0.1\%$ ($< 1$ per 1.000 request) | Structured logger JSON & `alerting.ts` | Notifikasi otomatis terkirim via Webhook; periksa fingerprint di `errorTracker`. |
| **Saturasi (Saturation)** | Heap memory $< 70\%$, DB pool $< 80\%$ | Node.js process monitor & PostgreSQL pool | Tingkatkan memori container, tambahkan instance pgbouncer. |

---

## 2. Fase Jadwal Pemantauan

### Fase 1: 24 Jam Pertama (Hyper-Care Monitoring)
- **Fokus Utama**: Stabilitas runtime, fungsionalitas reservasi tanpa bentrok, dan penerbitan invoice sandbox.
- **Pemeriksaan Berkala**:
  - Jalankan `npm run test:smoke` setiap 4 jam.
  - Periksa query log PostgreSQL untuk mendeteksi *slow queries* ($> 200\text{ ms}$).
  - Pantau apakah ada unhandled exception yang masuk ke `errorTracker`.

### Fase 2: 7 Hari Pertama (Adoption & Onboarding Funnel)
- **Fokus Utama**: Kepuasan pengguna, konversi alur registrasi, dan pembuatan layanan pertama oleh pemilik bisnis.
- **Metrik Bisnis**:
  - Persentase onboarding yang menyelesaikan 4 langkah panduan awal di `/dashboard`.
  - Tingkat keberhasilan pengiriman email konfirmasi reservasi via Resend.
  - Jumlah reservasi publik yang berhasil dibuat via `/book/{slug}`.

### Fase 3: 30 Hari Pertama (SaaS Retention & Monetization)
- **Fokus Utama**: Konversi dari Free Trial 14 hari ke paket Starter, Pro, atau Enterprise.
- **Metrik Tagihan**:
  - Tingkat pelunasan invoice (`status: PAID`).
  - Pemakaian kuota staf dan layanan oleh pemilik bisnis (mendeteksi kebutuhan upgrade paket).

---

## 3. Matriks Eskalasi Insiden (Incident Escalation Ladder)

| Tingkat Keparahan | Contoh Kasus | Waktu Respons | Tim Penanggung Jawab | Kanal Komunikasi |
| :--- | :--- | :--- | :--- | :--- |
| **P1 - Kritis** | Seluruh situs tidak dapat diakses, database mati, kebocoran data. | $< 15\text{ menit}$ | Tech Lead & DevOps | Slack Emergency Channel, Telepon / On-Call |
| **P2 - Tinggi** | Fitur booking gagal untuk staf tertentu, email pengingat gagal terkirim. | $< 1\text{ jam}$ | Backend Engineer | Slack Alert Channel, Issue Tracker |
| **P3 - Sedang** | Latensi meningkat menjadi $> 500\text{ ms}$, UI bug minor pada dashboard. | $< 4\text{ jam}$ | Fullstack Engineer | GitHub Issues |
| **P4 - Rendah** | Kesalahan pengetikan (typo), peningkatan fitur sekunder. | $< 24\text{ jam}$ | Product Team | Backlog Sprint |
