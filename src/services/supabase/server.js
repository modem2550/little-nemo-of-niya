import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Supabase environment variables not found — returning null as fallback
    return null;
  }

  return createClient(url, key);
}
