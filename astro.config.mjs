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
      'pbs.twimg.com',
      'img2.pic.in.th',
      'img5.pic.in.th',
      'f.ptcdn.info',
      'p-u.popcdn.net',
      'encrypted-tbn0.gstatic.com'
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