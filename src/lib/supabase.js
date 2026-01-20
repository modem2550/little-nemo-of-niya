import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const supabaseUrl = import.meta.env.SUPABASE_URL;
  const supabaseKey = import.meta.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase env vars not found");
  }

  return createClient(supabaseUrl, supabaseKey);
}
