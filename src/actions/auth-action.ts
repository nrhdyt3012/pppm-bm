"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  const cookiesStore = await cookies();
  
  try {
    // Hapus session dari Supabase
    await supabase.auth.signOut();
    
    // Hapus cookie user_profile
    cookiesStore.delete("user_profile");
    
    // Revalidate
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Error signing out:", error);
  }
  
  // Redirect ke beranda
  redirect("/beranda");
}