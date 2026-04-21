import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.warn('[getSupabase] Supabase env vars not found — returning null');
    return null;
  }

  return createClient(url, key);
}
