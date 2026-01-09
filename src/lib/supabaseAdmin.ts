// lib/supabaseAdmin.ts
import { createClient } from "@supabase/supabase-js";

// อ่าน Environment Variables จาก server (Vercel / local)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// เช็คก่อนว่ามีค่า
if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    "Environment Variables ของ Supabase Admin ไม่ถูกตั้งค่า! โปรดตรวจสอบ SUPABASE_URL และ SUPABASE_SERVICE_ROLE_KEY"
  );
}

// สร้าง Supabase client สำหรับ server-side (full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
