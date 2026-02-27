// src/app/fasilitas/_components/fasilitas.tsx
"use client";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import {
  Home,
  Building2,
  BookOpen,
  School,
  Utensils,
  Activity,
  Wifi,
  Shield,
} from "lucide-react";

export default function FasilitasPage() {
  const facilities = [
    {
      id: "asrama",
      icon: <Home className="w-12 h-12 text-teal-500" />,
      title: "Asrama Santri",
      description:
        "Asrama nyaman dan aman dengan kapasitas 50 santri per kamar, dilengkapi lemari, kasur, dan ventilasi yang baik",
      features: [
        "Kamar ber-AC",
        "Lemari pribadi",
        "Kamar mandi dalam",
        "Area belajar bersama",
        "CCTV 24 jam",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "masjid",
      icon: <Building2 className="w-12 h-12 text-teal-500" />,
      title: "Masjid",
      description:
        "Masjid megah dengan kapasitas 1000 jamaah, menjadi pusat kegiatan ibadah dan kajian",
      features: [
        "Sound system modern",
        "AC sentral",
        "Tempat wudhu terpisah",
        "Perpustakaan mini",
        "Ruang kajian",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "perpustakaan",
      icon: <BookOpen className="w-12 h-12 text-teal-500" />,
      title: "Perpustakaan",
      description:
        "Koleksi ribuan buku Islam klasik dan modern, jurnal, dan referensi akademik",
      features: [
        "5000+ koleksi buku",
        "Ruang baca ber-AC",
        "Digital library",
        "Area diskusi",
        "Wifi gratis",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "kelas",
      icon: <School className="w-12 h-12 text-teal-500" />,
      title: "Ruang Kelas",
      description:
        "Ruang kelas modern dengan fasilitas multimedia untuk pembelajaran efektif",
      features: [
        "Proyektor LCD",
        "AC dan wifi",
        "Whiteboard interaktif",
        "Meja kursi ergonomis",
        "Pencahayaan optimal",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "dapur",
      icon: <Utensils className="w-12 h-12 text-teal-500" />,
      title: "Dapur & Kantin",
      description:
        "Dapur bersih dengan standar kesehatan, menyediakan makanan bergizi 3x sehari",
      features: [
        "Menu variatif",
        "Gizi seimbang",
        "Halal & higienis",
        "Kantin sehat",
        "Ruang makan luas",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "olahraga",
      icon: <Activity className="w-12 h-12 text-teal-500" />,
      title: "Fasilitas Olahraga",
      description:
        "Lapangan dan peralatan olahraga lengkap untuk menjaga kesehatan santri",
      features: [
        "Lapangan futsal",
        "Lapangan basket",
        "Meja tenis",
        "Lapangan voli",
        "Alat fitness",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "internet",
      icon: <Wifi className="w-12 h-12 text-teal-500" />,
      title: "Internet & Teknologi",
      description:
        "Akses internet cepat dan fasilitas teknologi untuk pembelajaran digital",
      features: [
        "Wifi fiber 100 Mbps",
        "Lab komputer",
        "E-learning system",
        "Smart class",
        "Digital library",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "keamanan",
      icon: <Shield className="w-12 h-12 text-teal-500" />,
      title: "Keamanan",
      description:
        "Sistem keamanan 24 jam untuk menjaga keselamatan santri",
      features: [
        "CCTV 24/7",
        "Satpam 24 jam",
        "Akses kontrol",
        "Klinik kesehatan",
        "Ambulan siaga",
      ],
      image: "/logo_ppm.svg",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-blue-500 to-teal-600 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Fasilitas Pesantren</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Sarana dan prasarana lengkap untuk menunjang pendidikan berkualitas
          </p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {facilities.map((facility, index) => (
              <div
                key={index}
                id={facility.id}
                className="scroll-mt-32"
              >
                <Card className="hover:shadow-2xl transition-all overflow-hidden h-full">
                  <div className="relative h-64 bg-gradient-to-br from-teal-100 to-blue-100 dark:from-teal-900 dark:to-blue-900">
                    <Image
                      src={facility.image}
                      alt={facility.title}
                      fill
                      className="object-contain p-8"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-4">
                      {facility.icon}
                      <CardTitle className="text-2xl">
                        {facility.title}
                      </CardTitle>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      {facility.description}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-semibold mb-3 text-teal-600 dark:text-teal-400">
                      Fasilitas Utama:
                    </h4>
                    <ul className="space-y-2">
                      {facility.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                          <span className="text-gray-700 dark:text-gray-300">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Komitmen Kami</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            Kami terus mengembangkan dan memperbarui fasilitas untuk memberikan
            pengalaman belajar yang optimal bagi santri. Semua fasilitas
            dirawat dengan baik dan dipantau secara berkala untuk memastikan
            kenyamanan dan keamanan.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🏆", text: "Fasilitas Modern" },
              { icon: "✨", text: "Bersih & Terawat" },
              { icon: "🔒", text: "Aman & Nyaman" },
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <p className="font-semibold">{item.text}</p>
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