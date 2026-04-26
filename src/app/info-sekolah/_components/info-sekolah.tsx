// src/app/info-sekolah/_components/info-sekolah.tsx
"use client";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  GraduationCap,
  Users,
  Clock,
  Calendar,
  Star,
  Baby,
  Sparkles,
  Heart,
  Brain,
} from "lucide-react";
import Image from "next/image";

export default function InfoSekolahPage() {
  const programUnggulan = [
    {
      title: "Mengaji & Tahfidz Metode UMMI",
      icon: "📖",
      description: "Metode menghafal Al-Quran yang efektif dan menyenangkan",
      details: [
        "Pembelajaran Al-Quran dengan metode UMMI",
        "Program tahfidz untuk hafalan juz 30",
        "Bimbingan ustadz/ustadzah berpengalaman",
        "Evaluasi berkala untuk progress anak",
      ],
      image: "/logo_ppm.svg",
    },
    {
      title: "Do'a dan Hadist",
      icon: "🤲",
      description: "Menghafal do'a harian dan hadist pilihan",
      details: [
        "Do'a sehari-hari",
        "Hadist-hadist pilihan untuk anak",
        "Praktik langsung dalam kehidupan",
        "Pembiasaan akhlak mulia",
      ],
      image: "/logo_ppm.svg",
    },
    {
      title: "Petualangan Maharaja",
      icon: "📚",
      description: "Pintar baca tanpa belajar membaca",
      details: [
        "Metode inovatif pembelajaran literasi",
        "Anak pintar membaca dengan cara menyenangkan",
        "Tidak ada drill membaca yang membosankan",
        "Stimulasi minat baca sejak dini",
      ],
      image: "/logo_ppm.svg",
    },
    {
      title: "Berkemandirian dan Berkarakter Islami",
      icon: "🌟",
      description: "Membentuk pribadi mandiri berakhlak mulia",
      details: [
        "Pembiasaan sholat berjamaah",
        "Adab makan dan minum",
        "Toilet training",
        "Mengurus diri sendiri",
      ],
      image: "/logo_ppm.svg",
    },
    {
      title: "Tuntas Toilet Training",
      icon: "🚽",
      description: "Program khusus melatih kemandirian anak",
      details: [
        "Bimbingan toilet training intensif",
        "Pembiasaan rutin",
        "Kerjasama dengan orang tua",
        "Target tuntas sebelum lulus",
      ],
      image: "/logo_ppm.svg",
    },
  ];

  const modelPembelajaran = [
    {
      title: "Metode Ramah Otak Anak",
      description:
        "Pembelajaran disesuaikan dengan cara kerja otak anak usia dini",
      features: [
        "Tidak menuntut anak duduk diam",
        "Belajar sambil bermain",
        "Stimulasi 7 Indera Ajaib",
        "Pengembangan 6 Aspek",
      ],
      icon: <Brain className="w-12 h-12 text-purple-500" />,
    },
    {
      title: "Pembelajaran Berbasis Bermain",
      description: "Kegiatan bermain yang terstruktur dan bermakna",
      features: [
        "Sentra bermain peran",
        "Sentra balok dan konstruksi",
        "Sentra seni dan kreativitas",
        "Sentra alam dan science",
      ],
      icon: <Sparkles className="w-12 h-12 text-yellow-500" />,
    },
    {
      title: "Pembelajaran Islami",
      description: "Integrasi nilai-nilai Islam dalam setiap aktivitas",
      features: [
        "Pembiasaan akhlak mulia",
        "Hafalan do'a dan surat pendek",
        "Praktek ibadah sehari-hari",
        "Kisah-kisah teladan",
      ],
      icon: <Star className="w-12 h-12 text-teal-500" />,
    },
    {
      title: "Keterlibatan Orang Tua",
      description: "Kolaborasi sekolah dan keluarga dalam pendidikan",
      features: [
        "Parenting class rutin",
        "Laporan perkembangan berkala",
        "Konsultasi dengan guru",
        "Kegiatan bersama orang tua",
      ],
      icon: <Heart className="w-12 h-12 text-pink-500" />,
    },
  ];

  const jenjangSekolah = [
    {
      nama: "Kelompok Bermain (KB)",
      usia: "2-4 tahun",
      icon: <Baby className="w-16 h-16 text-blue-500" />,
      jadwal: [
        {
          hari: "Senin - Jum'at",
          waktu: "07.00 - 10.00",
        },
      ],
      kegiatan: [
        "Happy morning",
        "Mengaji",
        "Bekal sehat & bermain",
        "Pembelajaran",
        "Pulang",
      ],
      fokus: [
        "Stimulasi motorik kasar dan halus",
        "Pengenalan warna dan bentuk",
        "Sosialisasi dengan teman",
        "Toilet training",
        "Kemandirian dasar",
      ],
    },
    {
      nama: "Taman Kanak-kanak (TK)",
      usia: "4-6 tahun",
      icon: <GraduationCap className="w-16 h-16 text-teal-500" />,
      jadwal: [
        {
          hari: "Senin - Kamis",
          waktu: "07.00 - 11.30",
        },
        {
          hari: "Jum'at",
          waktu: "07.00 - 10.00",
        },
      ],
      kegiatan: [
        "Happy morning",
        "Mengaji",
        "Bekal sehat & bermain",
        "Pembelajaran",
        "Pulang",
      ],
      fokus: [
        "Persiapan masuk SD/MI",
        "Calistung dasar",
        "Hafalan Al-Quran (Juz 30)",
        "Kemandirian penuh",
        "Keterampilan sosial",
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-purple-500 to-teal-600 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Gallery & Program</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Program unggulan dan kegiatan pembelajaran di KB TK 'Aisyiyah
            Bustanul Athfal 1 Buduran
          </p>
        </div>
      </section>

      {/* Program Unggulan */}
      <section
        id="program"
        className="py-20 px-6 bg-white dark:bg-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Program Unggulan</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Program-program terbaik yang dirancang untuk mengoptimalkan tumbuh
              kembang anak
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programUnggulan.map((program, index) => (
              <Card
                key={index}
                className="hover:shadow-2xl transition-all hover:scale-105"
              >
                <div className="relative h-48 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 overflow-hidden">
                  <Image
                    src={program.image}
                    alt={program.title}
                    fill
                    className="object-contain p-8"
                  />
                  <div className="absolute top-4 left-4 text-4xl">
                    {program.icon}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl">{program.title}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {program.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {program.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Model Pembelajaran */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Model Pembelajaran</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Pendekatan pembelajaran yang disesuaikan dengan karakteristik anak
              usia dini
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {modelPembelajaran.map((model, index) => (
              <Card
                key={index}
                className="hover:shadow-2xl transition-all hover:scale-105"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    {model.icon}
                    <div>
                      <CardTitle className="text-xl">{model.title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {model.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {model.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Jenjang Sekolah */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Jenjang Pendidikan</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Kami melayani pendidikan anak usia dini dari KB hingga TK
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {jenjangSekolah.map((jenjang, index) => (
              <Card
                key={index}
                className="hover:shadow-2xl transition-all border-2 hover:border-teal-500"
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    {jenjang.icon}
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Usia
                      </div>
                      <div className="text-lg font-bold text-teal-600">
                        {jenjang.usia}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{jenjang.nama}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Jadwal */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-teal-500" />
                      Jadwal Pembelajaran
                    </h4>
                    {jenjang.jadwal.map((jadwal, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 p-3 rounded-lg mb-2"
                      >
                        <span className="font-medium">{jadwal.hari}</span>
                        <span className="text-teal-600">{jadwal.waktu}</span>
                      </div>
                    ))}
                  </div>

                  {/* Kegiatan */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-teal-500" />
                      Kegiatan Harian
                    </h4>
                    <ul className="space-y-2">
                      {jenjang.kegiatan.map((kegiatan, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                          <span className="text-sm">{kegiatan}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fokus Pembelajaran */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Star className="w-5 h-5 text-teal-500" />
                      Fokus Pembelajaran
                    </h4>
                    <ul className="space-y-2">
                      {jenjang.fokus.map((fokus, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                          <span className="text-sm">{fokus}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Info Tambahan */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-6">
                Catatan Penting
              </h3>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p className="flex items-start gap-3">
                  <span className="text-2xl">📝</span>
                  <span>
                    <strong>Formulir Pendaftaran:</strong> Rp 100.000 (Belum
                    termasuk formulir pendaftaran Rp 100.000)
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-2xl">🎁</span>
                  <span>
                    <strong>Bonus:</strong> Dapatkan souvenir cantik bagi yang
                    melunasi maks bulan Juni 2026
                  </span>
                </p>
                <p className="flex items-start gap-3">
                  <span className="text-2xl">📅</span>
                  <span>
                    <strong>Pendaftaran mulai:</strong> 6 Desember 2025
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}