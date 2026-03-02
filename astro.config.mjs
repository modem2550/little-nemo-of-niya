import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server', // หรือ 'hybrid' ถ้าอยากให้เร็วแบบสุดๆ
  adapter: vercel(),
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
});