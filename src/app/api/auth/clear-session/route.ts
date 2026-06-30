// src/app/api/auth/clear-session/route.ts
//
// Endpoint ini dipanggil client-side ketika terdeteksi session expired
// tapi cookie lama masih ada. Menghapus semua cookie auth dari sisi server.

import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookiesStore = await cookies();
  const allCookies = cookiesStore.getAll();

  // Hapus user_profile
  cookiesStore.delete("user_profile");

  // Hapus semua cookie Supabase auth
  allCookies.forEach(({ name }) => {
    if (name.includes("-auth-token") || name.includes("sb-")) {
      cookiesStore.delete(name);
    }
  });

  return NextResponse.json({ ok: true });
}