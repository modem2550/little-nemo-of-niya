import { supabaseAdmin } from "../../lib/supabaseAdmin";

export async function POST({ request }) {
  try {
    const { id } = await request.json();

    console.log('Delete request received for ID:', id); // Debug

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'ไม่พบ ID' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // ลบจาก event_data (table จริง)
    const { error } = await supabaseAdmin
      .from("event_data")
      .delete()
      .eq("id", Number(id));

    if (error) {
      console.error('Supabase delete error:', error);
      return new Response(
        JSON.stringify({ error: error.message }), 
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    console.log('Delete successful for ID:', id); // Debug

    return new Response(
      JSON.stringify({ success: true }), 
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );
    
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
}

// ถ้ามีคนส่ง GET มา ให้บอกว่าต้องใช้ POST
export async function GET() {
  return new Response(
    JSON.stringify({ error: 'Method not allowed. Use POST.' }), 
    { status: 405, headers: { 'Content-Type': 'application/json' }}
  );
}