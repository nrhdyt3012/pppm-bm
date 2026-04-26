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
  Utensils,
  Activity,
  Shield,
  Baby,
  Palette,
  TreePine,
  Music,
} from "lucide-react";

export default function FasilitasPage() {
  const facilities = [
    {
      id: "ruang-kelas",
      icon: <Home className="w-12 h-12 text-teal-500" />,
      title: "Ruang Kelas",
      description:
        "Ruang kelas yang nyaman, bersih, dan dilengkapi dengan berbagai alat peraga edukatif",
      features: [
        "AC dan ventilasi baik",
        "Pencahayaan optimal",
        "Alat peraga edukatif lengkap",
        "Area bermain dalam kelas",
        "Meja kursi ergonomis untuk anak",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "area-bermain",
      icon: <Activity className="w-12 h-12 text-teal-500" />,
      title: "Area Bermain Outdoor",
      description:
        "Area bermain outdoor yang aman dengan berbagai permainan edukatif",
      features: [
        "Playground aman untuk anak",
        "Ayunan dan perosotan",
        "Area lari dan olahraga",
        "Permainan edukatif outdoor",
        "Pengawasan ketat dari guru",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "perpustakaan",
      icon: <BookOpen className="w-12 h-12 text-teal-500" />,
      title: "Perpustakaan Mini",
      description:
        "Perpustakaan dengan koleksi buku cerita dan buku edukatif untuk anak",
      features: [
        "Koleksi buku cerita bergambar",
        "Buku edukatif islami",
        "Area reading corner",
        "Buku dongeng dan ensiklopedia anak",
        "Peminjaman buku untuk dibawa pulang",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "masjid",
      icon: <Building2 className="w-12 h-12 text-teal-500" />,
      title: "Musholla",
      description:
        "Musholla bersih untuk praktek ibadah dan pembelajaran agama",
      features: [
        "Area sholat berjamaah",
        "Tempat wudhu khusus anak",
        "Pembelajaran praktek ibadah",
        "Hafalan do'a dan surat pendek",
        "Bersih dan nyaman",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "kantin",
      icon: <Utensils className="w-12 h-12 text-teal-500" />,
      title: "Kantin Sehat",
      description:
        "Kantin dengan menu makanan sehat dan bergizi untuk anak",
      features: [
        "Menu makanan sehat",
        "Gizi seimbang",
        "Halal dan higienis",
        "Snack sehat",
        "Area makan bersih",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "toilet",
      icon: <Baby className="w-12 h-12 text-teal-500" />,
      title: "Toilet Training Area",
      description:
        "Toilet khusus anak dengan fasilitas lengkap untuk toilet training",
      features: [
        "Toilet duduk ramah anak",
        "Wastafel sesuai tinggi anak",
        "Bersih dan terawat",
        "Pendampingan guru",
        "Program toilet training",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "sentra-seni",
      icon: <Palette className="w-12 h-12 text-teal-500" />,
      title: "Sentra Seni & Kreativitas",
      description: "Ruang khusus untuk kegiatan seni dan kreativitas anak",
      features: [
        "Alat lukis dan mewarnai",
        "Bahan craft lengkap",
        "Area prakarya",
        "Display karya anak",
        "Bimbingan guru seni",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "taman",
      icon: <TreePine className="w-12 h-12 text-teal-500" />,
      title: "Taman Edukasi",
      description: "Taman dengan berbagai tanaman untuk pembelajaran alam",
      features: [
        "Kebun sayur edukatif",
        "Tanaman hias",
        "Area berkebun untuk anak",
        "Pembelajaran tentang alam",
        "Teduh dan asri",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "ruang-musik",
      icon: <Music className="w-12 h-12 text-teal-500" />,
      title: "Ruang Musik & Gerak",
      description: "Ruang untuk kegiatan musik, menyanyi, dan gerak motorik",
      features: [
        "Alat musik sederhana",
        "Sound system",
        "Area untuk gerak dan tari",
        "Pembelajaran lagu islami",
        "Pengembangan motorik kasar",
      ],
      image: "/logo_ppm.svg",
    },
    {
      id: "keamanan",
      icon: <Shield className="w-12 h-12 text-teal-500" />,
      title: "Keamanan",
      description: "Sistem keamanan terjaga untuk kenyamanan dan keselamatan",
      features: [
        "CCTV di area strategis",
        "Pagar pengaman",
        "Satpam dan penjaga",
        "Pintu otomatis",
        "UKS dengan obat-obatan dasar",
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
          <h1 className="text-5xl font-bold mb-4">Fasilitas Sekolah</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Sarana dan prasarana lengkap untuk mendukung tumbuh kembang optimal
            anak
          </p>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {facilities.map((facility, index) => (
              <div key={index} id={facility.id} className="scroll-mt-32">
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
            Kami berkomitmen untuk terus mengembangkan dan memperbarui fasilitas
            demi memberikan pengalaman belajar yang optimal bagi setiap anak.
            Semua fasilitas dirawat dengan baik dan dipantau secara berkala untuk
            memastikan kenyamanan, keamanan, dan kebersihan.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🏆", text: "Fasilitas Lengkap" },
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

      {/* Standar Kebersihan dan Keamanan */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Standar Kebersihan & Keamanan
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">🧼</span>
                  Protokol Kebersihan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">
                      Pembersihan ruangan setiap hari
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">
                      Sterilisasi mainan dan alat peraga
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">
                      Hand sanitizer di setiap area
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">Pemantauan kesehatan anak</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-3xl">🛡️</span>
                  Sistem Keamanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">CCTV 24 jam</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">
                      Sistem jemput antar yang aman
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">
                      Guru pendamping di setiap kegiatan
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full mt-1.5"></div>
                    <span className="text-sm">
                      Kontak darurat dengan orang tua
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}