"use client";

// src/components/common/session-guard.tsx
//
// Komponen ini dipasang di root layout dan berjalan di semua halaman.
// Tugasnya: memantau event dari Supabase Auth di sisi client.
// Jika session expired (TOKEN_REFRESHED gagal / SIGNED_OUT otomatis),
// komponen ini otomatis menghapus cookie stale dan redirect ke /login.
// Dengan ini, user awam tidak perlu tahu cara hapus cookie manual.

import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";

// Daftar path yang tidak perlu di-guard (halaman publik)
const PUBLIC_PATHS = [
  "/beranda",
  "/profil",
  "/fasilitas",
  "/info-sekolah",
  "/kontak",
  "/ppdb",
  "/berita",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/kwitansi",
  "/siswa/payment",
];

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    PUBLIC_PATHS.some(
      (p) => pathname === p || pathname.startsWith(p + "/")
    )
  );
}

export default function SessionGuard() {
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // SIGNED_OUT → dipicu saat: logout manual, token expired & refresh gagal,
        // atau session di-revoke dari Supabase dashboard
        if (event === "SIGNED_OUT" || (!session && event === "TOKEN_REFRESHED")) {
          const pathname = window.location.pathname;

          // Jangan redirect dari halaman publik — tidak perlu
          if (isPublicPath(pathname)) return;

          // Bersihkan cookie stale dari server
          try {
            await fetch("/api/auth/clear-session", { method: "POST" });
          } catch {
            // ignore, tetap redirect
          }

          // Redirect ke login dengan pesan
          window.location.href = "/login?reason=session_expired";
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Komponen ini tidak merender apapun
  return null;
}