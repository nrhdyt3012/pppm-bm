// src/app/(dashboard)/admin/user/actions.ts
"use server";

import { deleteFile, uploadFile } from "@/actions/storage-action";
import { createClient } from "@/lib/supabase/server";
import { AuthFormState } from "@/types/auth";
import { createUserSchema, updateUserSchema } from "@/validations/auth-validation";

export async function createUser(prevState: AuthFormState, formData: FormData) {
  const validatedFields = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    jenis_kelamin: formData.get("jenis_kelamin"),
    tempat_lahir: formData.get("tempat_lahir"),
    tanggal_lahir: formData.get("tanggal_lahir"),
    nama_ayah: formData.get("nama_ayah"),
    pekerjaan_ayah: formData.get("pekerjaan_ayah"),
    nama_ibu: formData.get("nama_ibu"),
    pekerjaan_ibu: formData.get("pekerjaan_ibu"),
    role: formData.get("role"),
    avatar_url: formData.get("avatar_url"),
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

  // Upload avatar jika berupa file
  let avatarUrl = validatedFields.data.avatar_url;
  if (validatedFields.data.avatar_url instanceof File) {
    const uploadResult = await uploadFile(
      "images",
      "users",
      validatedFields.data.avatar_url
    );
    
    if (uploadResult.status === "error") {
      return {
        status: "error",
        errors: {
          ...prevState.errors,
          _form: uploadResult.errors?._form || ["Failed to upload avatar"],
        },
      };
    }
    avatarUrl = uploadResult.data?.url || "";
  }

const supabase = await createClient({ isAdmin: true });

  // Siapkan metadata untuk auth.users
  const authMetadata = {
    name: validatedFields.data.name,
    role: validatedFields.data.role,
    avatar_url: avatarUrl,
    jenis_kelamin: validatedFields.data.jenis_kelamin,
    tempat_lahir: validatedFields.data.tempat_lahir,
    tanggal_lahir: validatedFields.data.tanggal_lahir,
    nama_ayah: validatedFields.data.nama_ayah,
    pekerjaan_ayah: validatedFields.data.pekerjaan_ayah,
    nama_ibu: validatedFields.data.nama_ibu,
    pekerjaan_ibu: validatedFields.data.pekerjaan_ibu,
  };

  // Buat user di Supabase Auth
  const { error: authError, data } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    options: {
      data: authMetadata,
    },
  });

  if (authError) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [authError.message],
      },
    };
  }

  return {
    status: "success",
  };
}

export async function updateUser(prevState: AuthFormState, formData: FormData) {
  const validatedFields = updateUserSchema.safeParse({
    name: formData.get("name"),
    jenis_kelamin: formData.get("jenis_kelamin"),
    tempat_lahir: formData.get("tempat_lahir"),
    tanggal_lahir: formData.get("tanggal_lahir"),
    nama_ayah: formData.get("nama_ayah"),
    pekerjaan_ayah: formData.get("pekerjaan_ayah"),
    nama_ibu: formData.get("nama_ibu"),
    pekerjaan_ibu: formData.get("pekerjaan_ibu"),
    role: formData.get("role"),
    avatar_url: formData.get("avatar_url"),
  });

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error);
    return {
      status: "error",
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  // Upload avatar jika ada file baru
  let avatarUrl = validatedFields.data.avatar_url;
  if (validatedFields.data.avatar_url instanceof File) {
    const oldAvatarUrl = formData.get("old_avatar_url") as string;
    const uploadResult = await uploadFile(
      "images",
      "users",
      validatedFields.data.avatar_url,
      oldAvatarUrl?.split("/images/")[1]
    );
    
    if (uploadResult.status === "error") {
      return {
        status: "error",
        errors: {
          ...prevState.errors,
          _form: uploadResult.errors?._form || ["Failed to upload avatar"],
        },
      };
    }
    avatarUrl = uploadResult.data?.url || "";
  }

  const supabase = await createClient({ isAdmin: true });
  const userId = formData.get("id") as string;

  console.log("=== UPDATE USER ===");
  console.log("User ID:", userId);

  // // Update tabel profiles
  // const { error: profileError } = await supabase
  //   .from("profiles")
  //   .update({
  //     name: validatedFields.data.name,
  //     avatar_url: avatarUrl,
  //     updated_at: new Date().toISOString(),
  //   })
  //   .eq("id", userId);

  // if (profileError) {
  //   console.error("Profile update error:", profileError);
  //   return {
  //     status: "error",
  //     errors: {
  //       ...prevState.errors,
  //       _form: [`Gagal update profile: ${profileError.message}`],
  //     },
  //   };
  // }

  // Update tabel santri
  const { error: santriError } = await supabase
    .from("santri")
    .update({
      nama: validatedFields.data.name,
      jenisKelamin: validatedFields.data.jenis_kelamin,
      tempatLahir: validatedFields.data.tempat_lahir,
      tanggalLahir: validatedFields.data.tanggal_lahir,
      avatarUrl: avatarUrl,
      namaAyah: validatedFields.data.nama_ayah,
      namaIbu: validatedFields.data.nama_ibu,
      pekerjaanAyah: validatedFields.data.pekerjaan_ayah,
      pekerjaanIbu: validatedFields.data.pekerjaan_ibu,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", userId);

  if (santriError) {
    console.error("Santri update error:", santriError);
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [`Gagal update data santri: ${santriError.message}`],
      },
    };
  }

  console.log("=== UPDATE SUCCESS ===");

  return {
    status: "success",
  };
}

export async function deleteUser(prevState: AuthFormState, formData: FormData) {
  const supabase = await createClient({ isAdmin: true });
  const userId = formData.get("id") as string;
  const image = formData.get("avatar_url") as string;
  
  // Delete avatar file jika ada
  if (image && image.includes("/images/")) {
    await deleteFile("images", image.split("/images/")[1]);
  }

  // Delete user (cascade akan menghapus di profiles dan santri)
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  return { status: "success" };
}