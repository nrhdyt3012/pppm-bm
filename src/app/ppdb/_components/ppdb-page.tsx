// src/app/ppdb/_components/ppdb-page.tsx
"use client";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Calendar,
  FileText,
  DollarSign,
  CheckCircle,
  Users,
  Clock,
  Gift,
  Baby,
} from "lucide-react";

export default function PPDBPage() {
  const persyaratan = [
    "Fotokopi Akta Kelahiran (2 lembar)",
    "Fotokopi Kartu Keluarga (2 lembar)",
    "Fotokopi KTP Orang Tua (2 lembar)",
    "Pas Foto 3x4 (4 lembar)",
    "Surat Keterangan Sehat dari Dokter",
    "Fotokopi Kartu Imunisasi",
    "Formulir Pendaftaran yang sudah diisi",
  ];

  const jadwalPendaftaran = [
    {
      gelombang: "Gelombang 1",
      periode: "Desember 2025 - Februari 2026",
      tanggalMulai: "6 Desember 2025",
      tanggalAkhir: "28 Februari 2026",
      status: "Segera Dibuka",
      benefit: "Bonus souvenir cantik untuk yang melunasi maks Juni 2026",
    },
    {
      gelombang: "Gelombang 2",
      periode: "Maret 2026 - Juni 2026",
      tanggalMulai: "1 Maret 2026",
      tanggalAkhir: "30 Juni 2026",
      status: "Belum Dibuka",
      benefit: "Masih bisa mendaftar dengan biaya sesuai gelombang 2",
    },
  ];

  const biayaAdministrasi = {
    gelombang1: {
      kb: {
        spp: 145000,
        seragam: 600000,
        sarana: 300000,
        peralatan: 250000,
        kegiatan: 750000,
        infaq: 600000,
        total: 2645000,
      },
      tk: {
        spp: 205000,
        seragam: 750000,
        sarana: 300000,
        peralatan: 250000,
        kegiatan: 900000,
        infaq: 600000,
        total: 3005000,
      },
    },
    gelombang2: {
      kb: {
        spp: 145000,
        seragam: 600000,
        sarana: 300000,
        peralatan: 250000,
        kegiatan: 750000,
        infaq: 750000,
        total: 2795000,
      },
      tk: {
        spp: 205000,
        seragam: 750000,
        sarana: 300000,
        peralatan: 250000,
        kegiatan: 900000,
        infaq: 750000,
        total: 3155000,
      },
    },
  };

  const jadwalPembelajaran = {
    kb: [
      {
        hari: "Senin - Jum'at",
        waktu: "07.00 - 10.00",
      },
    ],
    tk: [
      {
        hari: "Senin - Kamis",
        waktu: "07.00 - 11.30",
      },
      {
        hari: "Jum'at",
        waktu: "07.00 - 10.00",
      },
    ],
  };

  const alurPendaftaran = [
    {
      step: 1,
      title: "Pengisian Formulir",
      desc: "Isi formulir pendaftaran dan lengkapi berkas persyaratan",
    },
    {
      step: 2,
      title: "Pembayaran Formulir",
      desc: "Bayar biaya formulir Rp 100.000 di sekolah atau transfer",
    },
    {
      step: 3,
      title: "Verifikasi Berkas",
      desc: "Tim sekolah akan memverifikasi kelengkapan berkas",
    },
    {
      step: 4,
      title: "Pembayaran SPMB",
      desc: "Lakukan pembayaran biaya administrasi sesuai pilihan gelombang",
    },
    {
      step: 5,
      title: "Pengambilan Seragam",
      desc: "Ambil seragam dan perlengkapan sekolah",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">
            Penerimaan Peserta Didik Baru
          </h1>
          <p className="text-xl max-w-2xl mx-auto mb-8">
            Tahun Ajaran 2026/2027
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">
              Pendaftaran Mulai 6 Desember 2025
            </span>
          </div>
        </div>
      </section>

      {/* Jadwal PPDB */}
      <section
        id="jadwal"
        className="py-20 px-6 bg-white dark:bg-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <Clock className="w-16 h-16 mx-auto text-teal-500 mb-4" />
            <h2 className="text-4xl font-bold mb-4">Jadwal Pendaftaran</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Pilih gelombang pendaftaran sesuai dengan waktu Anda
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {jadwalPendaftaran.map((jadwal, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all border-2 hover:border-teal-500"
              >
                <CardHeader className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950 dark:to-blue-950">
                  <CardTitle className="text-2xl text-center">
                    {jadwal.gelombang}
                  </CardTitle>
                  <p className="text-center text-teal-600 dark:text-teal-400 font-semibold">
                    {jadwal.periode}
                  </p>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Mulai:
                    </span>
                    <span className="font-semibold">{jadwal.tanggalMulai}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Berakhir:
                    </span>
                    <span className="font-semibold">{jadwal.tanggalAkhir}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div
                      className={`px-4 py-2 rounded-full text-sm font-medium text-center ${
                        index === 0
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                          : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                      }`}
                    >
                      {jadwal.status}
                    </div>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start gap-2">
                      <Gift className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <span>{jadwal.benefit}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Alur Pendaftaran */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Alur Pendaftaran</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Langkah-langkah mudah untuk mendaftar
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {alurPendaftaran.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mb-4 mx-auto w-16 h-16 bg-gradient-to-br from-teal-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                  {item.step}
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Persyaratan */}
      <section
        id="syarat"
        className="py-20 px-6 bg-white dark:bg-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <FileText className="w-16 h-16 mx-auto text-teal-500 mb-4" />
            <h2 className="text-4xl font-bold mb-4">Persyaratan Pendaftaran</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Dokumen yang perlu disiapkan
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-4">
                {persyaratan.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-500 mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Catatan:</strong> Biaya formulir pendaftaran Rp
                  100.000 (belum termasuk dalam biaya administrasi)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Jadwal Pembelajaran */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Jadwal Pembelajaran</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Waktu belajar untuk KB dan TK
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* KB */}
            <Card>
              <CardHeader className="bg-gradient-to-br from-blue-100 to-teal-100 dark:from-blue-950 dark:to-teal-950">
                <div className="flex items-center justify-center gap-3">
                  <Baby className="w-8 h-8 text-blue-600" />
                  <CardTitle className="text-2xl">Kelompok Bermain (KB)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {jadwalPembelajaran.kb.map((jadwal, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-teal-500" />
                      <span className="font-medium">{jadwal.hari}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-500" />
                      <span className="text-teal-600 font-semibold">
                        {jadwal.waktu}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold">Kegiatan Harian:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Happy morning</li>
                    <li>• Mengaji</li>
                    <li>• Bekal sehat & bermain</li>
                    <li>• Pembelajaran</li>
                    <li>• Pulang</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* TK */}
            <Card>
              <CardHeader className="bg-gradient-to-br from-teal-100 to-green-100 dark:from-teal-950 dark:to-green-950">
                <div className="flex items-center justify-center gap-3">
                  <Users className="w-8 h-8 text-teal-600" />
                  <CardTitle className="text-2xl">Taman Kanak-kanak (TK)</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {jadwalPembelajaran.tk.map((jadwal, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-teal-500" />
                      <span className="font-medium">{jadwal.hari}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-500" />
                      <span className="text-teal-600 font-semibold">
                        {jadwal.waktu}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold">Kegiatan Harian:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>• Happy morning</li>
                    <li>• Mengaji</li>
                    <li>• Bekal sehat & bermain</li>
                    <li>• Pembelajaran</li>
                    <li>• Pulang</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Biaya Administrasi */}
      <section
        id="biaya"
        className="py-20 px-6 bg-white dark:bg-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <DollarSign className="w-16 h-16 mx-auto text-teal-500 mb-4" />
            <h2 className="text-4xl font-bold mb-4">
              Biaya Administrasi Pendaftaran Siswa Baru
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Tahun Ajaran 2026-2027
            </p>
          </div>

          {/* Gelombang 1 */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold mb-6 text-center text-teal-600">
              Gelombang 1 (Desember 2025 - Februari 2026)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* KB Gelombang 1 */}
              <Card>
                <CardHeader className="bg-blue-50 dark:bg-blue-950">
                  <CardTitle className="text-center">
                    Kelompok Bermain (KB)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <table className="w-full">
                    <tbody className="space-y-2">
                      <tr className="border-b">
                        <td className="py-2 text-sm">SPP bulan Juli 2026</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 145.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Seragam (KB 3 stel)</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 600.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Sarana Prasarana</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 300.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Peralatan</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 250.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Kegiatan 1 tahun</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 750.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Infaq Pembangunan</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 600.000
                        </td>
                      </tr>
                      <tr className="bg-teal-50 dark:bg-teal-950">
                        <td className="py-3 font-bold">TOTAL</td>
                        <td className="py-3 text-right font-bold text-teal-600 text-lg">
                          Rp 2.645.000
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* TK Gelombang 1 */}
              <Card>
                <CardHeader className="bg-teal-50 dark:bg-teal-950">
                  <CardTitle className="text-center">
                    Taman Kanak-kanak (TK)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <table className="w-full">
                    <tbody className="space-y-2">
                      <tr className="border-b">
                        <td className="py-2 text-sm">SPP bulan Juli 2026</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 205.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Seragam (TK 4 stel)</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 750.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Sarana Prasarana</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 300.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Peralatan</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 250.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Kegiatan 1 tahun</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 900.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Infaq Pembangunan</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 600.000
                        </td>
                      </tr>
                      <tr className="bg-teal-50 dark:bg-teal-950">
                        <td className="py-3 font-bold">TOTAL</td>
                        <td className="py-3 text-right font-bold text-teal-600 text-lg">
                          Rp 3.005.000
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Gelombang 2 */}
          <div>
            <h3 className="text-2xl font-bold mb-6 text-center text-blue-600">
              Gelombang 2 (Maret 2026 - Juni 2026)
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {/* KB Gelombang 2 */}
              <Card>
                <CardHeader className="bg-blue-50 dark:bg-blue-950">
                  <CardTitle className="text-center">
                    Kelompok Bermain (KB)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <table className="w-full">
                    <tbody className="space-y-2">
                      <tr className="border-b">
                        <td className="py-2 text-sm">SPP bulan Juli 2026</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 145.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Seragam (KB 3 stel)</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 600.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Sarana Prasarana</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 300.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Peralatan</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 250.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Kegiatan 1 tahun</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 750.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Infaq Pembangunan</td>
                        <td className="py-2 text-right font-semibold text-red-600">
                          Rp 750.000
                        </td>
                      </tr>
                      <tr className="bg-blue-50 dark:bg-blue-950">
                        <td className="py-3 font-bold">TOTAL</td>
                        <td className="py-3 text-right font-bold text-blue-600 text-lg">
                          Rp 2.795.000
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* TK Gelombang 2 */}
              <Card>
                <CardHeader className="bg-teal-50 dark:bg-teal-950">
                  <CardTitle className="text-center">
                    Taman Kanak-kanak (TK)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <table className="w-full">
                    <tbody className="space-y-2">
                      <tr className="border-b">
                        <td className="py-2 text-sm">SPP bulan Juli 2026</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 205.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Seragam (TK 4 stel)</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 750.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Sarana Prasarana</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 300.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Peralatan</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 250.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Kegiatan 1 tahun</td>
                        <td className="py-2 text-right font-semibold">
                          Rp 900.000
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-sm">Infaq Pembangunan</td>
                        <td className="py-2 text-right font-semibold text-red-600">
                          Rp 750.000
                        </td>
                      </tr>
                      <tr className="bg-blue-50 dark:bg-blue-950">
                        <td className="py-3 font-bold">TOTAL</td>
                        <td className="py-3 text-right font-bold text-blue-600 text-lg">
                          Rp 3.155.000
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Catatan */}
          <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl">
            <h4 className="font-bold mb-3 text-amber-800 dark:text-amber-200">
              Catatan Penting:
            </h4>
            <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>
                  Belum termasuk formulir pendaftaran Rp 100.000
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>
                  Bonus souvenir cantik bagi yang melunasi maksimal bulan Juni
                  2026
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span>•</span>
                <span>
                  Perbedaan biaya Gelombang 1 dan 2 ada pada Infaq Pembangunan
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-500 to-blue-600 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <Users className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Siap Bergabung?</h2>
          <p className="text-xl mb-8">
            Daftarkan putra-putri Anda sekarang dan dapatkan bonus souvenir
            cantik untuk pendaftar awal!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-6 text-lg"
              >
                Daftar Online
              </Button>
            </Link>
            <Link href="/kontak">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg text-white border-white hover:bg-white hover:text-teal-600"
              >
                Hubungi Kami
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}