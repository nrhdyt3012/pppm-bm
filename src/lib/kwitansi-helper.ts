// src/lib/kwitansi-helper.ts
// Helper untuk generate QR code dan format angka jadi teks (terbilang)
// dipakai di halaman kwitansi, cetak kwitansi, dan email kwitansi.

import QRCode from "qrcode";

/**
 * Generate QR code sebagai data URL base64 (PNG) dari sebuah teks/link.
 * Dipakai untuk menampilkan QR code di halaman kwitansi, hasil cetak,
 * dan email — semuanya mengarah ke link yang sama dengan yang dikirim
 * via WhatsApp (linkKwitansi pada notifikasi Fonnte).
 */
export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      color: {
        dark: "#1f2937", // abu gelap, bukan hitam pekat — lebih soft untuk dokumen resmi
        light: "#ffffff",
      },
    });
    return dataUrl;
  } catch (err) {
    console.error("[generateQrCodeDataUrl] Gagal generate QR code:", err);
    return "";
  }
}

/**
 * Konversi angka ke terbilang Bahasa Indonesia.
 * Contoh: 70000 -> "Tujuh Puluh Ribu Rupiah"
 */
const SATUAN = [
  "", "Satu", "Dua", "Tiga", "Empat", "Lima",
  "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh",
  "Sebelas",
];

function angkaKeTeks(n: number): string {
  n = Math.floor(n);
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${angkaKeTeks(n - 10)} Belas`;
  if (n < 100) {
    const puluhan = Math.floor(n / 10);
    const sisa = n % 10;
    return `${puluhan === 1 ? "Sepuluh" : `${angkaKeTeks(puluhan)} Puluh`}${
      sisa > 0 ? ` ${angkaKeTeks(sisa)}` : ""
    }`.trim();
  }
  if (n < 200) return `Seratus${n - 100 > 0 ? ` ${angkaKeTeks(n - 100)}` : ""}`;
  if (n < 1000) {
    const ratusan = Math.floor(n / 100);
    const sisa = n % 100;
    return `${angkaKeTeks(ratusan)} Ratus${sisa > 0 ? ` ${angkaKeTeks(sisa)}` : ""}`;
  }
  if (n < 2000) return `Seribu${n - 1000 > 0 ? ` ${angkaKeTeks(n - 1000)}` : ""}`;
  if (n < 1_000_000) {
    const ribuan = Math.floor(n / 1000);
    const sisa = n % 1000;
    return `${angkaKeTeks(ribuan)} Ribu${sisa > 0 ? ` ${angkaKeTeks(sisa)}` : ""}`;
  }
  if (n < 1_000_000_000) {
    const jutaan = Math.floor(n / 1_000_000);
    const sisa = n % 1_000_000;
    return `${angkaKeTeks(jutaan)} Juta${sisa > 0 ? ` ${angkaKeTeks(sisa)}` : ""}`;
  }
  // Cukup untuk konteks pembayaran sekolah PAUD, tidak perlu lebih besar dari miliar
  const miliaran = Math.floor(n / 1_000_000_000);
  const sisa = n % 1_000_000_000;
  return `${angkaKeTeks(miliaran)} Miliar${sisa > 0 ? ` ${angkaKeTeks(sisa)}` : ""}`;
}

/**
 * Format nominal rupiah jadi terbilang lengkap dengan kapitalisasi rapi.
 * Contoh: terbilangRupiah(70000) -> "Tujuh Puluh Ribu Rupiah"
 */
export function terbilangRupiah(nominal: number): string {
  if (nominal === 0) return "Nol Rupiah";
  const teks = angkaKeTeks(Math.round(nominal));
  return `${teks} Rupiah`;
}