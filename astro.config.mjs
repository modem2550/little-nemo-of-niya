import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import cdnTransformer from './src/integrations/cdn-transformer.js';

export default defineConfig({
  output: 'server',
  adapter: vercel({
    webAnalytics: { enabled: true },
  }),
  integrations: [
    react(),
    cdnTransformer(),
  ],

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
          manualChunks: {},
        },
      },
      target: 'es2020',
    },
    css: {
      devSourcemap: false,
    },
  },
});