"use server";

import { deleteFile, uploadFile } from "@/actions/storage-action";
import { createClient } from "@/lib/supabase/server";
import { AuthFormState } from "@/types/auth";
import { createUserSchema, updateUserSchema } from "@/validations/auth-validation";
import { revalidatePath } from "next/cache";

async function detectColumnNames(supabase: any): Promise<"camel" | "lower"> {
  const { data } = await supabase.from("siswa").select("*").limit(1);
  if (data && data[0]) {
    if ("namaSiswa" in data[0]) return "camel";
    if ("namasiswa" in data[0]) return "lower";
  }
  return "camel";
}

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
    avatar_url: formData.get("avatar_url"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: { ...validatedFields.error.flatten().fieldErrors, _form: [] },
    };
  }

  let avatarUrl = (validatedFields.data.avatar_url as string) || "";
  if (validatedFields.data.avatar_url instanceof File && validatedFields.data.avatar_url.size > 0) {
    const uploadResult = await uploadFile("images", "siswa", validatedFields.data.avatar_url);
    if (uploadResult.status === "error") {
      return { status: "error", errors: { ...prevState.errors, _form: ["Gagal upload foto"] } };
    }
    avatarUrl = uploadResult.data?.url || "";
  }

  const supabase = await createClient({ isAdmin: true });

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
    return { status: "error", errors: { ...prevState.errors, _form: [authError.message] } };
  }

  if (data?.user) {
    const colType = await detectColumnNames(supabase);

    const payload = colType === "camel"
      ? {
          id: data.user.id,
          email: validatedFields.data.email,
          namaSiswa: validatedFields.data.nama_siswa,
          NIS: validatedFields.data.NIS || null,
          kelas: validatedFields.data.kelas,
          angkatan: validatedFields.data.angkatan || null,
          namaWali: validatedFields.data.nama_wali,
          noWa: validatedFields.data.no_wa,
          tempatLahir: validatedFields.data.tempat_lahir || null,
          tanggalLahir: validatedFields.data.tanggal_lahir || null,
          avatarUrl: avatarUrl || null,
          status: "aktif",
        }
      : {
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
          avatarurl: avatarUrl || null,
          status: "aktif",
        };

    const { error: insertError } = await supabase.from("siswa").upsert(payload);
    if (insertError) {
      console.error("Insert siswa error:", insertError.message);
    }
  }

  revalidatePath("/admin/user");
  return { status: "success" };
}

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
    avatar_url: formData.get("avatar_url"),
  });

  if (!validatedFields.success) {
    return {
      status: "error",
      errors: { ...validatedFields.error.flatten().fieldErrors, _form: [] },
    };
  }

  let avatarUrl = (validatedFields.data.avatar_url as string) || "";
  if (validatedFields.data.avatar_url instanceof File && validatedFields.data.avatar_url.size > 0) {
    const oldAvatarUrl = formData.get("old_avatar_url") as string;
    const uploadResult = await uploadFile(
      "images", "siswa", validatedFields.data.avatar_url,
      oldAvatarUrl?.split("/images/")[1]
    );
    if (uploadResult.status === "error") {
      return { status: "error", errors: { ...prevState.errors, _form: ["Gagal upload foto"] } };
    }
    avatarUrl = uploadResult.data?.url || "";
  }

  const supabase = await createClient({ isAdmin: true });
  const userId = formData.get("id") as string;

  const colType = await detectColumnNames(supabase);

  const payloadCamel: Record<string, any> = {
    namaSiswa: validatedFields.data.nama_siswa,
    NIS: validatedFields.data.NIS || null,
    kelas: validatedFields.data.kelas,
    angkatan: validatedFields.data.angkatan || null,
    namaWali: validatedFields.data.nama_wali,
    noWa: validatedFields.data.no_wa,
    tempatLahir: validatedFields.data.tempat_lahir || null,
    tanggalLahir: validatedFields.data.tanggal_lahir || null,
    // Kolom trigger — pakai key persis seperti di DB (case-sensitive)
    updatedat: new Date().toISOString(),
  };
  if (avatarUrl) payloadCamel.avatarUrl = avatarUrl;

  const payloadLower: Record<string, any> = {
    namasiswa: validatedFields.data.nama_siswa,
    nis: validatedFields.data.NIS || null,
    kelas: validatedFields.data.kelas,
    angkatan: validatedFields.data.angkatan || null,
    namawali: validatedFields.data.nama_wali,
    nowa: validatedFields.data.no_wa,
    tempatlahir: validatedFields.data.tempat_lahir || null,
    tanggallahir: validatedFields.data.tanggal_lahir || null,
    updatedat: new Date().toISOString(),
  };
  if (avatarUrl) payloadLower.avatarurl = avatarUrl;

  const payload = colType === "camel" ? payloadCamel : payloadLower;

  const { error: siswaError } = await supabase
    .from("siswa")
    .update(payload)
    .eq("id", userId);

  if (siswaError) {
    return {
      status: "error",
      errors: { ...prevState.errors, _form: [`Gagal update: ${siswaError.message}`] },
    };
  }

  revalidatePath("/admin/user");
  return { status: "success" };
}

export async function deleteUser(prevState: AuthFormState, formData: FormData) {
  const supabase = await createClient({ isAdmin: true });
  const userId = formData.get("id") as string;
  const image = formData.get("avatar_url") as string;

  if (image && image.includes("/images/")) {
    await deleteFile("images", image.split("/images/")[1]);
  }

  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return { status: "error", errors: { ...prevState.errors, _form: [error.message] } };
  }

  revalidatePath("/admin/user");
  return { status: "success" };
}