"use server";

import { INITIAL_STATE_LOGIN_FORM } from "@/constants/auth-constant";
import { createClient } from "@/lib/supabase/server";
import { AuthFormState } from "@/types/auth";
import { loginSchemaForm } from "@/validations/auth-validation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function login(
  prevState: AuthFormState,
  formData: FormData | null
) {
  if (!formData) return INITIAL_STATE_LOGIN_FORM;

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

  try {
    const supabase = await createClient();

    const {
      error,
      data: { user },
    } = await supabase.auth.signInWithPassword(validatedFields.data);

    if (error) {
      return {
        status: "error",
        errors: { _form: [error.message] },
      };
    }

    if (!user) {
      return {
        status: "error",
        errors: { _form: ["User tidak ditemukan"] },
      };
    }

    const authenticatedSupabase = await createClient();

    // Cek tabel admin
    const { data: adminData } = await authenticatedSupabase
      .from("admin")
      .select("id, nama")
      .eq("id", user.id)
      .maybeSingle();

    // Cek tabel siswa
    const { data: siswaData } = await authenticatedSupabase
      .from("siswa")
      .select("id, namaSiswa, avatarUrl, kelas, NIS")
      .eq("id", user.id)
      .maybeSingle();

    let profile = null;

    if (adminData) {
      profile = {
        id: adminData.id,
        name: adminData.nama,
        role: "admin" as const,
        avatar_url: null,
      };
    } else if (siswaData) {
      profile = {
        id: siswaData.id,
        name: siswaData.namaSiswa,
        role: "siswa" as const,
        avatar_url: siswaData.avatarUrl,
        kelas: siswaData.kelas,
        NIS: siswaData.NIS,
      };
    } else {
      return {
        status: "error",
        errors: {
          _form: ["Profil pengguna tidak ditemukan. Hubungi administrator."],
        },
      };
    }

    const cookiesStore = await cookies();
    cookiesStore.set("user_profile", JSON.stringify(profile), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    revalidatePath("/", "layout");

    const redirectUrl = profile.role === "admin" ? "/admin" : "/siswa/info";

    return {
      status: "success",
      data: { profile, redirectUrl },
    };
  } catch (error: any) {
    return {
      status: "error",
      errors: { _form: [error.message || "Terjadi kesalahan saat login"] },
    };
  }
}