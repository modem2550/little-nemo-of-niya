import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

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

  vite: {
    ssr: {
      noExternal: [
        'astro',
        'clsx',
        'piccolore',
      ],
    },
  },
});
