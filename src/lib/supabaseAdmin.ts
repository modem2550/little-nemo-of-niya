/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const adminToken = import.meta.env.ADMIN_TOKEN;

if (!supabaseUrl || !adminToken) {
  throw new Error(
    "Missing Supabase admin environment variables. " +
    "Please check PUBLIC_SUPABASE_URL and ADMIN_TOKEN are set."
  );
}

// Admin client - ใช้เฉพาะฝั่ง server!
const supabaseAdmin = createClient(supabaseUrl, adminToken, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export { supabaseAdmin };
