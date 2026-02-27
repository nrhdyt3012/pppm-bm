// src/app/kontak/_components/kontak-page.tsx
"use client";

import Navbar from "@/components/common/navbar";
import Footer from "@/components/common/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Facebook,
  Instagram,
  Youtube,
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
    // Di production, ini akan mengirim ke backend/email
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
        "Jl. Raya Pesantren No. 123",
        "Kelurahan Contoh, Kecamatan Sample",
        "Surabaya, Jawa Timur 60111",
      ],
    },
    {
      icon: <Phone className="w-8 h-8 text-teal-500" />,
      title: "Telepon",
      content: [
        "+62 31 1234 5678 (Kantor)",
        "+62 812 3456 7890 (Admin PPDB)",
        "+62 813 4567 8901 (Pengasuh)",
      ],
    },
    {
      icon: <Mail className="w-8 h-8 text-teal-500" />,
      title: "Email",
      content: [
        "info@ppbaitulmakmur.ac.id",
        "ppdb@ppbaitulmakmur.ac.id",
        "admin@ppbaitulmakmur.ac.id",
      ],
    },
    {
      icon: <Clock className="w-8 h-8 text-teal-500" />,
      title: "Jam Operasional",
      content: [
        "Senin - Jumat: 08.00 - 16.00 WIB",
        "Sabtu: 08.00 - 13.00 WIB",
        "Minggu & Libur Nasional: Tutup",
      ],
    },
  ];

  const socialMedia = [
    {
      name: "Facebook",
      icon: <Facebook className="w-6 h-6" />,
      url: "https://facebook.com/ppbaitulmakmur",
      handle: "@ppbaitulmakmur",
      color: "hover:bg-blue-600",
    },
    {
      name: "Instagram",
      icon: <Instagram className="w-6 h-6" />,
      url: "https://instagram.com/ppbaitulmakmur",
      handle: "@ppbaitulmakmur",
      color: "hover:bg-pink-600",
    },
    {
      name: "YouTube",
      icon: <Youtube className="w-6 h-6" />,
      url: "https://youtube.com/@ppbaitulmakmur",
      handle: "PP Baitul Makmur",
      color: "hover:bg-red-600",
    },
    {
      name: "WhatsApp",
      icon: <MessageCircle className="w-6 h-6" />,
      url: "https://wa.me/6281234567890",
      handle: "+62 812 3456 7890",
      color: "hover:bg-green-600",
    },
  ];

  const faq = [
    {
      q: "Apakah bisa berkunjung ke pesantren sebelum mendaftar?",
      a: "Tentu bisa! Kami menyambut calon santri dan orang tua untuk berkunjung. Silakan hubungi kami terlebih dahulu untuk mengatur jadwal kunjungan.",
    },
    {
      q: "Bagaimana cara mendaftar santri baru?",
      a: "Anda dapat mendaftar online melalui website kami atau datang langsung ke kantor sekretariat pesantren dengan membawa berkas persyaratan.",
    },
    {
      q: "Apakah tersedia program beasiswa?",
      a: "Ya, kami menyediakan beasiswa prestasi dan beasiswa tidak mampu. Informasi lengkap dapat ditanyakan saat pendaftaran.",
    },
    {
      q: "Berapa lama masa pendidikan di pesantren?",
      a: "Program pendidikan kami setara dengan SMP (3 tahun) dan SMA (3 tahun). Total 6 tahun untuk santri yang masuk dari tingkat SMP.",
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
            Kami siap membantu menjawab pertanyaan Anda tentang Pondok
            Pesantren Baitul Makmur
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
                    <Label htmlFor="phone">Nomor Telepon</Label>
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

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Lokasi Kami</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.60803046968!2d112.63033!3d-7.27574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fbf8381ac47f%3A0x3027a76e352be40!2sSurabaya%2C%20East%20Java!5e0!3m2!1sen!2sid!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Lokasi Pondok Pesantren Baitul Makmur"
                  />
                </div>
                <div className="mt-4 space-y-2">
                  <h4 className="font-semibold">Petunjuk Arah:</h4>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>• Dari Terminal Bungurasih: 20 menit (10 km)</li>
                    <li>• Dari Stasiun Gubeng: 25 menit (12 km)</li>
                    <li>• Dari Bandara Juanda: 45 menit (30 km)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section
        id="telepon"
        className="py-20 px-6 bg-white dark:bg-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-4">Ikuti Media Sosial Kami</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-12">
            Dapatkan update terbaru dan informasi seputar pesantren
          </p>

          <div className="grid md:grid-cols-4 gap-6">
            {socialMedia.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center transition-colors ${social.color} group-hover:text-white`}
                    >
                      {social.icon}
                    </div>
                    <h3 className="font-bold mb-2">{social.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {social.handle}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="email"
        className="py-20 px-6 bg-gradient-to-br from-blue-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 scroll-mt-32"
      >
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Beberapa pertanyaan umum dari calon santri dan orang tua
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
            <Button className="bg-teal-500 hover:bg-teal-600">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat dengan Admin
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}