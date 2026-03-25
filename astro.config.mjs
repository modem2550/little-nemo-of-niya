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
  },

  compressHTML: true,

  vite: {
    build: {
      // minify JS ด้วย esbuild (เร็วกว่า terser)
      minify: 'esbuild',
      // แยก chunk ให้ browser cache ได้ดีขึ้น
      rollupOptions: {
        output: {
          manualChunks: {
              // แยก vendor libraries ออกมาเป็น chunk แยกgit push --set-upstream origin main
          },
        },
      },
      // กำหนด target ให้เหมาะกับ modern browsers
      target: 'es2020',
    },
    // minify CSS ตอน build
    css: {
      devSourcemap: false,
    },
  },
});