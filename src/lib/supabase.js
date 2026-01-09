import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("ตรวจไม่พบค่า Environment Variables ของ Supabase!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase };