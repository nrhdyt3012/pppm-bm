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
  School2,
  BookOpen,
  Users,
  Calendar,
  Target,
  Lightbulb,
  Award,
  Heart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";

export default function Homepage() {
  const features = [
    {
      icon: <BookOpen className="w-12 h-12 text-teal-500" />,
      title: "Program Tahfidz",
      description:
        "Metode menghafal Al-Quran yang efektif dan menyenangkan dengan bimbingan ustadz berpengalaman",
    },
    {
      icon: <School2 className="w-12 h-12 text-teal-500" />,
      title: "Pendidikan Formal",
      description:
        "Kurikulum terintegrasi setara SD, SMP, dan SMA dengan standar nasional",
    },
    {
      icon: <Users className="w-12 h-12 text-teal-500" />,
      title: "Pembinaan Karakter",
      description:
        "Membentuk akhlakul karimah melalui teladan dan pembiasaan sehari-hari",
    },
    {
      icon: <Award className="w-12 h-12 text-teal-500" />,
      title: "Prestasi Gemilang",
      description:
        "Santri kami berprestasi di berbagai kompetisi tingkat regional dan nasional",
    },
  ];

  const stats = [
    { value: "500+", label: "Santri Aktif" },
    { value: "50+", label: "Tenaga Pengajar" },
    { value: "25+", label: "Tahun Berdiri" },
    { value: "95%", label: "Kelulusan" },
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
                alt="Logo PPPM Baitul Makmur"
                width={150}
                height={150}
                className="rounded-full shadow-2xl"
              />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-gray-100">
              Pondok Pesantren
              <br />
              <span className="text-teal-500">Baitul Makmur</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Membentuk Generasi Qurani yang Berakhlak Mulia dan Berprestasi
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/ppdb">
                <Button
                  size="lg"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 text-lg"
                >
                  <School2 className="mr-2" />
                  Daftar Santri Baru
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

      {/* Features Section */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Keunggulan Kami
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Pondok Pesantren Baitul Makmur memberikan pendidikan holistik
              yang mengintegrasikan nilai-nilai Islam dengan pendidikan modern
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-teal-500"
              >
                <CardHeader>
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle className="text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Visi Misi Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-8 h-8 text-teal-500" />
                  <CardTitle className="text-2xl">Visi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Menjadi lembaga pendidikan Islam yang unggul dalam membentuk
                  generasi Qurani, berakhlak mulia, dan berwawasan luas
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <Lightbulb className="w-8 h-8 text-teal-500" />
                  <CardTitle className="text-2xl">Misi</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">📘</span>
                    <span>
                      Menyelenggarakan pendidikan agama Islam berkualitas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">📜</span>
                    <span>Membentuk karakter santri berakhlakul karimah</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">🌿</span>
                    <span>Mengembangkan potensi santri secara optimal</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Profil Pesantren
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Lihat video profil kami untuk mengenal lebih dekat
            </p>
          </div>
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/Sqd_zdocELI"
              title="Profil Pondok Pesantren Baitul Makmur"
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
            Wujudkan impian putra-putri Anda menjadi generasi Qurani yang
            berakhlak mulia dan berprestasi
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