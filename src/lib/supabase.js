import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
)

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("ตรวจไม่พบค่า Environment Variables ของ Supabase!");
}