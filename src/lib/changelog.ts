// src/lib/changelog.ts
// Helper untuk menulis changelog dari mana saja (admin maupun superadmin)

import { cookies } from "next/headers";

type JenisAksi = "TAMBAH" | "UBAH" | "HAPUS";

interface WriteChangelogParams {
  supabase: any;
  namamenu: string;
  jenisaksi: JenisAksi;
  deskripsi: string;
}

/**
 * Tulis log perubahan ke tabel changelog.
 * Otomatis mendeteksi apakah pelakunya admin atau superadmin
 * dari cookie user_profile.
 */
export async function writeChangelog({
  supabase,
  namamenu,
  jenisaksi,
  deskripsi,
}: WriteChangelogParams): Promise<void> {
  // Baca cookie di sini (top-level async, bukan nested dalam callback)
  let profile: { id?: string; name?: string; role?: string } = {};

  try {
    const cookiesStore = await cookies();
    const raw = cookiesStore.get("user_profile")?.value;

    if (!raw) {
      console.warn("[changelog] Cookie user_profile tidak ditemukan, changelog tidak ditulis.");
      return;
    }

    profile = JSON.parse(raw);
  } catch (err) {
    console.error("[changelog] Gagal membaca cookie:", err);
    return;
  }

  const { id, name, role } = profile;

  if (!id) {
    console.warn("[changelog] id tidak ada di profile, changelog tidak ditulis.");
    return;
  }

  if (role !== "admin" && role !== "superadmin") {
    // Siswa tidak perlu dicatat di changelog
    return;
  }

  const payload: Record<string, any> = {
    namaaktor: name || "Unknown",
    namamenu,
    jenisaksi,
    deskripsi,
  };

  if (role === "superadmin") {
    payload.idsuperadmin = id;
  } else {
    payload.idadmin = id;
  }

  try {
    const { error } = await supabase.from("changelog").insert(payload);
    if (error) {
      console.error("[changelog] Gagal insert:", error.message);
      console.error("[changelog] Payload:", JSON.stringify(payload));
    }
  } catch (err) {
    console.error("[changelog] Error saat insert:", err);
  }
}