// src/app/profil/_components/profil.tsx
"use client";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  Users,
  GraduationCap,
  BookOpen,
  Target,
  Award,
} from "lucide-react";

export default function ProfilPage() {
  const pengurus = [
    {
      nama: "KH. Ahmad Yusuf",
      jabatan: "Pengasuh Pondok Pesantren",
      photo: "/logo_ppm.svg",
    },
    {
      nama: "Ustadz Muhammad Ali",
      jabatan: "Kepala Sekolah",
      photo: "/logo_ppm.svg",
    },
    {
      nama: "Ustadzah Siti Fatimah",
      jabatan: "Koordinator Asrama Putri",
      photo: "/logo_ppm.svg",
    },
    {
      nama: "Ustadz Abdul Rahman",
      jabatan: "Koordinator Asrama Putra",
      photo: "/logo_ppm.svg",
    },
  ];

  const sejarahTimeline = [
    {
      tahun: "1995",
      event: "Pendirian Pondok Pesantren",
      description:
        "Didirikan oleh KH. Abdul Karim dengan 20 santri pertama",
    },
    {
      tahun: "2000",
      event: "Pembangunan Gedung Baru",
      description: "Perluasan fasilitas dengan gedung 3 lantai",
    },
    {
      tahun: "2010",
      event: "Akreditasi A",
      description: "Mendapat akreditasi A dari Kemenag",
    },
    {
      tahun: "2020",
      event: "Digitalisasi Sistem",
      description: "Implementasi sistem pembelajaran dan administrasi digital",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-teal-500 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Profil Pesantren</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Mengenal lebih dekat Pondok Pesantren Baitul Makmur
          </p>
        </div>
      </section>

      {/* Sejarah Section */}
      <section id="sejarah" className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Sejarah Pesantren
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Perjalanan panjang dalam membentuk generasi Qurani
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
            <div>
              <Image
                src="/logo_ppm.svg"
                alt="Gedung Pesantren"
                width={600}
                height={400}
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-teal-500">
                Awal Mula Berdiri
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Pondok Pesantren Baitul Makmur didirikan pada tahun 1995 oleh
                KH. Abdul Karim dengan visi membentuk generasi Qurani yang
                berakhlak mulia. Bermula dari sebuah langgar kecil dengan 20
                santri, kini telah berkembang menjadi lembaga pendidikan Islam
                terkemuka dengan lebih dari 500 santri.
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Nama Baitul Makmur diambil dari nama rumah di langit yang
                disinggahi Rasulullah SAW saat Isra Miraj, melambangkan cita-cita
                luhur untuk menjadikan pesantren sebagai rumah penuh berkah
                dan kemakmuran spiritual.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-center mb-12">
              Timeline Perkembangan
            </h3>
            <div className="space-y-8">
              {sejarahTimeline.map((item, index) => (
                <div
                  key={index}
                  className="relative pl-8 border-l-4 border-teal-500"
                >
                  <div className="absolute -left-3 top-0 w-6 h-6 bg-teal-500 rounded-full"></div>
                  <div className="mb-1">
                    <span className="inline-block bg-teal-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {item.tahun}
                    </span>
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{item.event}</h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Visi Misi Section */}
      <section
        id="visi-misi"
        className="py-20 px-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Visi & Misi
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Arah dan tujuan kami dalam mendidik generasi Qurani
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Visi */}
            <Card className="hover:shadow-2xl transition-all">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-teal-100 dark:bg-teal-900 rounded-full">
                    <Target className="w-8 h-8 text-teal-600 dark:text-teal-400" />
                  </div>
                  <h3 className="text-2xl font-bold">Visi</h3>
                </div>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Menjadi lembaga pendidikan Islam yang unggul dalam membentuk
                  generasi Qurani, berakhlak mulia, cerdas, dan berdaya saing
                  global dengan tetap berpegang teguh pada nilai-nilai
                  Ahlussunnah Wal Jamaah
                </p>
              </CardContent>
            </Card>

            {/* Misi */}
            <Card className="hover:shadow-2xl transition-all">
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold">Misi</h3>
                </div>
                <ul className="space-y-4">
                  {[
                    "Menyelenggarakan pendidikan agama Islam yang berkualitas dan komprehensif",
                    "Membentuk karakter santri yang berakhlakul karimah dan bertanggung jawab",
                    "Mengembangkan potensi santri secara optimal melalui pendidikan holistik",
                    "Mencetak generasi hafidz dan hafidzhah Al-Quran yang berkualitas",
                    "Membangun sistem manajemen yang profesional, transparan, dan akuntabel",
                    "Menjalin kerjasama dengan berbagai pihak untuk pengembangan pesantren",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-1 p-1 bg-teal-500 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Struktur Organisasi Section */}
      <section
        id="struktur"
        className="py-20 px-6 bg-white dark:bg-gray-800"
      >
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Struktur Organisasi
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Tim pengurus dan pengajar yang berdedikasi
            </p>
          </div>

          {/* Pengurus */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {pengurus.map((person, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all hover:scale-105"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <Image
                      src={person.photo}
                      alt={person.nama}
                      width={120}
                      height={120}
                      className="rounded-full border-4 border-teal-500"
                    />
                  </div>
                  <h4 className="font-bold text-lg mb-1">{person.nama}</h4>
                  <p className="text-sm text-teal-600 dark:text-teal-400">
                    {person.jabatan}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Statistik */}
          <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <Users className="w-8 h-8" />,
                value: "500+",
                label: "Santri Aktif",
              },
              {
                icon: <GraduationCap className="w-8 h-8" />,
                value: "50+",
                label: "Tenaga Pendidik",
              },
              {
                icon: <BookOpen className="w-8 h-8" />,
                value: "25+",
                label: "Tahun Berdiri",
              },
              {
                icon: <Award className="w-8 h-8" />,
                value: "95%",
                label: "Tingkat Kelulusan",
              },
            ].map((stat, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-teal-50 to-blue-50 dark:from-teal-950 dark:to-blue-950 border-2 border-teal-200 dark:border-teal-800"
              >
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center text-teal-600 dark:text-teal-400 mb-3">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
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