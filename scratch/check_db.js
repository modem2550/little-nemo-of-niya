import { getSupabase } from './src/services/supabase/server.js';

async function test() {
    const supabase = getSupabase();
    if (!supabase) {
        console.log("Supabase client is null");
        return;
    }
    const { data, error } = await supabase.from('members').select('brand').limit(10);
    if (error) {
        console.error("Error:", error);
    } else {
        console.log("Sample brands:", data.map(m => m.brand));
    }
}

test();
