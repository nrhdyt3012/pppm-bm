import { environment } from "@/configs/environtment";
import { createClient } from "@supabase/supabase-js";

export function createClientSupabase() {
  return createClient(
    environment.SUPABASE_URL!,
    environment.SUPABASE_ANON_KEY!
  );
}
