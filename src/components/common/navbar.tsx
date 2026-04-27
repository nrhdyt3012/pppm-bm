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
};

const navigation: NavItem[] = [
  {
    title: "Beranda",
    href: "/beranda",
  },{
    title: "Profil",
    href: "/profil",
  },
  {
    title: "Fasilitas",
    href: "/fasilitas",
  },
  {
    title: "Info Sekolah",
    href: "/info-sekolah",
  },
  {
    title: "PPDB",
    href: "/ppdb",
  },
  {
    title: "Kontak Kami",
    href: "/kontak",
  },
];

export default function Navbar() {
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
                PAUD ABA 1 Buduran
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Sholih, Ceria, Mandiri
              </p>
            </div>
          </Link>

{/* Desktop Navigation */}
<div className="hidden lg:flex items-center gap-1">
  {navigation.map((item) => (
    <Link
      key={item.title}
      href={item.href}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        "hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400",
        "text-gray-700 dark:text-gray-300"
      )}
    >
      {item.title}
    </Link>
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
{/* Mobile Menu */}
{mobileMenuOpen && (
  <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-in slide-in-from-top duration-200">
    <div className="container mx-auto px-6 py-4 space-y-1">
      {navigation.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          onClick={() => setMobileMenuOpen(false)}
          className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
        >
          {item.title}
        </Link>
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