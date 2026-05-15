import { createClient } from '@supabase/supabase-js';

const url = 'https://kqfnhyaktxgulhitdvqq.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxZm5oeWFrdHhndWxoaXRkdnFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NTIxMzQsImV4cCI6MjA4MzIyODEzNH0.pwtVfQJ2vmJCTLOYW8p8FH9M56qXBJL_rDCvfNWvvmA';

const supabase = createClient(url, key);

async function check() {
    const { data, error } = await supabase.from('members').select('*').limit(1);
    if (error) console.error(error);
    else console.log(Object.keys(data[0]));
}

check();
