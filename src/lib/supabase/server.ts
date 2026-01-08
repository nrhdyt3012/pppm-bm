// src/lib/supabase/server.ts
import { environment } from "../../configs/environtment";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CreateClientOptions = {
  isAdmin?: boolean;
};

export async function createClient({
  isAdmin = false,
}: CreateClientOptions = {}) {
  const cookieStore = await cookies();
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } =
    environment;

  // PENTING: Gunakan SERVICE_ROLE_KEY saat isAdmin = true
  const apiKey = isAdmin ? SUPABASE_SERVICE_ROLE_KEY! : SUPABASE_ANON_KEY!;

  console.log('🔑 Using API Key:', isAdmin ? 'SERVICE_ROLE' : 'ANON'); // Debug log

  return createServerClient(
    SUPABASE_URL!,
    apiKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            console.error("Error setting cookies", cookiesToSet);
          }
        },
      },
    }
  );
}