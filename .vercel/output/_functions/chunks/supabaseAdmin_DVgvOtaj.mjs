import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  undefined                            ,
  undefined                                         
);
console.log(
  "ENV CHECK:",
  undefined                            ,
  undefined                                         
);

export { supabaseAdmin as s };
