"use server";

import { createClient } from "@/lib/supabase/server";

export async function sendResetPasswordEmail(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { status: "error", message: "Email wajib diisi" };
  }

  const supabase = await createClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/reset-password`,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  return { status: "success", message: "Link reset password telah dikirim ke email Anda" };
}