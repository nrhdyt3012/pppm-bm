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

  // Selalu return success untuk keamanan (tidak bocorkan apakah email terdaftar)
  if (error) {
    console.error("Reset password error:", error.message);
    // Tetap return success agar tidak bocorkan info email
    // kecuali error konfigurasi server
    if (error.message.includes("Unable to validate") || error.message.includes("not enabled")) {
      return { status: "error", message: "Layanan reset password tidak tersedia saat ini. Hubungi admin." };
    }
  }

  return {
    status: "success",
    message: "Link reset password telah dikirim ke email Anda",
  };
}