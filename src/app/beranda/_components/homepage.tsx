// src/app/beranda/_components/homepage.tsx
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  GraduationCap,
  BookOpen,
  Users,
  Heart,
  Star,
  Sparkles,
  Baby,
  School,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import BeritaTerbaru from "./berita-terbaru";

export default function Homepage() {
  const programUnggulan = [
    {
      icon: <BookOpen className="w-12 h-12 text-teal-500" />,
      title: "Mengaji & Tahfidz Metode UMMI",
      description:
        "Metode menghafal Al-Quran yang efektif dan menyenangkan untuk anak usia dini",
    },
    {
      icon: <Star className="w-12 h-12 text-teal-500" />,
      title: "Petualangan Maharaja",
      description:
        "Pintar baca tanpa belajar membaca - metode inovatif pembelajaran literasi",
    },
    {
      icon: <Heart className="w-12 h-12 text-teal-500" />,
      title: "Berkemandirian & Karakter Islami",
      description:
        "Membentuk karakter mandiri dan berakhlak mulia sejak dini",
    },
    {
      icon: <Sparkles className="w-12 h-12 text-teal-500" />,
      title: "Tuntas Toilet Training",
      description:
        "Program khusus melatih kemandirian anak dalam kehidupan sehari-hari",
    },
  ];

  const stats = [
    { value: "150+", label: "Siswa Aktif", icon: <Users /> },
    { value: "15+", label: "Tenaga Pendidik", icon: <GraduationCap /> },
    { value: "10+", label: "Tahun Berdiri", icon: <School /> },
    { value: "100%", label: "Akreditasi A", icon: <Star /> },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background with overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-blue-500/20 to-purple-500/20"></div>
          <div className="absolute inset-0 bg-[url('/logo_ppm.svg')] bg-center bg-no-repeat opacity-5 bg-contain"></div>
        </div>

        <div className="container mx-auto px-6 z-10">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="flex justify-center mb-8">
              <Image
                src="/logo_ppm.svg"
                alt="Logo KB TK Aisyiyah Bustanul Athfal 1 Buduran"
                width={150}
                height={150}
                className="rounded-full shadow-2xl"
              />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-gray-100">
              KB TK 'Aisyiyah
              <br />
              <span className="text-teal-500">Bustanul Athfal 1 Buduran</span>
            </h1>

            <div className="flex flex-col gap-2 max-w-2xl mx-auto">
              <p className="text-2xl md:text-3xl font-semibold text-teal-600 dark:text-teal-400">
                Sholih, Ceria, Mandiri
              </p>
              <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 italic">
                "Diuruk karena menarik, disuka karena beda"
              </p>
            </div>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Sekolah dengan metode <span className="font-bold text-teal-600">Ramah Otak Anak</span>, 
              mengoptimalkan stimulasi 7 Indera Ajaib dan 6 Aspek Perkembangan 
              melalui kegiatan bermain yang menyenangkan
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/ppdb">
                <Button
                  size="lg"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 text-lg"
                >
                  <Baby className="mr-2" />
                  Daftar Siswa Baru
                </Button>
              </Link>
              <Link href="/profil">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg"
                >
                  Pelajari Lebih Lanjut
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg"
                >
                  <div className="flex justify-center text-teal-500 mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-teal-500">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sejarah Singkat */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Selayang Pandang
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>
                  KB TK 'Aisyiyah Bustanul Athfal 1 Buduran merupakan lembaga pendidikan 
                  anak usia dini yang berkomitmen memberikan pendidikan berkualitas dengan 
                  pendekatan Islami dan metode pembelajaran yang ramah terhadap perkembangan otak anak.
                </p>
                <p>
                  Dengan motto <span className="font-semibold text-teal-600">"Sholih, Ceria, Mandiri"</span>, 
                  kami mengoptimalkan potensi setiap anak melalui stimulasi 7 Indera Ajaib 
                  dan pengembangan 6 Aspek Perkembangan dalam suasana bermain yang menyenangkan.
                </p>
                <p>
                  Kami percaya bahwa pembelajaran tidak harus dengan cara duduk diam, 
                  melainkan melalui kegiatan bermain yang terstruktur dan bermakna, 
                  sehingga anak-anak dapat tumbuh dan berkembang secara optimal.
                </p>
              </div>
              <div className="mt-6">
                <Link href="/profil">
                  <Button className="bg-teal-500 hover:bg-teal-600">
                    Baca Selengkapnya
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-96 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/logo_ppm.svg"
                  alt="KB TK Aisyiyah"
                  fill
                  className="object-contain p-8"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Unggulan */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Program Unggulan
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Program-program terbaik yang dirancang khusus untuk mengoptimalkan 
              tumbuh kembang anak usia dini
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programUnggulan.map((program, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-teal-500"
              >
                <CardHeader>
                  <div className="flex justify-center mb-4">{program.icon}</div>
                  <CardTitle className="text-center text-lg">{program.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                    {program.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Berita & Kegiatan */}
      <BeritaTerbaru />

      {/* Video Profil */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Profil Sekolah
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Lihat video profil kami untuk mengenal lebih dekat
            </p>
          </div>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Profil KB TK Aisyiyah Bustanul Athfal 1 Buduran"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-500 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <Heart className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">
            Bergabunglah Bersama Kami
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Wujudkan tumbuh kembang optimal putra-putri Anda dengan pendidikan 
            berkualitas yang Islami, ceria, dan menyenangkan
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ppdb">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 py-6 text-lg"
              >
                Daftar Sekarang
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