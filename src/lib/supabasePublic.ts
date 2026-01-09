/// <reference types="vite/client" />
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,  // client-safe
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);
<<<<<<< HEAD
=======

export const supabasePublic = supabase;
>>>>>>> 1cdb77de66938a56db584d7389ee480adb5a9df9
