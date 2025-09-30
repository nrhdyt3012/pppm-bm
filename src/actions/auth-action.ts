"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function signOut() {
  const supabase = await createClient();
  const cookiesStore = await cookies();
  try {
    await supabase.auth.signOut();
    cookiesStore.delete("user_profile");
    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Error signing out:", error);
  }
  redirect("/login");
}
