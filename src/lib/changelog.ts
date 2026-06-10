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
  try {
    const cookiesStore = await cookies();
    const raw = cookiesStore.get("user_profile")?.value;
    if (!raw) return;

    const profile = JSON.parse(raw);
    const { id, name, role } = profile;
    if (!id) return;

    const payload: Record<string, any> = {
      namaaktor: name || "Unknown",
      namamenu,
      jenisaksi,
      deskripsi,
    };

    if (role === "superadmin") {
      payload.idsuperadmin = id;
    } else if (role === "admin") {
      payload.idadmin = id;
    } else {
      // siswa tidak perlu dicatat di changelog
      return;
    }

    const { error } = await supabase.from("changelog").insert(payload);
    if (error) {
      console.error("[changelog] Gagal insert:", error.message);
    }
  } catch (err) {
    console.error("[changelog] Error:", err);
  }
}