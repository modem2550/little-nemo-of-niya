import { createClient } from "@supabase/supabase-js";

export function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error("Supabase anon env vars not found");
  }

  return createClient(url, anon);
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !service) {
    throw new Error("Supabase service role env vars not found");
  }

  return createClient(url, service);
}
