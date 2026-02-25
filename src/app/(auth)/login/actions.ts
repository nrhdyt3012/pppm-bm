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
  console.log("🚀 Login action started");
  
  if (!formData) {
    console.log("❌ No formData provided");
    return INITIAL_STATE_LOGIN_FORM;
  }

  const validatedFields = loginSchemaForm.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    console.log("❌ Validation failed:", validatedFields.error);
    return {
      status: "error",
      errors: {
        ...validatedFields.error.flatten().fieldErrors,
        _form: [],
      },
    };
  }

  try {
    console.log("🔐 Creating Supabase client...");
    const supabase = await createClient();

    console.log("🔐 Attempting sign in with email:", validatedFields.data.email);
    const {
      error,
      data: { user },
    } = await supabase.auth.signInWithPassword(validatedFields.data);

    if (error) {
      console.error("❌ Supabase auth error:", error);
      return {
        status: "error",
        errors: {
          _form: [error.message],
        },
      };
    }

    if (!user) {
      console.log("❌ No user returned from auth");
      return {
        status: "error",
        errors: {
          _form: ["User tidak ditemukan"],
        },
      };
    }

    console.log("✅ User authenticated:", user.id);

    // PENTING: Buat client baru dengan session yang sudah authenticated
    console.log("🔄 Creating new authenticated client...");
    const authenticatedSupabase = await createClient();

    // Cek apakah user adalah admin atau santri
    console.log("🔍 Querying admin table for user:", user.id);
    const { data: adminData, error: adminError } = await authenticatedSupabase
      .from("admin")
      .select("id, nama, jenis_kelamin, noHP")
      .eq("id", user.id)
      .maybeSingle();

    console.log("📊 Admin query result:", { 
      hasData: !!adminData, 
      data: adminData,
      error: adminError 
    });

    console.log("🔍 Querying santri table for user:", user.id);
    const { data: santriData, error: santriError } = await authenticatedSupabase
      .from("santri")
      .select("id, nama, jenisKelamin, avatarUrl")
      .eq("id", user.id)
      .maybeSingle();

    console.log("📊 Santri query result:", { 
      hasData: !!santriData,
      data: santriData,
      error: santriError 
    });

    let profile = null;

    if (adminData) {
      console.log("👤 User is ADMIN");
      profile = {
        id: adminData.id,
        name: adminData.nama,
        role: "admin" as const,
        avatar_url: null,
      };
    } else if (santriData) {
      console.log("👤 User is SANTRI");
      profile = {
        id: santriData.id,
        name: santriData.nama,
        role: "santri" as const,
        avatar_url: santriData.avatarUrl,
      };
    } else {
      console.log("❌ No profile found in admin or santri table");
      console.log("💡 Checking RLS policies...");
      
      // Debug: coba query tanpa filter untuk cek RLS
      const { data: adminDebug, error: adminDebugError } = await authenticatedSupabase
        .from("admin")
        .select("id")
        .limit(1);
      
      console.log("🔍 Admin table access test:", { 
        hasAccess: !!adminDebug, 
        error: adminDebugError 
      });

      return {
        status: "error",
        errors: {
          _form: [
            "User profile tidak ditemukan. Pastikan Anda terdaftar sebagai admin atau santri.",
          ],
        },
      };
    }

    console.log("✅ Profile found:", JSON.stringify(profile, null, 2));

    // Set cookie
    console.log("🍪 Setting cookie...");
    const cookiesStore = await cookies();
    const profileString = JSON.stringify(profile);
    console.log("🍪 Cookie content:", profileString);
    
    cookiesStore.set("user_profile", profileString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    console.log("✅ Cookie set successfully");

    // Revalidate untuk memaksa refresh
    console.log("🔄 Revalidating path...");
    revalidatePath("/", "layout");
    console.log("✅ Path revalidated");

    const redirectUrl = profile.role === "admin" ? "/admin" : "/santri/info";
    console.log("🎯 Redirect URL:", redirectUrl);

    return {
      status: "success",
      data: {
        profile,
        redirectUrl,
      },
    };
  } catch (error: any) {
    console.error("❌ Login error (caught):", error);
    console.error("❌ Error stack:", error.stack);
    return {
      status: "error",
      errors: {
        _form: [error.message || "Terjadi kesalahan saat login"],
      },
    };
  }
}