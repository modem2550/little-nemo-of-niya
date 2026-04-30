import { createClient } from '@supabase/supabase-js';

let supabaseInstance = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Supabase environment variables not found — returning null as fallback
    return null;
  }

  supabaseInstance = createClient(url, key);
  return supabaseInstance;
}
