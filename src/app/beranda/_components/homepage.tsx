"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  School2,
  BookOpen,
  Users,
  Calendar,
  Instagram,
  MapPin,
  Phone,
  Mail,
  Target,
  Lightbulb,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Homepage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Data Program
  const programs = [
    {
      title: "Program Tahfidz",
      description:
        "Program menghafal Al-Quran dengan metode yang efektif dan menyenangkan",
      icon: <BookOpen className="w-8 h-8 text-teal-500" />,
    },
    {
      title: "Pendidikan Formal",
      description:
        "Pendidikan formal setara SD, SMP, dan SMA dengan kurikulum terintegrasi",
      icon: <School2 className="w-8 h-8 text-teal-500" />,
    },
    {
      title: "Kegiatan Ekstrakurikuler",
      description: "Berbagai kegiatan pengembangan bakat dan minat santri",
      icon: <Users className="w-8 h-8 text-teal-500" />,
    },
    {
      title: "Pengajian Rutin",
      description: "Kajian kitab kuning dan pengajian akbar bersama ulama",
      icon: <Calendar className="w-8 h-8 text-teal-500" />,
    },
  ];

  // Data Event
  const events = [
    {
      title: "Peringatan 17 Agustus",
      date: "17 Agustus 2024",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit",
    },
    {
      title: "Idul Adha 1445 H",
      date: "16 Juni 2024",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit",
    },
    {
      title: "Haul Akbar",
      date: "15 Rajab 2024",
      description: "Lorem ipsum dolor sit amet consectetur adipisicing elit",
    },
  ];

  // Data Testimoni
  const testimonials = [
    {
      name: "Bapak Ahmad Yusuf",
      role: "Wali Santri",
      photo: "/logo_ppm.svg",
      quote:
        "Alhamdulillah, sistem pembayaran yang transparan membuat kami sebagai wali santri merasa tenang dan percaya",
    },
    {
      name: "Ibu Siti Nurhaliza",
      role: "Wali Santri",
      photo: "/logo_ppm.svg",
      quote:
        "Pelayanan yang ramah dan sistem yang mudah digunakan sangat membantu kami",
    },
    {
      name: "Muhammad Rizki",
      role: "Alumni 2023",
      photo: "/logo_ppm.svg",
      quote:
        "Pendidikan di pondok ini sangat berkesan dan membentuk karakter saya",
    },
  ];

  // Data Galeri
  const gallery = [
    "/logo_ppm.svg",
    "/logo_ppm.svg",
    "/logo_ppm.svg",
    "/logo_ppm.svg",
    "/logo_ppm.svg",
    "/logo_ppm.svg",
    "/logo_ppm.svg",
    "/logo_ppm.svg",
    "/logo_ppm.svg",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 via-blue-500/20 to-purple-500/20 animate-gradient-xy"></div>
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
                className="rounded-full shadow-2xl animate-float"
              />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Pondok Pesantren
              <br />
              <span className="text-teal-500">Baitul Makmur</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Menuju Digitalisasi Pembayaran Santri yang Aman & Transparan
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/login">
                <Button
                  size="lg"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-6 text-lg"
                >
                  <School2 className="mr-2" />
                  Masuk Sistem
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                Pelajari Lebih Lanjut
              </Button>
            </div>

            {/* Video Section */}
            <div className="mt-12 flex justify-center">
              <iframe
                className="rounded-2xl shadow-2xl w-full md:w-3/4 h-64 md:h-96"
                src="https://www.youtube.com/embed/Sqd_zdocELI"
                title="Profil Pondok Pesantren Baitul Makmur"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Visi & Misi */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            Visi & Misi
          </h2>

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
                      Menyelenggarakan pendidikan agama Islam yang berkualitas
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">📜</span>
                    <span>
                      Membentuk karakter santri yang berakhlakul karimah
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">🌿</span>
                    <span>Mengembangkan potensi santri secara optimal</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">🤲</span>
                    <span>Mencetak generasi yang hafidz Al-Quran</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-500 mt-1">💫</span>
                    <span>
                      Membangun sistem manajemen yang profesional dan transparan
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Tentang Pesantren */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            Tentang Pesantren
          </h2>

          <div className="max-w-4xl mx-auto">
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <Image
                      src="/logo_ppm.svg"
                      alt="Gedung Pesantren"
                      width={400}
                      height={300}
                      className="rounded-lg shadow-lg w-full"
                    />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-teal-500">
                      Sejarah Singkat
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Pondok Pesantren Baitul Makmur didirikan pada tahun XXXX
                      oleh KH. [Nama Pendiri].
                    </p>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="font-semibold">Pengasuh:</span>
                        <span className="text-gray-600 dark:text-gray-300">
                          KH. [Nama Pengasuh]
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-semibold">Jumlah Santri:</span>
                        <span className="text-gray-600 dark:text-gray-300">
                          XXX Santri
                        </span>
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="font-semibold">Program Unggulan:</span>
                        <span className="text-gray-600 dark:text-gray-300">
                          Tahfidz & Kitab Kuning
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Program & Kegiatan */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            Program & Kegiatan
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {programs.map((program, index) => (
              <Card
                key={index}
                className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <CardHeader>
                  <div className="flex justify-center mb-4">{program.icon}</div>
                  <CardTitle className="text-center">{program.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {program.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Event & Berita */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            Event & Berita Terbaru
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {events.map((event, index) => (
              <Card
                key={index}
                className="hover:shadow-xl hover:scale-105 transition-all duration-300"
              >
                <div className="h-48 bg-gradient-to-br from-teal-400 to-blue-500 rounded-t-lg flex items-center justify-center">
                  <Calendar className="w-16 h-16 text-white" />
                </div>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">
                    {event.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimoni */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            Testimoni & Alumni
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex flex-col items-center gap-4">
                    <Image
                      src={testimonial.photo}
                      alt={testimonial.name}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                    <div className="text-center">
                      <CardTitle className="text-lg">
                        {testimonial.name}
                      </CardTitle>
                      <CardDescription>{testimonial.role}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-gray-600 dark:text-gray-300 italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Galeri */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            Galeri Kegiatan
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {gallery.map((image, index) => (
              <div
                key={index}
                className="relative aspect-square cursor-pointer overflow-hidden rounded-lg hover:scale-105 transition-transform"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image}
                  alt={`Galeri ${index + 1}`}
                  fill
                  className="object-cover hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Link href="https://instagram.com" target="_blank">
              <Button variant="outline" size="lg">
                <Instagram className="mr-2" />
                Instagram Kami
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Kontak & Lokasi */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800 dark:text-gray-100">
            Kontak & Lokasi
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Hubungi Kami</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-teal-500 mt-1" />
                  <div>
                    <p className="font-semibold">Alamat</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      Jl. Lorem Ipsum No. 123, Surabaya, Jawa Timur
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="font-semibold">Telepon</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      +62 XXX XXXX XXXX
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <p className="text-gray-600 dark:text-gray-300">
                      info@baitul-makmur.com
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Instagram className="w-5 h-5 text-teal-500" />
                  <div>
                    <p className="font-semibold">Instagram</p>
                    <Link
                      href="https://instagram.com"
                      target="_blank"
                      className="text-teal-500 hover:underline"
                    >
                      @baitul.makmur
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lokasi Kami</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.1!2d112.7!3d-7.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMTgnMDAuMCJTIDExMsKwNDInMDAuMCJF!5e0!3m2!1sen!2sid!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col items-center gap-8">
            <div className="flex items-center gap-4">
              <Image
                src="/logo_ppm.svg"
                alt="Logo"
                width={60}
                height={60}
                className="rounded-full"
              />
              <div>
                <h3 className="text-xl font-bold">
                  Pondok Pesantren Baitul Makmur
                </h3>
                <p className="text-gray-400 text-sm">
                  Pendidikan Islam Berkualitas
                </p>
              </div>
            </div>

            <nav className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="#" className="hover:text-teal-400 transition-colors">
                Beranda
              </a>
              <a href="#" className="hover:text-teal-400 transition-colors">
                Tentang
              </a>
              <a href="#" className="hover:text-teal-400 transition-colors">
                Program
              </a>
              <Link
                href="/login"
                className="hover:text-teal-400 transition-colors"
              >
                Login
              </Link>
            </nav>

            <Separator className="max-w-4xl" />

            <div className="text-center space-y-2">
              <p className="text-gray-400 text-sm">
                © 2024 Pondok Pesantren Baitul Makmur. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs">
                Dikembangkan oleh Dwi Nurhidayat – Universitas Negeri Surabaya
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Lightbox untuk Galeri */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <Image
              src={selectedImage}
              alt="Preview"
              width={800}
              height={600}
              className="rounded-lg"
            />
            <Button
              variant="outline"
              className="absolute top-4 right-4"
              onClick={() => setSelectedImage(null)}
            >
              Tutup
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
