"use server";

import { createClient } from "@/lib/supabase/server";
import { writeChangelog } from "@/lib/changelog";
import { AuthFormState } from "@/types/auth";
import { createUserSchema, updateUserSchema } from "@/validations/auth-validation";
import { revalidatePath } from "next/cache";

// ─── Create User ──────────────────────────────────────────────────────────────
export async function createUser(prevState: AuthFormState, formData: FormData) {
  const validatedFields = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    nama_siswa: formData.get("nama_siswa"),
    NIS: formData.get("NIS"),
    kelas: formData.get("kelas"),
    angkatan: formData.get("angkatan"),
    nama_wali: formData.get("nama_wali"),
    no_wa: formData.get("no_wa"),
    tempat_lahir: formData.get("tempat_lahir"),
    tanggal_lahir: formData.get("tanggal_lahir"),
    role: formData.get("role") || "siswa",
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  const supabase = await createClient({ isAdmin: true });

  // Buat akun di Supabase Auth
  const { error: authError, data } = await supabase.auth.admin.createUser({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    email_confirm: true,
    user_metadata: {
      role: validatedFields.data.role,
      nama_siswa: validatedFields.data.nama_siswa,
    },
  });

  if (authError) {
    return {
      status: "error",
      errors: { ...prevState.errors, _form: [authError.message] },
    };
  }

  if (data?.user) {
    const { error: insertError } = await supabase.from("siswa").upsert({
      id: data.user.id,
      email: validatedFields.data.email,
      namasiswa: validatedFields.data.nama_siswa,
      nis: validatedFields.data.NIS || null,
      kelas: validatedFields.data.kelas,
      angkatan: validatedFields.data.angkatan || null,
      namawali: validatedFields.data.nama_wali,
      nowa: validatedFields.data.no_wa,
      tempatlahir: validatedFields.data.tempat_lahir || null,
      tanggallahir: validatedFields.data.tanggal_lahir || null,
      status: "aktif",
    });

    if (insertError) {
      console.error("Insert siswa error:", insertError.message);
    } else {
      await writeChangelog({
        supabase,
        namamenu: "Data Siswa",
        jenisaksi: "TAMBAH",
        deskripsi: `Menambahkan data siswa: ${validatedFields.data.nama_siswa} (${validatedFields.data.kelas})`,
      });
    }
  }

  revalidatePath("/admin/user");
  return { status: "success" };
}

// ─── Update User ──────────────────────────────────────────────────────────────
export async function updateUser(prevState: AuthFormState, formData: FormData) {
  const validatedFields = updateUserSchema.safeParse({
    nama_siswa: formData.get("nama_siswa"),
    NIS: formData.get("NIS"),
    kelas: formData.get("kelas"),
    angkatan: formData.get("angkatan"),
    nama_wali: formData.get("nama_wali"),
    no_wa: formData.get("no_wa"),
    tempat_lahir: formData.get("tempat_lahir"),
    tanggal_lahir: formData.get("tanggal_lahir"),
    role: formData.get("role") || "siswa",
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  const supabase = await createClient({ isAdmin: true });
  const userId = formData.get("id") as string;

  const { error: siswaError } = await supabase
    .from("siswa")
    .update({
      namasiswa: validatedFields.data.nama_siswa,
      nis: validatedFields.data.NIS || null,
      kelas: validatedFields.data.kelas,
      angkatan: validatedFields.data.angkatan || null,
      namawali: validatedFields.data.nama_wali,
      nowa: validatedFields.data.no_wa,
      tempatlahir: validatedFields.data.tempat_lahir || null,
      tanggallahir: validatedFields.data.tanggal_lahir || null,
      updatedat: new Date().toISOString(),
    })
    .eq("id", userId);

  if (siswaError) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [`Gagal update: ${siswaError.message}`],
      },
    };
  }

  await writeChangelog({
    supabase,
    namamenu: "Data Siswa",
    jenisaksi: "UBAH",
    deskripsi: `Mengubah data siswa: ${validatedFields.data.nama_siswa}`,
  });

  revalidatePath("/admin/user");
  return { status: "success" };
}

// ─── Delete User ──────────────────────────────────────────────────────────────
export async function deleteUser(prevState: AuthFormState, formData: FormData) {
  const supabase = await createClient({ isAdmin: true });
  const userId = formData.get("id") as string;

  // Ambil nama siswa untuk changelog sebelum dihapus
  const { data: siswaData } = await supabase
    .from("siswa")
    .select("namasiswa")
    .eq("id", userId)
    .maybeSingle();

  const namaSiswa = siswaData?.namasiswa || userId;

  // Hapus akun auth (cascade ke tabel siswa via FK)
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return {
      status: "error",
      errors: { ...prevState.errors, _form: [error.message] },
    };
  }

  await writeChangelog({
    supabase,
    namamenu: "Data Siswa",
    jenisaksi: "HAPUS",
    deskripsi: `Menghapus data siswa: ${namaSiswa}`,
  });

  revalidatePath("/admin/user");
  return { status: "success" };
}