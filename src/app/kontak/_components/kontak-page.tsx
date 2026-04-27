// src/app/kontak/_components/kontak-page.tsx
"use client";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Instagram,
  Send,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function KontakPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Pesan Terkirim!", {
      description: "Kami akan menghubungi Anda segera. Terima kasih!",
    });
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-8 h-8 text-teal-500" />,
      title: "Alamat",
      content: [
        "Jl. Kavling Persada Asri C-37",
        "Damarsi, Buduran, Sidoarjo",
        "Jawa Timur, Indonesia",
      ],
    },
    {
      icon: <Phone className="w-8 h-8 text-teal-500" />,
      title: "Telepon / WhatsApp",
      content: [
        "Ust. Aminah",
        "0815 5336 6321",
      ],
    },
    {
      icon: <Instagram className="w-8 h-8 text-teal-500" />,
      title: "Media Sosial",
      content: [
        "@abasatubuduran",
        "Instagram KB TK Aisyiyah",
      ],
    },
    {
      icon: <Clock className="w-8 h-8 text-teal-500" />,
      title: "Jam Operasional",
      content: [
        "Senin - Kamis: 07.00 - 12.00 WIB",
        "Jum'at: 07.00 - 11.00 WIB",
        "Sabtu & Minggu: Tutup",
      ],
    },
  ];

  const faq = [
    {
      q: "Apakah bisa berkunjung ke sekolah sebelum mendaftar?",
      a: "Tentu bisa! Kami menyambut calon orang tua murid untuk berkunjung dan melihat langsung fasilitas sekolah. Silakan hubungi kami terlebih dahulu untuk mengatur jadwal kunjungan.",
    },
    {
      q: "Bagaimana cara mendaftar siswa baru?",
      a: "Anda dapat mendaftar dengan datang langsung ke sekolah atau menghubungi kontak kami. Bawa berkas persyaratan dan isi formulir pendaftaran.",
    },
    {
      q: "Apakah tersedia program beasiswa?",
      a: "Untuk informasi mengenai program keringanan biaya atau beasiswa, silakan konsultasi langsung dengan pihak sekolah melalui kontak yang tersedia.",
    },
    {
      q: "Berapa lama masa pendidikan di KB dan TK?",
      a: "KB untuk anak usia 2-4 tahun (1-2 tahun), TK untuk usia 4-6 tahun (2 tahun). Total masa pendidikan di lembaga kami bisa 3-4 tahun tergantung usia masuk.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-indigo-500 to-teal-600 text-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Hubungi Kami</h1>
          <p className="text-xl max-w-2xl mx-auto">
            Kami siap membantu menjawab pertanyaan Anda tentang KB TK 'Aisyiyah
            Bustanul Athfal 1 Buduran
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section
        id="alamat"
        className="py-20 px-6 bg-white dark:bg-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info, index) => (
              <Card key={index} className="hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="flex justify-center mb-4">{info.icon}</div>
                  <CardTitle className="text-center text-xl">
                    {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    {info.content.map((line, idx) => (
                      <p
                        key={idx}
                        className="text-sm text-gray-600 dark:text-gray-400"
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 px-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Kirim Pesan</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nama Lengkap</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="08xx xxxx xxxx"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subjek</Label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Perihal pesan Anda"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Pesan</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tulis pesan Anda di sini..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-teal-500 hover:bg-teal-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Kirim Pesan
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map & WhatsApp */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Lokasi Kami</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.2!2d112.7!3d-7.4!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zN8KwMjQnMDAuMCJTIDExMsKwNDInMDAuMCJF!5e0!3m2!1sen!2sid!4v1234567890"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Lokasi KB TK Aisyiyah Bustanul Athfal 1 Buduran"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <h4 className="font-semibold">Alamat Lengkap:</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Jl. Kavling Persada Asri C-37, Damarsi, Buduran, Sidoarjo,
                      Jawa Timur
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* WhatsApp Quick Contact */}
              <Card className="bg-gradient-to-br from-green-50 to-teal-50 dark:from-green-950 dark:to-teal-950">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <MessageCircle className="w-16 h-16 mx-auto text-green-600" />
                    <h3 className="text-xl font-bold">Hubungi Via WhatsApp</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Butuh informasi cepat? Chat langsung dengan kami melalui
                      WhatsApp
                    </p>
                    <a
                      href="https://wa.me/6281553366321"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Chat WhatsApp
                      </Button>
                    </a>
                    <p className="text-xs text-gray-500">
                      Ust. Aminah - 0815 5336 6321
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section
        id="social"
        className="py-20 px-6 bg-white dark:bg-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ikuti Media Sosial Kami</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12">
            Dapatkan update terbaru dan informasi seputar kegiatan sekolah
          </p>

          <div className="flex justify-center">
            <a
              href="https://instagram.com/abasatubuduran"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="hover:shadow-xl transition-all w-80">
                <CardContent className="p-8">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                    <Instagram className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Instagram</h3>
                  <p className="text-teal-600 dark:text-teal-400 font-semibold mb-2">
                    @abasatubuduran
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Follow Instagram kami untuk melihat kegiatan harian dan
                    prestasi anak-anak
                  </p>
                </CardContent>
              </Card>
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="py-20 px-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Beberapa pertanyaan umum dari calon orang tua murid
            </p>
          </div>

          <div className="space-y-4">
            {faq.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-teal-600 dark:text-teal-400 mb-3">
                    Q: {item.q}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    A: {item.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Masih ada pertanyaan lain?
            </p>
            <a
              href="https://wa.me/6281553366321"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-teal-500 hover:bg-teal-600">
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat dengan Kami
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Jam Kunjungan */}
      <section className="py-20 px-6 bg-white dark:bg-gray-800">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <Clock className="w-16 h-16 mx-auto text-teal-500 mb-4" />
            <h2 className="text-4xl font-bold mb-4">Jam Kunjungan</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Waktu terbaik untuk berkunjung dan konsultasi
            </p>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-teal-500" />
                    <span className="font-semibold">Senin - Kamis</span>
                  </div>
                  <span className="text-teal-600 font-semibold">
                    07.00 - 12.00 WIB
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-teal-500" />
                    <span className="font-semibold">Jum'at</span>
                  </div>
                  <span className="text-teal-600 font-semibold">
                    07.00 - 11.00 WIB
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-red-500" />
                    <span className="font-semibold">Sabtu & Minggu</span>
                  </div>
                  <span className="text-red-600 font-semibold">Tutup</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Catatan:</strong> Untuk kunjungan, sebaiknya membuat
                  janji terlebih dahulu melalui telepon atau WhatsApp agar kami
                  dapat melayani Anda dengan lebih baik.
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