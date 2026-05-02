# Konfigurasi Email Kwitansi Pembayaran

Panduan lengkap untuk mengonfigurasi sistem pengiriman kwitansi pembayaran otomatis via email.

## 🔧 Environment Variables yang Diperlukan

Tambahkan variabel berikut ke file `.env.local` Anda:

```bash
# ===== EMAIL PROVIDER (Resend) =====
# API key dari Resend untuk mengirim email
# Daftar di: https://resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email pengirim
# Format: noreply@domain.anda
FROM_EMAIL=noreply@paudba1buduran.sch.id

# ===== APP URL (untuk internal fetch ke /api/send-receipt) =====
# Gunakan URL localhost saat development
# Gunakan URL domain saat production
NEXT_PUBLIC_APP_URL=http://localhost:3000
# NEXT_PUBLIC_APP_URL=https://pppmba1buduran.sch.id
```

## 📧 Setup Resend (Email Service)

### 1. Daftar Akun Resend
- Kunjungi: https://resend.com
- Sign up dengan email Anda
- Verify email

### 2. Dapatkan API Key
- Masuk ke Resend Dashboard
- Buka **Integrations** → **API Keys**
- Copy API Key (format: `re_xxxxxx...`)
- Paste ke `RESEND_API_KEY` di `.env.local`

### 3. Verifikasi Domain (Production)
Untuk production, verifikasi domain Anda:
1. Di Resend Dashboard, buka **Domains**
2. Tambah domain baru
3. Ikuti instruksi DNS verification
4. Gunakan domain terverifikasi di `FROM_EMAIL`

**Development**: Bisa menggunakan email testing (disediakan Resend)

## 🎯 Cara Kerja Sistem Email

### Flow Pembayaran → Email Kwitansi

```
┌─────────────────────────────────────────────────────────┐
│ 1. Siswa melakukan pembayaran (Midtrans atau Cash)      │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │ Midtrans Webhook        │  atau  │ Admin bayarTagihanManual │
        │ atau confirmPayment     │        │ (pembayaran manual)      │
        └────────────┬────────────┘        └─────────────────────────┘
                     │
        ┌────────────▼──────────────────────┐
        │ Update Database                    │
        │ - tagihan_siswa (LUNAS)           │
        │ - pembayaran (SUCCESS)            │
        └────────────┬──────────────────────┘
                     │
        ┌────────────▼──────────────────────┐
        │ Fetch /api/send-receipt            │
        │ (Server action/webhook)            │
        └────────────┬──────────────────────┘
                     │
        ┌────────────▼──────────────────────┐
        │ /api/send-receipt (Route Handler)  │
        │ 1. Ambil data pembayaran & tagihan │
        │ 2. Cari email wali siswa           │
        │ 3. Build HTML kwitansi             │
        │ 4. Kirim via Resend API            │
        └────────────┬──────────────────────┘
                     │
        ┌────────────▼──────────────────────┐
        │ ✅ Email Kwitansi dikirim          │
        │ ke: nomorwa@example.com            │
        └────────────────────────────────────┘
```

## 📍 Integrasi di Berbagai Tempat

### 1. **Webhook Midtrans** (`/app/api/payment/webhook/route.ts`)
Otomatis memanggil `/api/send-receipt` saat pembayaran sukses dari Midtrans.

```typescript
// Setelah pembayaran sukses:
await fetch(`${appUrl}/api/send-receipt`, {
  method: "POST",
  body: JSON.stringify({
    idPembayaran,
    idTagihan,
    jumlahBayar,
    totalTagihan,
    sisaTagihan,
    statusBaru,
    metodePembayaran: "midtrans_online",
  }),
});
```

### 2. **Konfirmasi Pembayaran** (`/app/(dashboard)/siswa/payment/actions.ts`)
Server action yang dipanggil dari halaman success payment.

### 3. **Pembayaran Manual (Admin)** (`/app/(dashboard)/admin/tagihan/actions.ts`)
Admin bisa mencatat pembayaran cash dan email otomatis dikirim.

## 🧪 Testing Email Locally

### Test dengan Resend
```bash
# 1. Gunakan Resend Testing API Key
RESEND_API_KEY=re_test_xxxxxx

# 2. Di dashboard Resend, ada email testing
#    Gunakan: test@example.com
```

### Manual Testing
1. Buka database Anda (Supabase)
2. Insert record pembayaran manual dengan statusPembayaran = "SUCCESS"
3. Panggil endpoint dengan curl:

```bash
curl -X POST http://localhost:3000/api/send-receipt \
  -H "Content-Type: application/json" \
  -d '{
    "idPembayaran": 123,
    "idTagihan": 456,
    "jumlahBayar": 500000,
    "totalTagihan": 500000,
    "sisaTagihan": 0,
    "statusBaru": "LUNAS",
    "metodePembayaran": "cash"
  }'
```

## 🔍 Troubleshooting

### Error: `RESEND_API_KEY tidak diset`
- ✅ Cek `.env.local` memiliki `RESEND_API_KEY`
- ✅ Cek API key format: `re_xxxxxx...`
- ✅ Restart dev server setelah edit `.env.local`

### Error: `Email tidak ditemukan`
- ✅ Cek tabel `siswa` memiliki field `email`
- ✅ Cek tabel `users` (auth) memiliki email user
- ✅ Pastikan relasi siswa ↔ auth user valid

### Email tidak terkirim (tapi API response success)
- ✅ Cek Resend Dashboard → Emails untuk melihat status
- ✅ Cek email pengirim (`FROM_EMAIL`) verifikasi domain
- ✅ Cek spam folder penerima

### Rate Limit
- Resend: max 300 emails/jam (plan free)
- Jika melebihi, tunggu atau upgrade plan

## 📋 Checklist Deployment

Sebelum go-live di production:

- [ ] Setup Resend account dan API Key
- [ ] Verifikasi domain di Resend
- [ ] Set `FROM_EMAIL` dengan domain terverifikasi
- [ ] Set `NEXT_PUBLIC_APP_URL` ke domain production
- [ ] Test pengiriman email dengan admin pembayaran manual
- [ ] Cek logs Resend untuk error
- [ ] Cek email masuk di inbox wali siswa
- [ ] Cek format kwitansi HTML

## 📞 Support

Jika ada masalah:
1. Cek console logs di `npm run dev`
2. Cek Resend Dashboard untuk error details
3. Cek database untuk data yang tidak konsisten
4. Cek network tab di DevTools (cek request ke `/api/send-receipt`)
