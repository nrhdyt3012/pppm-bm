"use server";

// src/actions/auth-action.ts

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  const cookiesStore = await cookies();

  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error("Error signing out from Supabase:", error);
  }

  // Hapus cookie profil user
  cookiesStore.delete("user_profile");

  // Hapus semua cookie Supabase auth (sb-*-auth-token, dll)
  // agar tidak ada cookie stale yang tersisa setelah logout
  const allCookies = cookiesStore.getAll();
  allCookies.forEach(({ name }) => {
    if (name.includes("-auth-token") || name.includes("sb-")) {
      cookiesStore.delete(name);
    }
  });

  revalidatePath("/", "layout");
  redirect("/login");
}