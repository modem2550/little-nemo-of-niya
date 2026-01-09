import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,  // client-safe
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
