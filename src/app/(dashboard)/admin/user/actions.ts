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
    jurusan: formData.get("jurusan"),
    universitas: formData.get("universitas"),
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

  // Upload avatar jika file
  if (validatedFields.data.avatar_url instanceof File) {
    const { errors, data } = await uploadFile(
      "images",
      "users",
      validatedFields.data.avatar_url
    );
    if (errors) {
      return {
        status: "error",
        errors: {
          ...prevState.errors,
          _form: [...errors._form],
        },
      };
    }
    validatedFields.data.avatar_url = data.url;
  }

  const supabase = await createClient();

  // Data yang akan dikirim ke Supabase Auth
  const authMetadata: any = {
    name: validatedFields.data.name,
    role: validatedFields.data.role,
    avatar_url: validatedFields.data.avatar_url,
    jenis_kelamin: validatedFields.data.jenis_kelamin,
  };

  // Tambahkan data spesifik santri jika rolenya santri
  if (validatedFields.data.role === "santri") {
    authMetadata.tempat_lahir = validatedFields.data.tempat_lahir;
    authMetadata.tanggal_lahir = validatedFields.data.tanggal_lahir;
    authMetadata.nama_ayah = validatedFields.data.nama_ayah;
    authMetadata.pekerjaan_ayah = validatedFields.data.pekerjaan_ayah;
    authMetadata.nama_ibu = validatedFields.data.nama_ibu;
    authMetadata.pekerjaan_ibu = validatedFields.data.pekerjaan_ibu;
  }

  const { error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    options: {
      data: authMetadata,
    },
  });

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [error.message],
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
    jurusan: formData.get("jurusan"),
    universitas: formData.get("universitas"),
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

  // Upload avatar jika ada file baru
  if (validatedFields.data.avatar_url instanceof File) {
    const oldAvatarUrl = formData.get("old_avatar_url") as string;
    const { errors, data } = await uploadFile(
      "images",
      "users",
      validatedFields.data.avatar_url,
      oldAvatarUrl.split("/images/")[1]
    );
    if (errors) {
      return {
        status: "error",
        errors: {
          ...prevState.errors,
          _form: [...errors._form],
        },
      };
    }
    validatedFields.data.avatar_url = data.url;
  }

  const supabase = await createClient();
  const userId = formData.get("id") as string;

  // Update tabel profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      name: validatedFields.data.name,
      avatar_url: validatedFields.data.avatar_url,
    })
    .eq("id", userId);

  if (profileError) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [profileError.message],
      },
    };
  }

  // Update tabel santri jika rolenya santri
  if (validatedFields.data.role === "santri") {
    const { error: santriError } = await supabase
      .from("santri")
      .update({
        namaSantri: validatedFields.data.name,
        jenisKelamin: validatedFields.data.jenis_kelamin,
        tempatLahir: validatedFields.data.tempat_lahir,
        tanggalLahir: validatedFields.data.tanggal_lahir,
        avatarUrl: validatedFields.data.avatar_url,
        namaAyah: validatedFields.data.nama_ayah,
        namaIbu: validatedFields.data.nama_ibu,
        pekerjaanAyah: validatedFields.data.pekerjaan_ayah,
        pekerjaanIbu: validatedFields.data.pekerjaan_ibu,
      })
      .eq("id", userId);

    if (santriError) {
      return {
        status: "error",
        errors: {
          ...prevState.errors,
          _form: [santriError.message],
        },
      };
    }
  }

  return {
    status: "success",
  };
}

export async function deleteUser(prevState: AuthFormState, formData: FormData) {
  const supabase = await createClient({ isAdmin: true });
  const image = formData.get("avatar_url") as string;
  
  // Delete avatar file
  const { status, errors } = await deleteFile(
    "images",
    image.split("/images/")[1]
  );

  if (status === "error") {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [errors?._form?.[0] ?? "Unknown error"],
      },
    };
  }

  // Delete user (cascade akan menghapus di profiles, santri, admin)
  const { error } = await supabase.auth.admin.deleteUser(
    formData.get("id") as string
  );

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