import { supabaseAdmin } from "../../lib/supabaseAdmin";

export async function POST({ request }) {
  try {
    // เปลี่ยนจาก formData เป็น json
    const { id } = await request.json();

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ไม่พบ ID' }), 
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { error } = await supabaseAdmin
      .from("event_data")
      .delete()
      .eq("id", Number(id));

    if (error) {
      console.error('Supabase error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ error: err.message }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}