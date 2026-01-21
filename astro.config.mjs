import { defineConfig, envField } from 'astro/config';
import vercel from '@astrojs/vercel/server';

export default defineConfig({
  output: 'server',
  adapter: vercel(),

  env: {
    schema: {
      SUPABASE_URL: envField.string({
        context: 'server',
        access: 'secret',
      }),
      SUPABASE_ANON_KEY: envField.string({
        context: 'server',
        access: 'secret',
      }),
      ADMIN_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },

  image: {
    domains: ['kqfnhyaktxgulhitdvqq.supabase.co'],
  },

  vite: {
    ssr: {
      noExternal: ['clsx'],
    },
  },
});
