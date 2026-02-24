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

  if (!user) {
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: ["User tidak ditemukan."],
      },
    };
  }

  console.log("🔍 Checking user ID:", user.id);
  console.log("📧 User email:", user.email);

  // Cek apakah user adalah santri (PERBAIKAN: sesuaikan nama kolom)
  const { data: santriData, error: santriError } = await supabase
    .from("santri")
    .select("id, nama, jenisKelamin, avatarUrl")
    .eq("id", user.id)
    .single();

  console.log("👤 Santri data:", santriData);
  console.log("❌ Santri error:", santriError);

  // Cek apakah user adalah admin (PERBAIKAN: sesuaikan nama kolom)
  const { data: adminData, error: adminError } = await supabase
    .from("admin")
    .select("id, nama, jenis_kelamin, noHP")
    .eq("id", user.id)
    .single();

  console.log("👤 Admin data:", adminData);
  console.log("❌ Admin error:", adminError);

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
    // DEBUGGING: Log semua tabel untuk user ini
    console.error("🚨 User not found in santri or admin tables");
    console.error("🔍 User ID:", user.id);
    console.error("📧 Email:", user.email);
    console.error("🔐 User metadata:", user.user_metadata);
    
    // Logout supaya tidak stuck
    await supabase.auth.signOut();
    
    return {
      status: "error",
      errors: {
        ...prevState.errors,
        _form: [
          `User profile tidak ditemukan untuk email ${user.email}. ` +
          `User ID: ${user.id}. ` +
          `Hubungi administrator untuk membuat profile santri/admin.`
        ],
      },
    };
  }

  // ✅ SIMPAN PROFILE KE COOKIE
  const cookiesStore = await cookies();
  cookiesStore.set("user_profile", JSON.stringify(profile), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: "/",
  });

  revalidatePath("/", "layout");
  
  // ✅ REDIRECT LANGSUNG BERDASARKAN ROLE
  if (profile.role === "admin") {
    redirect("/admin");
  } else {
    redirect("/santri/info");
  }
}