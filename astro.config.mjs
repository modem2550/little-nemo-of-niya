import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel/serverless';

export default defineConfig({
  output: 'server',

  adapter: vercel(),

  image: {
    domains: ['kqfnhyaktxgulhitdvqq.supabase.co'],
  },

  redirects: {
    '/events-images/[...slug]':
      'https://kqfnhyaktxgulhitdvqq.supabase.co/storage/v1/object/public/event-images/events/[...slug]',
  },

  ssr: {
    noExternal: ['clsx', 'piccolore'],
  },
});
