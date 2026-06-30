"use client";

// src/lib/clear-stale-session.ts
//
// Utility ini dipanggil di sisi client jika terdeteksi session sudah expired
// tapi user masih menyimpan cookie lama di browser.
// Cara kerja: hit endpoint /api/auth/clear-session yang akan menghapus
// cookie dari sisi server, lalu redirect ke /login.

export async function clearStaleSessionAndRedirect() {
  try {
    await fetch("/api/auth/clear-session", { method: "POST" });
  } catch {
    // Tidak masalah jika fetch gagal, tetap redirect
  }
  window.location.href = "/login";
}