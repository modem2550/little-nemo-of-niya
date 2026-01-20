import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://kqfnhyaktxgulhitdvqq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZm5oeWFrdHhndWxoaXRkdnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NTIxMzQsImV4cCI6MjA4MzIyODEzNH0.pwtVfQJ2vmJCTLOYW8p8FH9M56qXBJL_rDCvfNWvvmA";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase as s };
