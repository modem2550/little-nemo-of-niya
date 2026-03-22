interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_ANON_KEY: string;
  readonly ADMIN_TOKEN?: string;
  readonly SPEED_INSIGHTS_TOKEN?: string;
}

declare global {
  interface Window {
    va?: (...args: any[]) => void;
    vaq?: any[];
    vam?: string;
  }
}

export {};