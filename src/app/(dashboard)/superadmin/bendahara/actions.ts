// src/app/(dashboard)/superadmin/bendahara/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

// ─── Helper: ambil profil superadmin dari cookie ──────────────────────────────
async function getSuperadminProfile() {
  const cookiesStore = await cookies();
  const raw = cookiesStore.get("user_profile")?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ─── Helper: tulis changelog ──────────────────────────────────────────────────
async function writeChangelog(
  supabase: any,
  params: {
    idsuperadmin: string;
    namaaktor: string;
    namamenu: string;
    jenisaksi: "TAMBAH" | "UBAH" | "HAPUS";
    deskripsi: string;
  }
) {
  const { error } = await supabase.from("changelog").insert({
    idsuperadmin: params.idsuperadmin,
    namaaktor: params.namaaktor,
    namamenu: params.namamenu,
    jenisaksi: params.jenisaksi,
    deskripsi: params.deskripsi,
  });
  if (error) {
    console.error("[changelog] Gagal menulis changelog:", error.message);
  }
}

// ─── Buat akun bendahara baru ─────────────────────────────────────────────────
export async function createBendahara(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const nama = formData.get("nama") as string;
  const nohp = formData.get("nohp") as string | null;
  const jeniskelamin = formData.get("jeniskelamin") as string | null;

  if (!email || !password || !nama) {
    return {
      status: "error",
      errors: { _form: ["Email, password, dan nama wajib diisi"] },
    };
  }
  if (password.length < 6) {
    return {
      status: "error",
      errors: { _form: ["Password minimal 6 karakter"] },
    };
  }

  const supabase = await createClient({ isAdmin: true });
  const profile = await getSuperadminProfile();

  // Buat user di Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "admin", nama },
    });

  if (authError) {
    return {
      status: "error",
      errors: { _form: [authError.message] },
    };
  }

  // Insert ke tabel admin
  const { error: insertError } = await supabase.from("admin").insert({
    id: authData.user.id,
    email,
    nama,
    nohp: nohp || null,
    jeniskelamin: jeniskelamin || null,
  });

  if (insertError) {
    // Rollback: hapus user auth yang baru dibuat
    await supabase.auth.admin.deleteUser(authData.user.id);
    return {
      status: "error",
      errors: { _form: [`Gagal menyimpan data bendahara: ${insertError.message}`] },
    };
  }

  // Tulis changelog
  if (profile) {
    await writeChangelog(supabase, {
      idsuperadmin: profile.id,
      namaaktor: profile.name || "Superadmin",
      namamenu: "Kelola Bendahara",
      jenisaksi: "TAMBAH",
      deskripsi: `Menambahkan bendahara baru: ${nama} (${email})`,
    });
  }

  revalidatePath("/superadmin/bendahara");
  return { status: "success" };
}

// ─── Update data bendahara ────────────────────────────────────────────────────
export async function updateBendahara(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const nama = formData.get("nama") as string;
  const nohp = formData.get("nohp") as string | null;
  const jeniskelamin = formData.get("jeniskelamin") as string | null;
  const newPassword = formData.get("new_password") as string | null;

  if (!id || !nama) {
    return {
      status: "error",
      errors: { _form: ["ID dan nama wajib diisi"] },
    };
  }

  const supabase = await createClient({ isAdmin: true });
  const profile = await getSuperadminProfile();

  // Update tabel admin
  const { error: updateError } = await supabase
    .from("admin")
    .update({
      nama,
      nohp: nohp || null,
      jeniskelamin: jeniskelamin || null,
      updatedat: new Date().toISOString(),
    })
    .eq("id", id);

  if (updateError) {
    return {
      status: "error",
      errors: { _form: [updateError.message] },
    };
  }

  // Update password jika diisi
  if (newPassword && newPassword.length >= 6) {
    const { error: pwError } = await supabase.auth.admin.updateUserById(id, {
      password: newPassword,
    });
    if (pwError) {
      return {
        status: "error",
        errors: { _form: [`Gagal update password: ${pwError.message}`] },
      };
    }
  }

  // Changelog
  if (profile) {
    await writeChangelog(supabase, {
      idsuperadmin: profile.id,
      namaaktor: profile.name || "Superadmin",
      namamenu: "Kelola Bendahara",
      jenisaksi: "UBAH",
      deskripsi: `Mengubah data bendahara: ${nama}${newPassword ? " (termasuk reset password)" : ""}`,
    });
  }

  revalidatePath("/superadmin/bendahara");
  return { status: "success" };
}

// ─── Hapus bendahara ──────────────────────────────────────────────────────────
export async function deleteBendahara(prevState: any, formData: FormData) {
  const id = formData.get("id") as string;
  const nama = formData.get("nama") as string;

  if (!id) {
    return {
      status: "error",
      errors: { _form: ["ID bendahara tidak valid"] },
    };
  }

  const supabase = await createClient({ isAdmin: true });
  const profile = await getSuperadminProfile();

  // Hapus dari auth (cascade ke tabel admin via FK)
  const { error } = await supabase.auth.admin.deleteUser(id);

  if (error) {
    return {
      status: "error",
      errors: { _form: [error.message] },
    };
  }

  // Changelog
  if (profile) {
    await writeChangelog(supabase, {
      idsuperadmin: profile.id,
      namaaktor: profile.name || "Superadmin",
      namamenu: "Kelola Bendahara",
      jenisaksi: "HAPUS",
      deskripsi: `Menghapus bendahara: ${nama || id}`,
    });
  }

  revalidatePath("/superadmin/bendahara");
  return { status: "success" };
}