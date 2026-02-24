"use server";

import { INITIAL_STATE_LOGIN_FORM } from "@/constants/auth-constant";
import { createClient } from "@/lib/supabase/server";
import { AuthFormState } from "@/types/auth";
import { loginSchemaForm } from "@/validations/auth-validation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(
  prevState: AuthFormState,
  formData: FormData | null
) {
  if (!formData) {
    return INITIAL_STATE_LOGIN_FORM;
  }

  const validatedFields = loginSchemaForm.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
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

  const supabase = await createClient();

  const {
    error,
    data: { user },
  } = await supabase.auth.signInWithPassword(validatedFields.data);

  if (error) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [error.message],
      },
    };
  }

  // Cek apakah user adalah admin
  const { data: adminData } = await supabase
    .from("admin")
    .select("id, nama, jenis_kelamin, noHP")
    .eq("id", user?.id)
    .single();

  // Cek apakah user adalah santri
  const { data: santriData } = await supabase
    .from("santri")
    .select("id, nama, jenisKelamin, avatarUrl")
    .eq("id", user?.id)
    .single();

  let profile = null;

  if (adminData) {
    profile = {
      id: adminData.id,
      name: adminData.nama,
      role: "admin",
      avatar_url: null,
    };
  } else if (santriData) {
    profile = {
      id: santriData.id,
      name: santriData.nama,
      role: "santri",
      avatar_url: santriData.avatarUrl,
    };
  } else {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: ["User profile tidak ditemukan."],
      },
    };
  }

  // ✅ SIMPAN PROFILE KE COOKIE sebelum redirect
  const cookiesStore = await cookies();
  cookiesStore.set("user_profile", JSON.stringify(profile), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    // secure: true, // aktifkan di production (HTTPS)
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  revalidatePath("/", "layout");
  redirect("/");
}