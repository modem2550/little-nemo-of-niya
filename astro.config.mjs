import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel'; // ตรวจสอบว่าใช้ /serverless หรือ /edge

export default defineConfig({
  output: 'server', // หรือ 'hybrid'
  adapter: vercel(),
  image: {
    domains: ['https://kqfnhyaktxgulhitdvqq.supabase.co'],
  },
  redirects: {
    '/events-images/[...slug]': 'https://kqfnhyaktxgulhitdvqq.supabase.co/storage/v1/object/public/event-images/events/[...slug]'
  },
});