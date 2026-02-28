"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Eye, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useMemo } from "react";

// Data berita statis (nanti bisa diganti dengan API)
const beritaData = [
  {
    id: 1,
    judul: "SMP Budi Utomo Perak Melaju Gemilang di Kejurkab Softball Piala KONI 2025",
    ringkasan:
      "Tim softball SMP Budi Utomo Perak berhasil meraih prestasi gemilang dalam Kejuaraan Kabupaten Softball Piala KONI 2025.",
    gambar: "/logo_ppm.svg",
    tanggal: "2025-11-17",
    kategori: "Prestasi",
    views: 234,
    slug: "smp-budi-utomo-perak-melaju-gemilang-di-kejurkab-softball-piala-koni-2025",
  },
  {
    id: 2,
    judul: "SMP Budi Utomo Perak Raih Juara Harapan 1 pada MathOlympiad 2025",
    ringkasan:
      "Santri berprestasi dari SMP Budi Utomo Perak berhasil meraih Juara Harapan 1 dalam kompetisi MathOlympiad tingkat nasional.",
    gambar: "/logo_ppm.svg",
    tanggal: "2025-11-16",
    kategori: "Prestasi",
    views: 189,
    slug: "smp-budi-utomo-perak-raih-juara-harapan-1-matholympiad-2025",
  },
  {
    id: 3,
    judul: "Prestasi Gemilang Siswa SMP Budi Utomo Gadingmangu di POPKAB Jombang 2025",
    ringkasan:
      "Siswa SMP Budi Utomo Gadingmangu menorehkan prestasi membanggakan dalam Pekan Olahraga Pelajar Kabupaten Jombang 2025.",
    gambar: "/logo_ppm.svg",
    tanggal: "2025-11-06",
    kategori: "Olahraga",
    views: 156,
    slug: "prestasi-gemilang-siswa-smp-budi-utomo-gadingmangu-di-popkab-jombang-2025",
  },
  {
    id: 4,
    judul: "SMP Budi Utomo Gadingmangu Raih Juara 1 A3F Futsal Student Competition 2025",
    ringkasan:
      "Tim futsal SMP Budi Utomo Gadingmangu sukses menjuarai A3F Futsal Student Competition 2025 setelah mengalahkan tim-tim tangguh.",
    gambar: "/logo_ppm.svg",
    tanggal: "2025-10-06",
    kategori: "Olahraga",
    views: 198,
    slug: "smp-budi-utomo-gadingmangu-raih-juara-1-a3f-futsal-student-competition-2025",
  },
  {
    id: 5,
    judul: "Kegiatan Tahfidz Ramadhan: Menghafal Al-Quran di Bulan Penuh Berkah",
    ringkasan:
      "Santri Pondok Pesantren Baitul Makmur mengikuti program intensif tahfidz selama bulan Ramadhan dengan target hafalan 1 juz.",
    gambar: "/logo_ppm.svg",
    tanggal: "2025-03-15",
    kategori: "Kegiatan",
    views: 312,
    slug: "kegiatan-tahfidz-ramadhan-menghafal-alquran-di-bulan-penuh-berkah",
  },
  {
    id: 6,
    judul: "Wisuda Santri Angkatan 2025: 150 Santri Berhasil Lulus",
    ringkasan:
      "Sebanyak 150 santri dinyatakan lulus dan siap melanjutkan pendidikan ke jenjang yang lebih tinggi.",
    gambar: "/logo_ppm.svg",
    tanggal: "2025-06-20",
    kategori: "Wisuda",
    views: 445,
    slug: "wisuda-santri-angkatan-2025-150-santri-berhasil-lulus",
  },
];

// Helper untuk format tanggal Indonesia
function formatTanggal(dateString: string) {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
}

export default function BeritaTerbaru() {
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  // Generate list bulan yang tersedia dari data berita
  const availableMonths = useMemo(() => {
    const months = new Set(
      beritaData.map((berita) => {
        const date = new Date(berita.tanggal);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      })
    );
    return Array.from(months).sort().reverse();
  }, []);

  // Filter berita berdasarkan bulan yang dipilih
  const filteredBerita = useMemo(() => {
    if (selectedMonth === "all") {
      return beritaData;
    }

    return beritaData.filter((berita) => {
      const date = new Date(berita.tanggal);
      const beritaMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return beritaMonth === selectedMonth;
    });
  }, [selectedMonth]);

  return (
    <section
      id="berita"
      className="py-20 px-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
    >
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            Berita & Kegiatan Terbaru
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ikuti perkembangan dan prestasi terbaru dari Pondok Pesantren Baitul
            Makmur
          </p>
        </div>

        {/* Filter Bulan */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">
            <Calendar className="w-5 h-5 text-teal-500" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter Bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Berita</SelectItem>
                {availableMonths.map((month) => {
                  const date = new Date(month + "-01");
                  const label = date.toLocaleDateString("id-ID", {
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <SelectItem key={month} value={month}>
                      {label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Berita Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredBerita.length > 0 ? (
            filteredBerita.map((berita) => (
              <Card
                key={berita.id}
                className="group hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 overflow-hidden">
                  <Image
                    src={berita.gambar}
                    alt={berita.judul}
                    fill
                    className="object-contain p-8 group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-teal-500 text-white text-xs font-semibold rounded-full">
                      {berita.kategori}
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* Date & Views */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatTanggal(berita.tanggal)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{berita.views} views</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                    {berita.judul}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                    {berita.ringkasan}
                  </p>

                  {/* Read More Button */}
                  <Button
                    variant="ghost"
                    className="w-full group/button hover:bg-teal-50 dark:hover:bg-teal-950"
                    asChild
                  >
                    <Link href={`/berita/${berita.slug}`}>
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-4 h-4 group-hover/button:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Tidak ada berita untuk bulan yang dipilih
              </p>
            </div>
          )}
        </div>

        {/* View All Button */}
        {filteredBerita.length > 0 && (
          <div className="text-center">
            <Button
              size="lg"
              variant="outline"
              className="px-8 hover:bg-teal-50 hover:border-teal-500 dark:hover:bg-teal-950"
            >
              Lihat Semua Berita
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}