# 🚀 QUICK START: Fonnte WhatsApp Integration

Panduan cepat untuk mengimplementasikan WhatsApp notifications di PPPM-BM.

---

## 📋 Checklist Implementasi (15-20 menit)

Ikuti checklist ini untuk setup yang sukses:

### ✅ Phase 1: Fonnte Account Setup (5 menit)
- [ ] Register di https://fonnte.com
- [ ] Connect WhatsApp device (scan QR code)
- [ ] Generate API Key dari Fonnte dashboard
- [ ] Copy API Key dan simpan

### ✅ Phase 2: Environment Configuration (5 menit)
- [ ] Copy `.env.example` ke `.env.local`
- [ ] Update `FONNTE_API_KEY=your_key_here`
- [ ] Verifikasi file tidak di-commit ke Git

### ✅ Phase 3: Database Migration (3 menit)
- [ ] Buka Supabase dashboard
- [ ] Pergi ke SQL Editor
- [ ] Copy SQL dari `src/lib/fontte/migration.sql.ts`
- [ ] Jalankan query
- [ ] Verifikasi tabel `whatsapp_notification_logs` exist

### ✅ Phase 4: Testing (5 menit)
- [ ] Jalankan `npm run dev`
- [ ] Test endpoint dengan curl atau Postman
- [ ] Verifikasi pesan WhatsApp terkirim
- [ ] Check logs di database

---

## 🔧 Step-by-Step Setup

### Step 1: Setup Fontte Account

**Durasi:** ~5 menit

```bash
# 1. Buka https://fonnte.com
# 2. Klik "Daftar"
# 3. Isi form:
#    - Email: sekolah@example.com
#    - Password: password-yang-kuat
#    - Nama Bisnis: PAUD BA 1 Buduran
# 4. Verifikasi email
```

**Hasil:** Email verified ✅

---

### Step 2: Connect WhatsApp Device

**Durasi:** ~3 menit

```
1. Login ke Fontte Dashboard
2. Menu "Device" atau "Devices"
3. Klik "Tambah Device" atau "Add Device"
4. Buka WhatsApp di HP (gunakan nomor sekolah)
   → Settings → Linked Devices → Scan QR Code
5. Scan QR yang ditampilkan Fontte
6. Tunggu status menjadi "Connected"
```

**Hasil:** Device Connected ✅

---

### Step 3: Generate API Key

**Durasi:** ~2 menit

```
1. Dashboard Fontte
2. Menu "Settings" atau "Integration"
3. Cari "API" atau "Token"
4. Klik "Generate" atau "Create Token"
5. Copy API Key yang muncul:
   6yEVq5q33NkXkaoUvFh1
```

**Penting:** Jangan bagikan API key ke orang lain!

**Hasil:** API Key siap ✅

---

### Step 4: Update Environment Variables

**Durasi:** ~3 menit

```bash
# 1. Buka project di VS Code
# 2. Copy file: .env.example → .env.local
cp .env.example .env.local

# 3. Edit .env.local, tambahkan:
FONNTE_API_KEY=6yEVq5q33NkXkaoUvFh1

# 4. Save file
# 5. Restart development server jika sudah running
```

**Verifikasi:**
```bash
# Pastikan .env.local di .gitignore
grep .env.local .gitignore
# Output: .env.local ✅
```

**Hasil:** Environment configured ✅

---

### Step 5: Database Migration

**Durasi:** ~3 menit

#### Cara 1: Supabase SQL Editor (Recommended)

```
1. Buka https://app.supabase.com
2. Pilih project PPPM-BM
3. Menu → SQL Editor
4. Klik "+ New Query"
5. Open file: src/lib/fontte/migration.sql.ts
6. Copy isi dari variable whatsappNotificationLogsSQL
7. Paste ke SQL Editor
8. Klik "Run"
9. Tunggu hingga selesai
```

#### Cara 2: CLI

```bash
# Jalankan jika sudah setup Supabase CLI
npx supabase migration up
```

**Verifikasi:**
```sql
-- Di Supabase SQL Editor, jalankan:
SELECT * FROM whatsapp_notification_logs LIMIT 1;
-- Jika berhasil, tabel exist ✅
```

**Hasil:** Database ready ✅

---

### Step 6: Test Endpoints

**Durasi:** ~5 menit

#### Test 6.1: Start Development Server

```bash
npm run dev
# Output: ▲ Next.js 15.3.1
#         ✓ Ready in 2.5s
```

#### Test 6.2: Test Send Bill Notification

**Menggunakan Postman atau curl:**

```bash
curl -X POST http://localhost:3000/api/notifications/send-bill \
  -H "Content-Type: application/json" \
  -d '{
    "idTagihan": 1,
    "manualSend": true
  }'

# Response:
# {
#   "success": true,
#   "message": "Notifikasi berhasil dikirim",
#   "messageId": "abc123def456",
#   ...
# }
```

#### Test 6.3: Verifikasi di WhatsApp

1. **Buka WhatsApp Wali Siswa**
2. **Cek chat dengan nomor bot Fonnte**
3. **Verifikasi pesan diterima**
   ```
   🔔 *PEMBERITAHUAN TAGIHAN*
   Halo Ibu Siti,
   Anak Anda Ahmad Rizki telah diterbitkan tagihan...
   ```

#### Test 6.4: Check Database Logs

```sql
-- Di Supabase SQL Editor:
SELECT 
  recipient_phone, 
  message_type, 
  delivery_status, 
  created_at
FROM whatsapp_notification_logs
ORDER BY created_at DESC
LIMIT 5;

-- Verify delivery_status = 'SENT' atau 'DELIVERED'
```

**Hasil:** Everything working ✅

---

## 🎯 Implementasi di Production

Setelah testing berhasil, siap untuk production:

### 1. Update Domain & URLs

```env
# Di production, update:
NEXT_PUBLIC_APP_URL=https://pppm-bm.vercel.app
FONNTE_BASE_URL=https://api.fonnte.com
```

### 2. Setup Webhook (Optional)

```
1. Buka Fonnte Dashboard
2. Settings → Webhook
3. Masukkan: https://pppm-bm.vercel.app/api/notifications/whatsapp-webhook
4. Select "Message Status"
5. Save
```

### 3. Deploy ke Vercel/Hosting

```bash
# Deploy ke Vercel
vercel --prod

# Atau jika sudah setup Git:
git push
# Vercel akan auto-deploy
```

### 4. Test di Production

```bash
# Test dengan curl
curl -X POST https://pppm-bm.vercel.app/api/notifications/send-bill \
  -H "Content-Type: application/json" \
  -d '{"idTagihan": 1, "manualSend": true}'
```

---

## 🔗 Integration Points dalam Aplikasi

Setelah setup, WhatsApp notifications akan dikirim **otomatis** pada flow berikut:

### 1. **Notifikasi Tagihan Baru** (Manual)
**Trigger:** Admin klik button "Kirim WhatsApp" di halaman Tagihan
**Endpoint:** `POST /api/notifications/send-bill`
**Message:** Informasi tagihan + link pembayaran

### 2. **Notifikasi Pembayaran** (Otomatis)
**Trigger:** Webhook Midtrans → Payment Success/Failed
**Endpoint:** Dipanggil otomatis dari `/api/payment/webhook`
**Message:** Status pembayaran + link kwitansi (jika sukses)

### 3. **Webhook dari Fonnte** (Otomatis)
**Trigger:** Fonnte mengirim delivery status callback
**Endpoint:** `POST /api/notifications/whatsapp-webhook`
**Action:** Update log di database

---

## 📊 Monitoring & Logs

### Check Notification Logs

```sql
-- Di Supabase SQL Editor

-- 1. Lihat semua notifikasi hari ini
SELECT * FROM whatsapp_notification_logs
WHERE created_at >= NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;

-- 2. Lihat notifikasi yang failed
SELECT * FROM whatsapp_notification_logs
WHERE delivery_status = 'FAILED'
ORDER BY created_at DESC;

-- 3. Lihat statistik
SELECT 
  delivery_status,
  COUNT(*) as jumlah,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 day') as today
FROM whatsapp_notification_logs
GROUP BY delivery_status;
```

### Check Server Logs

```bash
# Terminal development server
# Cari log dengan format [NOTIFICATION-*]

# Contoh:
# ✅ [NOTIFICATION-BILL] Notifikasi terkirim untuk tagihan 123
# ❌ [NOTIFICATION-BILL] Gagal mengirim notifikasi: Invalid phone number
```

---

## 🆘 Troubleshooting

### Error: "Invalid phone number"
```
Penyebab: Nomor WhatsApp di database tidak valid
Solusi: 
1. Check data siswa: SELECT nowa FROM siswa WHERE nowa IS NULL;
2. Update nomor yang salah
3. Format: 628xxxxxxxxx (62 + nomor tanpa 0)
```

### Error: "FONNTE_API_KEY not found"
```
Penyebab: Environment variable tidak diset
Solusi:
1. Pastikan .env.local sudah dibuat
2. Tambahkan FONNTE_API_KEY
3. Restart npm run dev
```

### Pesan tidak terkirim
```
Penyebab: Fonnte device tidak terkoneksi
Solusi:
1. Cek status device di Fonnte Dashboard
2. Verifikasi WhatsApp masih online
3. Check API key benar
4. Lihat server logs untuk error detail
```

---

## 📚 File Structure

Semua file untuk Fonnte integration sudah dibuat:

```
src/
├── lib/fontte/
│   ├── client.ts              ✅ API client
│   ├── whatsapp-sender.ts     ✅ Service layer
│   ├── templates.ts           ✅ Message templates
│   └── migration.sql.ts       ✅ Database migration
│
├── app/api/notifications/
│   ├── send-bill/route.ts              ✅ Kirim notifikasi tagihan
│   ├── send-payment-status/route.ts    ✅ Kirim notifikasi pembayaran
│   └── whatsapp-webhook/route.ts       ✅ Webhook dari Fonnte
│
├── app/api/payment/webhook/route.ts    ✅ Updated - Kirim WhatsApp setelah pembayaran
│
└── types/
    └── fonnte.d.ts            ✅ Type definitions

docs/
├── KONFIGURASI_FONNTE.md      ✅ Dokumentasi lengkap
└── QUICK_START.md             ✅ This file
```

---

## ✅ Verification Checklist

Sebelum production, pastikan:

- [ ] WhatsApp terkirim ke wali siswa
- [ ] Message format bagus dan readable
- [ ] Phone numbers semua valid (tidak ada error)
- [ ] Database logs tercatat dengan benar
- [ ] Delivery status terupdate
- [ ] Payment notification otomatis terkirim
- [ ] Webhook dari Fonnte diterima (optional)
- [ ] Error handling berjalan dengan baik

---

## 🎓 Next Steps

Setelah implementasi selesai:

1. **User Training**
   - Ajarkan admin cara kirim notifikasi manual
   - Jelaskan format nomor WA yang benar

2. **Monitoring**
   - Set reminder cek logs setiap minggu
   - Monitor delivery rate

3. **Improvements**
   - Customize message template
   - Add more notification types (reminder, info, dll)
   - Integrate incoming messages

4. **Documentation**
   - Update SOP internal
   - Buat user guide untuk admin

---

## 📞 Support

Jika ada pertanyaan atau masalah:

1. Cek dokumentasi: `KONFIGURASI_FONTTE.md`
2. Check server logs untuk error detail
3. Verify database dengan SQL query
4. Test endpoints dengan curl/Postman

---

**Estimated Setup Time:** 15-20 menit ⏱️

**Difficulty Level:** ⭐⭐☆☆☆ (Easy)

**Status:** ✅ Ready to Implement

---

**Last Updated:** 10 Juni 2026

*Dibuat dengan ❤️ untuk PPPM-BM*
