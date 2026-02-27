// src/components/common/footer.tsx
import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MapPin, Phone, Facebook, Youtube } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo_ppm.svg"
                alt="Logo"
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <h3 className="font-bold text-lg">PP Baitul Makmur</h3>
                <p className="text-xs text-gray-400">
                  Pendidikan Islam Berkualitas
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Pondok Pesantren yang mengedepankan pendidikan Islam dengan
              metode modern dan tradisional.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Menu Cepat</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/profil"
                  className="text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Profil
                </Link>
              </li>
              <li>
                <Link
                  href="/fasilitas"
                  className="text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Fasilitas
                </Link>
              </li>
              <li>
                <Link
                  href="/info-sekolah"
                  className="text-gray-400 hover:text-teal-400 transition-colors"
                >
                  Info Sekolah
                </Link>
              </li>
              <li>
                <Link
                  href="/ppdb"
                  className="text-gray-400 hover:text-teal-400 transition-colors"
                >
                  PPDB
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Kontak</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <span className="text-gray-400">
                  Jl. Lorem Ipsum No. 123
                  <br />
                  Surabaya, Jawa Timur
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-teal-400 shrink-0" />
                <span className="text-gray-400">+62 XXX XXXX XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-teal-400 shrink-0" />
                <span className="text-gray-400">info@baitul-makmur.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4">Ikuti Kami</h4>
            <div className="flex gap-3">
              <Link
                href="https://instagram.com"
                target="_blank"
                className="p-3 bg-gray-800 rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </Link>
              <Link
                href="https://facebook.com"
                target="_blank"
                className="p-3 bg-gray-800 rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </Link>
              <Link
                href="https://youtube.com"
                target="_blank"
                className="p-3 bg-gray-800 rounded-lg hover:bg-teal-600 transition-colors"
              >
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold mb-2 text-sm">Newsletter</h4>
              <p className="text-xs text-gray-400 mb-3">
                Dapatkan info terbaru dari kami
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email Anda"
                  className="flex-1 px-3 py-2 bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button className="px-4 py-2 bg-teal-500 hover:bg-teal-600 rounded-lg text-sm font-medium transition-colors">
                  Kirim
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Pondok Pesantren Baitul Makmur. All
            rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Developed by Dwi Nurhidayat – Universitas Negeri Surabaya
          </p>
        </div>
      </div>
    </footer>
  );
}