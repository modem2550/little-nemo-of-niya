import { supabaseAdmin } from "../../lib/supabaseAdmin";

export async function POST({ request }) {
  try {
    const { title, date, end_date, location, link, live, image_urls } = await request.json();
    
    // Validation
    if (!title || !date || !link) {
      return new Response(
        JSON.stringify({ error: 'Title, Date และ Link จำเป็นต้องกรอก' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    if (!image_urls) {
      return new Response(
        JSON.stringify({ error: 'กรุณาอัปโหลดรูปภาพ' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }
    
    // Insert to event_data (table จริง)
    const { data, error } = await supabaseAdmin
      .from('event_data')
      .insert([{
        title,
        date,
        end_date,
        location,
        link,
        live,
        image_url: image_urls.medium, // ใช้ medium เป็น fallback
        image_urls
      }])
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
}