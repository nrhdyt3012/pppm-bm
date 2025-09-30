import { environment } from "../../configs/environtment";
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = environment;
  return createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
}
