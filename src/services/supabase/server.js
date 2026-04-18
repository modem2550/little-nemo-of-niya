import { createClient } from '@supabase/supabase-js';

export function getSupabase() {
  const url = import.meta.env.SUPABASE_URL;
  const key = import.meta.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase anon env vars not found');
  }

  return createClient(url, key);
}
