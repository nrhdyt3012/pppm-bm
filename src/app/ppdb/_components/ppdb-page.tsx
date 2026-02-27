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
  School,
  Clock,
  MapPin,
} from "lucide-react";

export default function PPDBPage() {
  const persyaratan = [
    "Fotokopi Akta Kelahiran (2 lembar)",
    "Fotokopi Kartu Keluarga (2 lembar)",
    "Fotokopi KTP Orang Tua (2 lembar)",
    "Pas Foto 3x4 (6 lembar)",
    "Surat Keterangan Sehat dari Dokter",
    "Fotokopi Ijazah/SKHUN terakhir (2 lembar)",
    "Surat Kelakuan Baik dari Sekolah asal",
    "Surat pernyataan sanggup mengikuti peraturan pesantren",
  ];

  const biayaPendaftaran = [
    { item: "Formulir Pendaftaran", biaya: "Rp 100.000" },
    { item: "Biaya Tes Masuk", biaya: "Rp 200.000" },
  ];

  const biayaAwal = [
    { item: "Uang Pangkal", biaya: "Rp 5.000.000" },
    { item: "Seragam & Perlengkapan", biaya: "Rp 2.000.000" },
    { item: "Buku & Kitab", biaya: "Rp 1.500.000" },
    { item: "Matras & Lemari", biaya: "Rp 1.000.000" },
  ];

  const biayaBulanan = [
    { item: "SPP", biaya: "Rp 800.000" },
    { item: "Uang Makan", biaya: "Rp 600.000" },
    { item: "Asrama", biaya: "Rp 300.000" },
    { item: "Kegiatan Ekstrakurikuler", biaya: "Rp 100.000" },
  ];

  const jadwalPPDB = [
    {
      fase: "Pendaftaran Gelombang 1",
      tanggal: "1 Januari - 31 Maret 2025",
      status: "Buka",
    },
    {
      fase: "Pendaftaran Gelombang 2",
      tanggal: "1 April - 31 Mei 2025",
      status: "Segera",
    },
    {
      fase: "Tes Seleksi",
      tanggal: "5-10 Juni 2025",
      status: "Segera",
    },
    {
      fase: "Pengumuman Kelulusan",
      tanggal: "15 Juni 2025",
      status: "Segera",
    },
    {
      fase: "Daftar Ulang",
      tanggal: "16-30 Juni 2025",
      status: "Segera",
    },
    {
      fase: "Masa Orientasi Santri",
      tanggal: "1-7 Juli 2025",
      status: "Segera",
    },
  ];

  const alurPendaftaran = [
    {
      step: 1,
      title: "Pengisian Formulir",
      desc: "Isi formulir pendaftaran online atau datang langsung",
    },
    {
      step: 2,
      title: "Pembayaran Pendaftaran",
      desc: "Bayar biaya pendaftaran dan dapatkan nomor peserta",
    },
    {
      step: 3,
      title: "Tes Seleksi",
      desc: "Tes tulis, baca Al-Quran, dan wawancara",
    },
    {
      step: 4,
      title: "Pengumuman",
      desc: "Pengumuman kelulusan melalui website dan papan pengumuman",
    },
    {
      step: 5,
      title: "Daftar Ulang",
      desc: "Melengkapi berkas dan pembayaran uang pangkal",
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
            Tahun Ajaran 2025/2026
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">Pendaftaran Dibuka!</span>
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
            <h2 className="text-4xl font-bold mb-4">Jadwal PPDB 2025/2026</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Timeline lengkap proses penerimaan santri baru
            </p>
          </div>

          <div className="space-y-4">
            {jadwalPPDB.map((item, index) => (
              <Card key={index} className="hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-2">
                        {item.fase}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4" />
                        <span>{item.tanggal}</span>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-medium ${
                          item.status === "Buka"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
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
              Langkah-langkah mudah untuk menjadi santri
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
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Biaya */}
      <section
        id="biaya"
        className="py-20 px-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <DollarSign className="w-16 h-16 mx-auto text-teal-500 mb-4" />
            <h2 className="text-4xl font-bold mb-4">Informasi Biaya</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Rincian biaya pendidikan di pesantren
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Biaya Pendaftaran */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Biaya Pendaftaran</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {biayaPendaftaran.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm">{item.item}</span>
                      <span className="font-semibold">{item.biaya}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between font-bold text-teal-600">
                    <span>Total</span>
                    <span>Rp 300.000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Biaya Awal */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Biaya Awal Masuk</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {biayaAwal.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm">{item.item}</span>
                      <span className="font-semibold">{item.biaya}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between font-bold text-teal-600">
                    <span>Total</span>
                    <span>Rp 9.500.000</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Biaya Bulanan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Biaya Bulanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {biayaBulanan.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-sm">{item.item}</span>
                      <span className="font-semibold">{item.biaya}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 flex justify-between font-bold text-teal-600">
                    <span>Total</span>
                    <span>Rp 1.800.000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Catatan:</strong> Biaya dapat berubah sewaktu-waktu. Untuk
              informasi lebih detail dan beasiswa, silakan hubungi bagian
              administrasi pesantren.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-500 to-blue-600 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <Users className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Siap Bergabung?</h2>
          <p className="text-xl mb-8">
            Daftarkan putra-putri Anda sekarang dan raih masa depan yang cerah
            dengan pendidikan Islam berkualitas
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