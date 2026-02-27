// src/components/common/navbar.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  description: string;
  sections?: {
    id: string;
    title: string;
    description: string;
  }[];
};

const navigation: NavItem[] = [
  {
    title: "Profil",
    href: "/profil",
    description: "Tentang Pondok Pesantren Baitul Makmur",
    sections: [
      {
        id: "sejarah",
        title: "Sejarah",
        description: "Perjalanan berdirinya pesantren",
      },
      {
        id: "visi-misi",
        title: "Visi & Misi",
        description: "Tujuan dan cita-cita pesantren",
      },
      {
        id: "struktur",
        title: "Struktur Organisasi",
        description: "Pengurus dan pengasuh pesantren",
      },
    ],
  },
  {
    title: "Fasilitas",
    href: "/fasilitas",
    description: "Sarana dan prasarana pesantren",
    sections: [
      {
        id: "asrama",
        title: "Asrama",
        description: "Tempat tinggal santri",
      },
      {
        id: "masjid",
        title: "Masjid",
        description: "Tempat ibadah dan kajian",
      },
      {
        id: "perpustakaan",
        title: "Perpustakaan",
        description: "Koleksi buku dan referensi",
      },
      {
        id: "kelas",
        title: "Ruang Kelas",
        description: "Fasilitas belajar mengajar",
      },
    ],
  },
  {
    title: "Info Sekolah",
    href: "/info-sekolah",
    description: "Informasi program dan kegiatan",
    sections: [
      {
        id: "program",
        title: "Program Pendidikan",
        description: "Kurikulum dan metode belajar",
      },
      {
        id: "ekstrakurikuler",
        title: "Ekstrakurikuler",
        description: "Kegiatan pengembangan bakat",
      },
      {
        id: "prestasi",
        title: "Prestasi",
        description: "Pencapaian santri",
      },
    ],
  },
  {
    title: "PPDB",
    href: "/ppdb",
    description: "Penerimaan Peserta Didik Baru",
    sections: [
      {
        id: "syarat",
        title: "Syarat Pendaftaran",
        description: "Persyaratan calon santri",
      },
      {
        id: "jadwal",
        title: "Jadwal",
        description: "Timeline pendaftaran",
      },
      {
        id: "biaya",
        title: "Biaya",
        description: "Informasi biaya pendidikan",
      },
    ],
  },
  {
    title: "Kontak Kami",
    href: "/kontak",
    description: "Hubungi kami untuk informasi lebih lanjut",
    sections: [
      {
        id: "alamat",
        title: "Alamat",
        description: "Lokasi pesantren",
      },
      {
        id: "telepon",
        title: "Telepon",
        description: "Nomor yang bisa dihubungi",
      },
      {
        id: "email",
        title: "Email",
        description: "Surel pesantren",
      },
    ],
  },
];

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/beranda" className="flex items-center gap-3">
            <Image
              src="/logo_ppm.svg"
              alt="Logo"
              width={50}
              height={50}
              className="rounded-full"
            />
            <div className="hidden md:block">
              <h1 className="font-bold text-lg text-gray-900 dark:text-white">
                PP Baitul Makmur
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Pendidikan Islam Berkualitas
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <div
                key={item.title}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.title)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    "hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400",
                    "text-gray-700 dark:text-gray-300"
                  )}
                >
                  {item.title}
                  {item.sections && <ChevronDown className="w-4 h-4" />}
                </Link>

                {/* Dropdown Mega Menu */}
                {item.sections && activeDropdown === item.title && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {item.description}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {item.sections.map((section) => (
                        <Link
                          key={section.id}
                          href={`${item.href}#${section.id}`}
                          className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <h4 className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
                            {section.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {section.description}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </Link>
            <Link href="/ppdb">
              <Button
                size="sm"
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                Daftar Sekarang
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-in slide-in-from-top duration-200">
          <div className="container mx-auto px-6 py-4 space-y-2">
            {navigation.map((item) => (
              <div key={item.title} className="space-y-2">
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium"
                >
                  {item.title}
                </Link>
                {item.sections && (
                  <div className="pl-4 space-y-1">
                    {item.sections.map((section) => (
                      <Link
                        key={section.id}
                        href={`${item.href}#${section.id}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {section.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="pt-4 space-y-2 border-t border-gray-200 dark:border-gray-800">
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full">
                  Login
                </Button>
              </Link>
              <Link href="/ppdb" className="block">
                <Button className="w-full bg-teal-500 hover:bg-teal-600 text-white">
                  Daftar Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}