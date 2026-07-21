import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://little-nemo-of-niya.vercel.app',
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [react()],

  redirects: {
    '/dem._.mo/:slug': '/api/dem._.mo/:slug'
  },

  image: {
    domains: [
      'www.bnk48.com',
      'pbs.twimg.com',
      'img1.pic.in.th',
      'img2.pic.in.th',
      'img5.pic.in.th',
      'f.ptcdn.info',
      'p-u.popcdn.net',
      'encrypted-tbn0.gstatic.com',
      'encrypted-tbn2.gstatic.com',
      'encrypted-tbn3.gstatic.com',
      'static.wikia.nocookie.net',
      'mpics.mgronline.com',
      'img.bnk48cdn.net',
      'nipponhaku.com',
      'static.naewna.com',
      'i1.wp.com',
      'i.ytimg.com',
      'cdn.jsdelivr.net',
      'fonts.googleapis.com',
      'pub-f5a38bcc427b4a21b2e5b9667de7cfdc.r2.dev',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: '**.pic.in.th' },
      { protocol: 'https', hostname: '**.gstatic.com' },
      { protocol: 'https', hostname: '**.bnk48cdn.net' },
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: 'static.wikia.nocookie.net' },
    ],
  },

  compressHTML: true,

  vite: {
    build: {
      minify: 'esbuild',
      rollupOptions: {
        output: {
          // แยก React/ReactDOM เป็น vendor chunk เพื่อให้ browser cache ได้นาน
          // ไม่ต้องโหลดซ้ำเมื่อ navigate ระหว่างหน้า
          manualChunks(id) {
            if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
              return 'vendor-react';
            }
          },
        },
      },
      target: 'es2020',
      // โหลด CSS เฉพาะหน้าที่ใช้ ไม่ bundle รวมทุกอย่างไว้ในไฟล์เดียว
      cssCodeSplit: true,
      // แจ้งเตือนเฉพาะ chunk ที่ใหญ่มากจริงๆ
      chunkSizeWarningLimit: 600,
    },
    css: {
      devSourcemap: false,
    },
  },
});