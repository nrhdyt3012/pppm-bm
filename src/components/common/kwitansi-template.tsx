// src/components/common/kwitansi-template.tsx
"use client";

import Image from "next/image";
import { convertIDR } from "@/lib/utils";
import { terbilangRupiah } from "@/lib/kwitansi-helper";

const BULAN_NAMA = [
  "", "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

export type KwitansiTagihanLain = {
  idtagihansiswa: number;
  jumlahtagihan: string | number;
  bulan: number;
  tahun: number;
  namatagihan: string;
};

export type KwitansiData = {
  noKwitansi: string;
  tanggalCetak: string; // "16 Juni 2026"
  jamCetak: string; // "15.13 WIB"
  namaSiswa: string;
  kelas: string;
  namaWali: string;
  namaTagihan: string;
  periode: string; // "Mei 2026"
  jumlahDibayar: number;
  totalTagihan: number;
  sisaTagihan: number;
  isLunas: boolean;
  qrCodeDataUrl: string; // hasil dari generateQrCodeDataUrl()
  tagihanLain: KwitansiTagihanLain[];
  namaBendahara?: string;
};

/**
 * Template kwitansi yang dipakai bersama oleh:
 * - Halaman /kwitansi/[id] (link yang dikirim via WhatsApp & jadi isi QR code)
 * - Tombol "Cetak Kwitansi" di Riwayat Pembayaran (react-to-print)
 *
 * Disatukan jadi satu komponen supaya formatnya selalu konsisten di semua
 * tempat — kalau mau ubah desain kwitansi, cukup ubah file ini saja.
 */
export default function KwitansiTemplate({ data }: { data: KwitansiData }) {
  const {
    noKwitansi,
    tanggalCetak,
    jamCetak,
    namaSiswa,
    kelas,
    namaWali,
    namaTagihan,
    periode,
    jumlahDibayar,
    totalTagihan,
    sisaTagihan,
    isLunas,
    qrCodeDataUrl,
    tagihanLain,
    namaBendahara = "Sri Wahyuni",
  } = data;

  const totalTagihanLain = tagihanLain.reduce(
    (sum, t) => sum + parseFloat(String(t.jumlahtagihan || "0")),
    0
  );

  return (
    <div
      className="bg-white text-black mx-auto"
      style={{ width: "100%", maxWidth: 680, fontFamily: "Georgia, serif" }}
    >
      <div className="p-8 border border-gray-300">
        {/* ── Header: logo kiri - nama sekolah - logo kanan ──────────────── */}
        <div className="flex items-center justify-between gap-4 pb-4 mb-4 border-b-2 border-gray-800">
          <div className="w-16 h-16 relative shrink-0">
            <Image
              src="/logo.jpg"
              alt="Logo Sekolah"
              fill
              className="object-contain"
            />
          </div>

          <div className="flex-1 text-center px-2">
            <h1 className="text-lg font-bold uppercase tracking-wide leading-tight">
              KB/TK Aisyiyah Bustanul Athfal 1 Buduran
            </h1>
            <p className="text-xs text-gray-600 mt-1">
              Jl. Kavling Persada Asri C-37, Damarsi, Buduran, Sidoarjo
            </p>
          </div>

          <div className="w-16 h-16 relative shrink-0">
            <Image
              src="/logopt.png"
              alt="Logo Penyedia Sistem"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* ── Judul ────────────────────────────────────────────────────── */}
        <h2 className="text-center text-base font-bold uppercase tracking-widest mb-4">
          Kwitansi Pembayaran
        </h2>

        {/* ── No. Kwitansi & Tanggal ───────────────────────────────────── */}
        <table className="w-full text-sm mb-4">
          <tbody>
            <tr>
              <td className="text-gray-600 w-32 py-0.5">No. Kwitansi</td>
              <td className="py-0.5">: {noKwitansi}</td>
            </tr>
            <tr>
              <td className="text-gray-600 py-0.5">Tanggal</td>
              <td className="py-0.5">: {tanggalCetak}</td>
            </tr>
          </tbody>
        </table>

        <hr className="border-gray-300 mb-4" />

        {/* ── Data Siswa ───────────────────────────────────────────────── */}
        <p className="font-bold text-xs uppercase text-gray-600 mb-2">
          Data Siswa
        </p>
        <table className="w-full text-sm mb-4">
          <tbody>
            <tr>
              <td className="text-gray-600 w-32 py-0.5">Nama Siswa</td>
              <td className="py-0.5 font-medium">: {namaSiswa}</td>
            </tr>
            <tr>
              <td className="text-gray-600 py-0.5">Kelas</td>
              <td className="py-0.5">: {kelas}</td>
            </tr>
            <tr>
              <td className="text-gray-600 py-0.5">Wali Murid</td>
              <td className="py-0.5">: {namaWali}</td>
            </tr>
          </tbody>
        </table>

        <hr className="border-gray-300 mb-4" />

        {/* ── Rincian Pembayaran ───────────────────────────────────────── */}
        <p className="font-bold text-xs uppercase text-gray-600 mb-2">
          Rincian Pembayaran
        </p>
        <table className="w-full text-sm border-collapse mb-3">
          <thead>
            <tr className="bg-gray-100 border-y border-gray-400">
              <th className="text-left py-2 px-2 font-semibold">Jenis Tagihan</th>
              <th className="text-center py-2 px-2 font-semibold">Periode</th>
              <th className="text-right py-2 px-2 font-semibold">Nominal</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 px-2">{namaTagihan}</td>
              <td className="py-2 px-2 text-center">{periode}</td>
              <td className="py-2 px-2 text-right">{convertIDR(totalTagihan)}</td>
            </tr>
          </tbody>
        </table>

        <table className="w-full text-sm mb-4">
          <tbody>
            <tr>
              <td className="py-0.5 text-gray-600">Total Dibayar</td>
              <td className="py-0.5 text-right font-bold text-green-700">
                : {convertIDR(jumlahDibayar)}
              </td>
            </tr>
            <tr>
              <td className="py-0.5 text-gray-600">Sisa Tagihan</td>
              <td
                className={`py-0.5 text-right font-bold ${
                  sisaTagihan > 0 ? "text-red-700" : "text-green-700"
                }`}
              >
                : {convertIDR(Math.max(0, sisaTagihan))}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          className={`border-2 rounded p-3 mb-4 text-center font-bold text-sm ${
            isLunas
              ? "border-green-500 bg-green-50 text-green-800"
              : "border-amber-500 bg-amber-50 text-amber-800"
          }`}
        >
          Status Pembayaran: {isLunas ? "✓ LUNAS" : "⚠ BELUM LUNAS"}
          <p className="font-normal text-xs mt-1">
            Alhamdulillah, pembayaran telah kami terima dan tercatat pada
            sistem administrasi sekolah.
          </p>
        </div>

        {/* ── Info Tagihan Lain yang Belum Dibayar ─────────────────────── */}
        {tagihanLain.length > 0 && (
          <>
            <hr className="border-gray-300 mb-4" />
            <p className="font-bold text-xs uppercase text-gray-700 mb-2">
              Informasi Tagihan Lain Yang Belum Terbayar
            </p>
            <table className="w-full text-sm border-collapse mb-2">
              <thead>
                <tr className="bg-red-50 border-y border-red-200">
                  <th className="text-left py-2 px-2 text-xs font-semibold text-gray-700">
                    Jenis Tagihan
                  </th>
                  <th className="text-center py-2 px-2 text-xs font-semibold text-gray-700">
                    Periode
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-semibold text-gray-700">
                    Nominal
                  </th>
                </tr>
              </thead>
              <tbody>
                {tagihanLain.map((t) => (
                  <tr key={t.idtagihansiswa} className="border-b border-gray-200">
                    <td className="py-1.5 px-2">{t.namatagihan}</td>
                    <td className="py-1.5 px-2 text-center">
                      {BULAN_NAMA[t.bulan]} {t.tahun}
                    </td>
                    <td className="py-1.5 px-2 text-right text-gray-700 font-semibold">
                      {convertIDR(parseFloat(String(t.jumlahtagihan || "0")))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
<br />
        {/* ── Tanda Tangan ─────────────────────────────────────────────── */}
        <div className="flex justify-end mb-6">
          <div className="text-center text-sm">
            <p className="mb-12">Bendahara,</p>
            <br className="w-32 h-0.5 bg-black block mx-auto mb-1" /> 
            <p className="border-t border-black pt-1 px-6 font-medium">
              ({namaBendahara})
            </p>
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="text-center text-xs text-gray-400 border-t border-gray-300 pt-3">
          <p>
            Dokumen ini diterbitkan secara elektronik dan sah tanpa tanda
            tangan basah.
          </p>
          <p className="mt-1">
            Dicetak pada: {tanggalCetak} pukul {jamCetak}
          </p>
        </div>
      </div>
    </div>
  );
}