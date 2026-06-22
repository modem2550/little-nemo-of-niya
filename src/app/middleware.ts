import { defineMiddleware } from "astro:middleware";

// ─── Allowed origins for CORS ──────────────────────────────────────────────
// เฉพาะ domain ที่เว็บนี้ต้องการจริงๆ ถ้าเพิ่ม domain ใหม่ให้เพิ่มที่นี่
const ALLOWED_ORIGINS = new Set([
  "https://little-nemo-of-niya.vercel.app",
  "https://emmafans.vercel.app",
  "https://napheao.vercel.app",
]);

// ─── Image sources (ใช้ใน img-src และ connect-src สำหรับ fetch base64) ────
const IMAGE_SOURCES = [
  "pbs.twimg.com",
  "img2.pic.in.th",
  "img5.pic.in.th",
  "f.ptcdn.info",
  "p-u.popcdn.net",
  "encrypted-tbn0.gstatic.com",
  "static.wikia.nocookie.net",
  "mpics.mgronline.com",
  "img.bnk48cdn.net",
  "nipponhaku.com",
  "encrypted-tbn2.gstatic.com",
  "encrypted-tbn3.gstatic.com",
  "static.naewna.com",
  "i1.wp.com",
  "i.ytimg.com",
  "img1.pic.in.th",
  "cdn.jsdelivr.net",
  "fonts.googleapis.com",
].map((d) => `https://${d}`).join(" ");

function getAllowedOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  // อนุญาต localhost ทุก port สำหรับ dev
  if (/^https?:\/\/localhost(:\d+)?$/.test(requestOrigin)) return requestOrigin;
  return ALLOWED_ORIGINS.has(requestOrigin) ? requestOrigin : null;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const requestOrigin = context.request.headers.get("origin");
  const allowedOrigin = getAllowedOrigin(requestOrigin);

  // ─── CORS Preflight ────────────────────────────────────────────────────
  if (context.request.method === "OPTIONS") {
    if (!allowedOrigin) {
      return new Response(null, { status: 403 });
    }
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allowedOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
      },
    });
  }

  const response = await next();

  // ─── CORS Headers ──────────────────────────────────────────────────────
  if (allowedOrigin) {
    response.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Vary", "Origin");
  }

  // ─── Content Security Policy ───────────────────────────────────────────
  // หลักการ: เจาะจงที่สุดเท่าที่ทำได้ ไม่เปิด wildcard โดยไม่จำเป็น
  //
  // 'unsafe-inline' ใน script-src: ยังจำเป็นเพราะ Astro inject inline scripts
  //   → ถ้าต้องการเข้มขึ้นในอนาคต ให้ใช้ nonce ผ่าน Astro middleware
  //
  // 'unsafe-eval': ลบออกแล้ว — ไม่มี dependency ที่ต้องใช้จริง
  //   → ถ้า build พัง ให้ตรวจสอบ library ที่ใช้ก่อนเพิ่มกลับ
  const csp = [
    // default: block everything not listed
    "default-src 'self'",

    // scripts: self + Astro inline + cdnjs (dom-to-image), Vercel analytics
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://va.vercel-scripts.com https://www.googletagmanager.com https://www.google-analytics.com https://www.tiktok.com https://sf16-website-login.neutral.ttwstatic.com",

    // styles: self + inline (Astro/Bootstrap inject inline styles)
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",

    // images: self + รูปสมาชิกจาก external CDNs + data URI (base64 preview)
    `img-src 'self' data: blob: ${IMAGE_SOURCES}`,

    // fonts: self + Google Fonts
    "font-src 'self' data: https://fonts.gstatic.com https://cdn.jsdelivr.net",

    // media: self + blob (video player)
    "media-src 'self' blob: https://pub-f5a38bcc427b4a21b2e5b9667de7cfdc.r2.dev",

    // fetch/XHR: self + Supabase + image CDNs สำหรับ urlToBase64()
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://va.vercel-scripts.com https://www.google-analytics.com https://region1.google-analytics.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com https://fonts.gstatic.com ${IMAGE_SOURCES}`,

    // manifests
    "manifest-src 'self'",

    // iframes
    "frame-src 'self' https://www.youtube.com https://www.facebook.com https://www.instagram.com https://www.tiktok.com",

    // ป้องกัน clickjacking
    "frame-ancestors 'none'",

    // ปิด object/embed ที่ไม่ได้ใช้
    "object-src 'none'",

    // ป้องกัน base tag injection
    "base-uri 'self'",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  // ─── Security Headers เสริม ────────────────────────────────────────────
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  return response;
});