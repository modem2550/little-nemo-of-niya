// src/pages/dem._.mo/[slug].ts
import type { APIRoute } from 'astro';
import { getSupabase } from '../../lib/supabase.server';

export const GET: APIRoute = async ({ params, url }) => {
  const { slug } = params;
  if (!slug) return new Response(null, { status: 404 });

  // ดึง ID ออกจากท้าย Slug (ตัวเลขหลังขีดสุดท้าย)
  const parts = slug.split('-');
  const idPart = parts[parts.length - 1]; 
  
  if (!idPart) return new Response("Invalid Slug", { status: 404 });

  const requestedSize = url.searchParams.get('size') || 'medium';
  const supabase = getSupabase();

  try {
    // 💡 ปรับการ Query: ถ้า ID คุณเป็นตัวเลข ให้ใช้ .eq("id", parseInt(idPart))
    // ถ้า ID เป็น UUID หรือข้อความ ให้ใช้ .ilike หรือ .eq ปกติ
    // ลองใช้ .eq ค้นหาให้ตรงตัวก่อน เพราะเราส่ง ID มาเต็มๆ อยู่แล้วจาก generateEventSlug
    const { data: event, error } = await supabase
      .from("event_data") // ตรวจสอบชื่อตารางอีกครั้งว่า event_data หรือ events_upcoming
      .select("image_url, image_urls")
      .eq("id", idPart) 
      .maybeSingle(); // ใช้ maybeSingle เพื่อไม่ให้ throw error ถ้าไม่เจอ

    if (error || !event) {
      console.error("Database Error:", error);
      return new Response("Image Mapping Not Found", { status: 404 });
    }

    let originalUrl = event.image_url;
    if (event.image_urls) {
      originalUrl = requestedSize === 'large' 
        ? (event.image_urls.large || event.image_urls.medium) 
        : (event.image_urls.medium || event.image_urls.small);
    }

    if (!originalUrl) return new Response("No URL found", { status: 404 });

    // ดึงรูปจากต้นทาง
    const imgRes = await fetch(originalUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    if (!imgRes.ok) return new Response("Source image error", { status: imgRes.status });

    const buffer = await imgRes.arrayBuffer();
    return new Response(buffer, {
      headers: {
        "Content-Type": imgRes.headers.get("content-type") || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });

  } catch (e) {
    return new Response("Internal Error", { status: 500 });
  }
};