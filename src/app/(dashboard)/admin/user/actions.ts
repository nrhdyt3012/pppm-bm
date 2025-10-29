"use server";

import { deleteFile, uploadFile } from "@/actions/storage-action";
import { createClient } from "@/lib/supabase/server";
import { AuthFormState } from "@/types/auth";
import {
  createUserSchema,
  updateUserSchema,
} from "@/validations/auth-validation";

export async function createUser(prevState: AuthFormState, formData: FormData) {
  let validatedFields = createUserSchema.safeParse({
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

    validatedFields = {
      ...validatedFields,
      data: {
        ...validatedFields.data,
        avatar_url: data.url,
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
    options: {
      data: {
        name: validatedFields.data.name,
        jenis_kelamin: validatedFields.data.jenis_kelamin,
        tempat_lahir: validatedFields.data.tempat_lahir,
        tanggal_lahir: validatedFields.data.tanggal_lahir,
        jurusan: validatedFields.data.jurusan,
        universitas: validatedFields.data.universitas,
        nama_ayah: validatedFields.data.nama_ayah,
        pekerjaan_ayah: validatedFields.data.pekerjaan_ayah,
        nama_ibu: validatedFields.data.nama_ibu,
        pekerjaan_ibu: validatedFields.data.pekerjaan_ibu,
        role: validatedFields.data.role,
        avatar_url: validatedFields.data.avatar_url,
      },
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
  let validatedFields = updateUserSchema.safeParse({
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

    validatedFields = {
      ...validatedFields,
      data: {
        ...validatedFields.data,
        avatar_url: data.url,
      },
    };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      name: validatedFields.data.name,
      jenis_kelamin: validatedFields.data.jenis_kelamin,
      tempat_lahir: validatedFields.data.tempat_lahir,
      tanggal_lahir: validatedFields.data.tanggal_lahir,
      jurusan: validatedFields.data.jurusan,
      universitas: validatedFields.data.universitas,
      nama_ayah: validatedFields.data.nama_ayah,
      pekerjaan_ayah: validatedFields.data.pekerjaan_ayah,
      nama_ibu: validatedFields.data.nama_ibu,
      pekerjaan_ibu: validatedFields.data.pekerjaan_ibu,
      role: validatedFields.data.role,
      avatar_url: validatedFields.data.avatar_url,
    })
    .eq("id", formData.get("id"));

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

export async function deleteUser(prevState: AuthFormState, formData: FormData) {
  const supabase = await createClient({ isAdmin: true });
  const image = formData.get("avatar_url") as string;
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
