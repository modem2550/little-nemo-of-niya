import { supabaseAdmin } from '../../lib/supabaseAdmin';

export async function POST({ request }) {
  try {
    const formData = await request.formData();
    const eventId = formData.get('eventId');
    
    if (!eventId) {
      return new Response(
        JSON.stringify({ error: 'Missing eventId' }),
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const urls = {};
    const sizes = ['thumbnail', 'small', 'medium', 'large'];

    for (const size of sizes) {
      const file = formData.get(size);
      
      if (!file) {
        return new Response(
          JSON.stringify({ error: `Missing ${size} file` }),
          { status: 400, headers: { 'Content-Type': 'application/json' }}
        );
      }

      const filePath = `events/${eventId}/${size}.webp`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabaseAdmin.storage
        .from('event-images')
        .upload(filePath, file, {
          cacheControl: '31536000',
          upsert: true,
        });

      if (uploadError) {
        console.error(`Upload ${size} error:`, uploadError);
        return new Response(
          JSON.stringify({ error: `Upload ${size} failed: ${uploadError.message}` }),
          { status: 500, headers: { 'Content-Type': 'application/json' }}
        );
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('event-images')
        .getPublicUrl(filePath);

      urls[size] = filePath;
    }

    return new Response(
      JSON.stringify({ success: true, urls }),
      { status: 200, headers: { 'Content-Type': 'application/json' }}
    );

  } catch (error) {
    console.error('Upload API error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
}