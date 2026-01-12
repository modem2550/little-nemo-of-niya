/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly ADMIN_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}