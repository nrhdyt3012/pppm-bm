// src/app/info-sekolah/_components/info-sekolah.tsx
"use client";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  GraduationCap,
  Award,
  Users,
  Clock,
  Calendar,
  Trophy,
  Star,
} from "lucide-react";

export default function InfoSekolahPage() {
  const programs = [
    {
      title: "Program Tahfidz",
      icon: <BookOpen className="w-8 h-8 text-teal-500" />,
      description: "Target hafalan 30 juz dengan metode Yanbu'a",
      details: [
        "Tahfidz 1 Juz per tahun",
        "Bimbingan ustadz tahfidz",
        "Muroja'ah rutin",
        "Ujian setoran",
      ],
    },
    {
      title: "Pendidikan Formal",
      icon: <GraduationCap className="w-8 h-8 text-teal-500" />,
      description: "Setara SMP dan SMA dengan kurikulum nasional",
      details: [
        "Kurikulum K13",
        "Akreditasi A",
        "UN Berbasis Komputer",
        "Persiapan PTN",
      ],
    },
    {
      title: "Kitab Kuning",
      icon: <BookOpen className="w-8 h-8 text-teal-500" />,
      description: "Kajian kitab klasik salaf",
      details: [
        "Fiqh: Safinatun Najah",
        "Nahwu: Jurumiyah",
        "Tafsir: Jalalain",
        "Hadits: Bulughul Maram",
      ],
    },
    {
      title: "Bahasa Arab & Inggris",
      icon: <Users className="w-8 h-8 text-teal-500" />,
      description: "Penguasaan bahasa asing aktif",
      details: [
        "Conversation setiap hari",
        "Vocabulary building",
        "Native speaker",
        "Sertifikat TOEFL",
      ],
    },
  ];

  const ekstrakurikuler = [
    {
      name: "Pramuka",
      icon: "🏕️",
      description: "Pembentukan karakter dan kepemimpinan",
    },
    {
      name: "Hadroh",
      icon: "🥁",
      description: "Seni musik Islam tradisional",
    },
    {
      name: "Kaligrafi",
      icon: "✍️",
      description: "Seni menulis khat Arab",
    },
    {
      name: "Olahraga",
      icon: "⚽",
      description: "Futsal, basket, voli, dan bulutangkis",
    },
    {
      name: "Jurnalistik",
      icon: "📰",
      description: "Majalah dinding dan dokumentasi",
    },
    {
      name: "Komputer",
      icon: "💻",
      description: "Microsoft Office dan desain grafis",
    },
  ];

  const prestasi = [
    {
      tahun: "2024",
      event: "Juara 1 MTQ Tingkat Provinsi",
      kategori: "Tahfidz 10 Juz",
    },
    {
      tahun: "2024",
      event: "Juara 2 OSN Matematika",
      kategori: "Tingkat Kota",
    },
    {
      tahun: "2023",
      event: "Juara 1 Kaligrafi Nasional",
      kategori: "Kontemporer",
    },
    {
      tahun: "2023",
      event: "Juara 3 Cerdas Cermat Agama",
      kategori: "Tingkat Provinsi",
    },
  ];

  const jadwalHarian = [
    { waktu: "04.00 - 05.00", kegiatan: "Qiyamullail & Tahajud" },
    { waktu: "05.00 - 06.00", kegiatan: "Sholat Subuh & Wirid" },
    { waktu: "06.00 - 07.00", kegiatan: "Setoran Hafalan" },
    { waktu: "07.00 - 12.30", kegiatan: "KBM Formal" },
    { waktu: "12.30 - 15.00", kegiatan: "Istirahat & Sholat Dzuhur" },
    { waktu: "15.00 - 17.00", kegiatan: "Kajian Kitab Kuning" },
    { waktu: "17.00 - 18.30", kegiatan: "Olahraga & Sholat Maghrib" },
    { waktu: "18.30 - 20.00", kegiatan: "Sholat Isya & Belajar Malam" },
    { waktu: "20.00 - 21.00", kegiatan: "Bimbingan Belajar" },
    { waktu: "21.00 - 04.00", kegiatan: "Istirahat Malam" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-purple-500 to-teal-600 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Info Sekolah</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Program pendidikan dan kegiatan di Pondok Pesantren Baitul Makmur
          </p>
        </div>
      </section>

      {/* Program Pendidikan */}
      <section
        id="program"
        className="py-20 px-6 bg-white dark:bg-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Program Pendidikan</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Kurikulum terpadu antara pendidikan formal dan pesantren
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <Card
                key={index}
                className="hover:shadow-2xl transition-all hover:scale-105"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    {program.icon}
                    <CardTitle className="text-xl">{program.title}</CardTitle>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    {program.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {program.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span className="text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Jadwal Harian */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Clock className="w-16 h-16 mx-auto text-teal-500 mb-4" />
            <h2 className="text-4xl font-bold mb-4">Jadwal Harian Santri</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Rutinitas yang terstruktur untuk membentuk disiplin
            </p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {jadwalHarian.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-shrink-0 w-32 font-mono font-semibold text-teal-600 dark:text-teal-400">
                      {item.waktu}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.kegiatan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Ekstrakurikuler */}
      <section
        id="ekstrakurikuler"
        className="py-20 px-6 bg-white dark:bg-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Star className="w-16 h-16 mx-auto text-teal-500 mb-4" />
            <h2 className="text-4xl font-bold mb-4">Ekstrakurikuler</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Pengembangan bakat dan minat santri
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {ekstrakurikuler.map((ekskul, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all hover:scale-105 text-center"
              >
                <CardContent className="p-8">
                  <div className="text-5xl mb-4">{ekskul.icon}</div>
                  <h3 className="text-xl font-bold mb-2">{ekskul.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {ekskul.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Prestasi */}
      <section
        id="prestasi"
        className="py-20 px-6 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <Trophy className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-4xl font-bold mb-4">Prestasi Santri</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Pencapaian membanggakan di berbagai kompetisi
            </p>
          </div>

          <div className="space-y-4">
            {prestasi.map((item, index) => (
              <Card key={index} className="hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {item.tahun}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                        {item.event}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {item.kategori}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}