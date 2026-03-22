import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [],

  redirects: {
    '/dem._.mo/:slug': '/api/dem._.mo/:slug'
  },

  image: {
    domains: [
      'pbs.twimg.com',
      'img2.pic.in.th',
      'img5.pic.in.th',
      'f.ptcdn.info',
      'p-u.popcdn.net',
      'encrypted-tbn0.gstatic.com'
    ],
    // แนะนำให้กำหนด remotePatterns แทน domains ในเวอร์ชันใหม่เพื่อความปลอดภัย
  },

  // ถ้าใช้สไตล์ Apple-style มักจะมีไฟล์ขนาดใหญ่ แนะนำให้บีบอัดไฟล์ตอน build
  compressHTML: true,
});